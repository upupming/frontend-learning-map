# 为什么 esbuild 那么快

- esbuild 是 figma 的 CTO Evan Wallace 开发的，用的是 go 语言，一开始就将性能作为了最主要的考虑，go 也确实快于传统的 JS 编写的打包工具
    - esbuild 能够利用 Go 语言的编译成原生程序，能够有效进行多线程开发，设计较好的并行
    - esbuild 没有任何第三方依赖
    - esbuild 内存利用效率高
- benchmark 显示同一份打包任务，esbuild 只需要 0.37s，但是 Webpack 5 却需要 55.25s
- esbuild 提供了 JS 和 Go 语言的 API
    - go 语言和 JS 是如何进行 binding 的？
- vite 中使用 esbuild 的地方主要是用来做 optimizer 和进行 TS 编译，但是还是使用的 rollup 来进行打包，主要是 esbuild 在打包方面不是特别成熟，还有代码分片和 CSS 处理很多工作要做。
- 虽然 es module 是大势所趋，但是还是需要打包的，如果不打包的话，嵌套层数太深，请求次数太多，会导致很多 Round Trip，跟原来的一个请求拿到整个 bundle 相比，客户端性能表现还是会差很多。

## 参考链接

1. https://mp.weixin.qq.com/s/BqBvreKzf5ImombAlOV2pA
