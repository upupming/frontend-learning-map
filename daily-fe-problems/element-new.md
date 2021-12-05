# Element UI 新建组件脚本

对应源码: https://github.com/ElemeFE/element/blob/dev/build/bin/new.js

运行方法:

```bash
❯ node build/bin/new.js my-component

DONE!
```

结果如下：

![20211205210014](https://s2.loli.net/2021/12/05/Syr65i4ePwacsVg.png)

可以看到结果：

- 在 `components.json`, `nav.config.json`, `index.scss`, `element-ui.d.ts` 中加入了新组建对应的信息。
- 新建的 4 个 `my-component.md` 是 4 个不同语言下的 使用文档。
- 在 `packages` 下新建了 `my-component` 目录，有一套模板代码，包含
    - `index.js`
    - `main.vue`
- 在 `packages/theme-chalk` 下新建了 `my-component.scss` 文件来给组件加样式，这个比较有意思的是样式是放在主题里面而不是组件自己的文件夹里面，这样的设计可以比较好地进行主题的切换。
- 在 `test/unit/specs` 里面新加一个 `my-component.spec.js`，包含单元测试的样板代码。

总的来说逻辑非常简单清晰。这个 `new.js` 我感觉不依赖任何 npm 包也可以去简单地进行实现。主要就是一些新建文件的逻辑，可以直接用 Node.js 原生的 `fs` 包来处理，然后读取命令行参数主要用 `process.argv` 就行了，没有太大必要引入复杂的命令行解析工具，例如 `minimist` 啥的。

在它的实现中，实际上是用到了 `file-save` 和 `uppercamelcase` 这两个 npm 包:

- `file-save`: 用来写入文件的，我觉得完全可以用 `fs.writeFile` 来替代。
- `uppercamelcase`: 自动将 `my-component` 转换为 `MyComponent`，其实这个也比较容易直接用原生 JS 实现

    ```txt
    ❯ node
    Welcome to Node.js v16.13.0.
    Type ".help" for more information.
    > 'my-component'.split('-').map(s => s[0].toUpperCase() + s.slice(1)).join('')
    'MyComponent'
    ```

- 另外一个比较好的设计是不要重复你所写过的代码，因此他在新建文件的时候是将 `Files` 数组中每一个函数执行了同样的逻辑，去用给定的字符串内容创建对应的文件。
- 另外在想要往 `element-ui.d.ts` 里面一句新的 `import` 到现有的最后一行 `import` 语句的后面也是直接用的字符串匹配，简单高效，并没有引入 AST（显然也完全不需要）。
- 对于 JSON 文件想要增加内容，最简单高效地方法还是先 `JSON.parse`（Node.js 支持直接 require('xxx.json')），增加完属性，然后再 `JSON.stringify`。
