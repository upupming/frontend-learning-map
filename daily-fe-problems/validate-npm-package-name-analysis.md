# validate-npm-package-name 源码解析

源码链接: https://github.com/npm/validate-npm-package-name/blob/0995a973d077561de79bbb069657cb810fc30ac5/index.js

川哥这次给的源码阅读比较简单，主要是在规则的理解上，看完 `validate-npm-package-name` 它的 `README.md` 我其实就大概猜到他会怎么去实现这个包的代码了。这里主要讨论一下我关注的几点。

## Demo

```js
t.deepEqual(validate('ifyouwanttogetthesumoftwonumberswherethosetwonumbersarechosenbyfindingthelargestoftwooutofthreenumbersandsquaringthemwhichismultiplyingthembyitselfthenyoushouldinputthreenumbersintothisfunctionanditwilldothatforyou-'), {
    validForNewPackages: false,
    validForOldPackages: true,
    warnings: ['name can no longer contain more than 214 characters']
  })
```

## `validForNewPackages` vs `validForOldPackages`

npm 最早对包名的要求比较宽松，现在加强了限制。`validForOldPackages` 为 `true` 只表示以前的规则是支持的，但是现在的新规则可能不支持，不支持的话 `validForNewPackages` 就会为 `false`。

`validate` 函数返回的对象中有 `warnings` 和 `errors` 两个数组（数组为空的话会用 `delete` 删除这个属性），如果有 error，那么 `validForOldPackages` 就为 `false`，如果有 error 或者 warning，那么 `validForNewPackages` 就为 `false`。

```js
var done = function (warnings, errors) {
  var result = {
    validForNewPackages: errors.length === 0 && warnings.length === 0,
    validForOldPackages: errors.length === 0,
    warnings: warnings,
    errors: errors
  }
  if (!result.warnings.length) delete result.warnings
  if (!result.errors.length) delete result.errors
  return result
}

```

新旧规则的差别体现新规则不允许以下 3 中情况：

```js
// really-long-package-names-------------------------------such--length-----many---wow
  // the thisisareallyreallylongpackagenameitshouldpublishdowenowhavealimittothelengthofpackagenames-poch.
  if (name.length > 214) {
    warnings.push('name can no longer contain more than 214 characters')
  }

  // mIxeD CaSe nAMEs
  if (name.toLowerCase() !== name) {
    warnings.push('name can no longer contain capital letters')
  }

  if (/[~'!()*]/.test(name.split('/').slice(-1)[0])) {
    warnings.push('name can no longer contain special characters ("~\'!()*")')
  }
```

## node.js 自带模块的判定

不允许和 node.js 自带模块重名，直接使用了 `builtins` 包，内部就是一个 JSON 文件，这个包很特殊，我第一次见到 package.json 的  `main` 字段可以传 JSON 而不是 js 的：

```json
// node_modules/builtins/package.json
"main": "builtins.json",
```

## URL-safe characters

包名中不允许 URL 不安全的字符。那么 URL 不安全字符有哪些？字符是否 URL 安全是如何判定的呢？

[这个回答](https://stackoverflow.com/a/695467/8242705)列出了不安全的字符，例如 & $ + : # < > % 这些。至于判定的话其实很简单，对于安全的字符，在使用百分号编码前后肯定是不变的，因此呢在代码里面直接使用了 `encodeURIComponent` 函数：

```js
// encode 前后发生了变化，说明有 URL 不安全字符
if (encodeURIComponent(name) !== name) {
    // ...

    errors.push('name can only contain URL-friendly characters')
  }

  return done(warnings, errors)
}
```

## scoped package

`@user/package` 这种形式的情况需要特殊处理一下。主要是 `/` 本身也是 URL 不安全的，因此需要正则匹配之后分成 `user` 和 `package` 两段分别去判断是否 URL 安全就好了：

```js
if (encodeURIComponent(name) !== name) {
    // Maybe it's a scoped package name, like @user/package
    var nameMatch = name.match(scopedPackagePattern)
    if (nameMatch) {
      var user = nameMatch[1]
      var pkg = nameMatch[2]
      if (encodeURIComponent(user) === user && encodeURIComponent(pkg) === pkg) {
        return done(warnings, errors)
      }
    }

    errors.push('name can only contain URL-friendly characters')
}
```

## 收获

了解了 `builtins` 这个包，发现自己有很多 node 的内置模块听都没听说过，之后还是要深入了解。这个包本身的代码比较简单，测试考虑了名称长为 0 和刚好边界情况这些极端 case，代码质量挺高的。
