# VSCode WebView 开发架构

> 这里当做 VSCode WebView 相关的笔记，现在还没好好写，后续逐渐新增内容。

这次打算尝鲜一下 next.js，next 本身是为 vercel 部署做的优化比较多，在服务端渲染这方面优势很大，但是我们并不需要其服务端渲染的特性，因此直接使用 next export 生成静态资源就行了。注意生成的 html 里面默认情况下。

因为 WebView 只能直接设置 HTML 来改变其内容，所以最好的办法还是只有一个 HTML 文件、一个 JS 文件、一个 CSS 文件，不需要做任何的 code splitting 是最好的。但是从现有的 nextjs 的方案来看，是会分 chunk 的。

next 不支持 export watch mode: https://github.com/vercel/next.js/issues/11360，所以感觉应该没法用这个。

最后我不得不自己参考 Vite 的 React TS 模板自己写了一个模板：https://github.com/upupming/esbuild-react-less 。后面就打算在插件里面用这个模板了，速度应该会快很多。

## 参考资料

1. https://code.visualstudio.com/api/extension-guides/webview
