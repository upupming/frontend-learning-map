# update-notifier 源码解析

## 基本使用

update-notifier 功能比较简单，就是通过比较 `package.json` 中的 name 和 version 定义字段和当前 npm registry 上的最新版，然后通知一下用户有哪些更新。

![2021-09-17](https://i.loli.net/2021/09/17/1GKn6Oy7rdTkIDo.png)

它的 README.md 里面有两个使用的例子:

```js
const updateNotifier = require('update-notifier');
const pkg = require('./package.json');

updateNotifier({pkg}).notify();
```

```js
const updateNotifier = require('update-notifier');
const pkg = require('./package.json');

// Checks for available update and returns an instance
const notifier = updateNotifier({pkg});

// Notify using the built-in convenience method
notifier.notify();

// `notifier.update` contains some useful info about the update
console.log(notifier.update);
/*
{
	latest: '1.0.1',
	current: '1.0.0',
	type: 'patch', // Possible values: latest, major, minor, patch, prerelease, build
	name: 'pageres'
}
*/
```

可以看到，使用的时候需要传一个 `package.json` 读出来后的 object，后续的判断都是基于 `package.json` 里面的 `name` 字段和 `version` 字段来做的，为了获取当前最新版本，肯定也是需要获取这个 package 当前最新的版本号，肯定是要发起网络请求的，我们后续可以注意一下是怎么实现的。另外它是如何实现这个在命令行绘制这个框框的，也可以借鉴一下。

项目根目录有一个 `example.js`，可以直接用 node 运行，这里 `updateCheckInterval` 的意思是，如果有更新的话，会等待 `updateCheckInterval` 这么长时间之后再告知用户。

```js
'use strict';
const updateNotifier = require('.');

// Run: $ node example

// You have to run this file two times the first time
// This is because it never reports updates on the first run
// If you want to test your own usage, ensure you set an older version

updateNotifier({
	pkg: {
		name: 'public-ip',
		version: '0.9.2'
	},
	updateCheckInterval: 0
}).notify();

```

但是运行这个 `example` 发现，第一次运行不会有任何提示，而是第二次运行之后才会出现更新提示，这个刚开始用感觉可能比较迷惑。但是仔细想想是没有问题的，比如 `updateCheckInterval` 的值直接取默认的一周的话，如果周一检查的时候已经给过通知，但是用户看到通知并没有更新，那么周二就不会给通知了（避免过多地打扰用户），而是需要等一周之后再检查的话才会有新的通知。这样就容易解释 `example` 为什么第一次运行不会给通知了，因为没有上次检查记录，无法对比两次时间间隔，因此就直接干脆不给通知了。

## 深入源码

我比较关心的主要是获取最新版本、如何存储本次检查的信息供下次使用、以及如何打印那个方框框的信息，因此我将重点看一下这部分的内容，其他部分就粗略带过。

### 一些有用的 util 函数

`is-ci` 这个库可以用来判断是否处于 CI 环境，这个库调用了 `require('ci-info').isCI`，其实现是通过环境变量判断的。

```js
// import-lazy 主要的作用是真正用到这个 isCi() 函数的时候，才会尝试去 require 它对应的 npm 包，类似于 webpack 的 lazy loading: https://webpack.js.org/guides/lazy-loading/
const importLazy = require('import-lazy')(require);
const isCi = importLazy('is-ci');
this.disabled = 'NO_UPDATE_NOTIFIER' in process.env ||
			process.env.NODE_ENV === 'test' ||
			process.argv.includes('--no-update-notifier') ||
			isCi();
```

### 获取最新版本

主要是 `fetchInfo` 函数，获取最新版本是直接调 `latest-version` 包来实现的，而 `latest-version` 又是调用 `package-json` 来实现的，`package-json` 内部是用 `got` 发起网络请求确定的:

```js
// update-notifier
async fetchInfo() {
	const {distTag} = this.options;
	const latest = await latestVersion()(this.packageName, {version: distTag});

	return {
		latest,
		current: this.packageVersion,
		type: semverDiff()(this.packageVersion, latest) || distTag,
		name: this.packageName
	};
}
```

```js
// latest-version
import packageJson from 'package-json';

export default async function latestVersion(packageName, options) {
	const {version} = await packageJson(packageName.toLowerCase(), options);
	return version;
}
```

```js
// package-json
const registryUrl = require('registry-url');
const registryUrl_ = options.registryUrl || registryUrl(scope);
const packageUrl = new URL(encodeURIComponent(packageName).replace(/^%40/, '@'), registryUrl_);

const gotOptions = {
		json: true,
		headers,
		agent: {
			http: httpAgent,
			https: httpsAgent
		}
	};

response = await got(packageUrl, gotOptions);
let data = response.body;
data.versions[data['dist-tags'][version]]
```

> 这些轮子全是 https://github.com/sindresorhus 造的，不得不佩服真的高产。

### 持久存储 update 信息

信息存储用的是 `configure` 这个库来实现的:

```js
const configstore = importLazy('configstore');
const ConfigStore = configstore();
// 创建一个 JSON 文件用来存储后续的新版本的检查结果
this.config = new ConfigStore(`update-notifier-${this.packageName}`, {
	optOut: false,
	// Init with the current time so the first check is only
	// after the set interval, so not to bother users right away
	lastUpdateCheck: Date.now()
});
```

运行完 `example.js`，可以看到最终在 `~/.config/configstore/update-notifier-public-ip.json` 中有如下内容：

```json
{
	"optOut": false,
	"lastUpdateCheck": 1631892544390,
	"update": {
		"latest": "4.0.4",
		"current": "0.9.2",
		"type": "major",
		"name": "public-ip"
	}
}
```

是在 `check.js` 里面进行设置：

```js
// Only update the last update check time on success
updateNotifier.config.set('lastUpdateCheck', Date.now());

if (update.type && update.type !== 'latest') {
	updateNotifier.config.set('update', update);
}
```

### 打印 notifier

主要是 `notifier` 函数：

```js
// 检查是否是 npm 环境
const isNpm = importLazy('is-npm');
const boxen = importLazy('boxen');
notify(options) {
	const suppressForNpm = !this.shouldNotifyInNpmScript && isNpm().isNpmOrYarn;
	if (!process.stdout.isTTY || suppressForNpm || !this.update || !semver().gt(this.update.latest, this.update.current)) {
		return this;
	}

	options = {
		isGlobal: isInstalledGlobally(),
		isYarnGlobal: isYarnGlobal()(),
		...options
	};

	// 展示给用户如何安装的指令
	let installCommand;
	if (options.isYarnGlobal) {
		installCommand = `yarn global add ${this.packageName}`;
	} else if (options.isGlobal) {
		installCommand = `npm i -g ${this.packageName}`;
	} else if (hasYarn()()) {
		installCommand = `yarn add ${this.packageName}`;
	} else {
		installCommand = `npm i ${this.packageName}`;
	}

	// 可以看到这就是框框内的内容，颜色是用 chalk 定下来的
	const defaultTemplate = 'Update available ' +
		chalk().dim('{currentVersion}') +
		chalk().reset(' → ') +
		chalk().green('{latestVersion}') +
		' \nRun ' + chalk().cyan('{updateCommand}') + ' to update';

	const template = options.message || defaultTemplate;

	// 框框的默认配置，黄色圆角
	options.boxenOptions = options.boxenOptions || {
		padding: 1,
		margin: 1,
		align: 'center',
		borderColor: 'yellow',
		borderStyle: 'round'
	};

	// 使用 pupa 库，对模板字符串 '{currentVersion}'、'{latestVersion}' 和 '{updateCommand}' 进行替换，内部就是一个正则替换
	// 使用 boxen 库，将消息传入即可，内部使用了 cli-boxes，实现逻辑比较复杂没细看
	const message = boxen()(
		pupa()(template, {
			packageName: this.packageName,
			currentVersion: this.update.current,
			latestVersion: this.update.latest,
			updateCommand: installCommand
		}),
		options.boxenOptions
	);

	// 最后打印出这个框框来就行了
	if (options.defer === false) {
		console.error(message);
	} else {
		process.on('exit', () => {
			console.error(message);
		});

		process.on('SIGINT', () => {
			console.error('');
			process.exit();
		});
	}

	return this;
}
```

## 总结

其实感觉很高大上的东西，看完之后发现是一堆调包操作，感觉没意思了，不过以后可以尝试用到这些包了，有空深入研究其中每个包是如何实现的。

## 参考链接

1. https://github.com/yeoman/update-notifier.git
