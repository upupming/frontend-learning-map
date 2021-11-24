# 为什么 React hooks 不能写在 if 判断中

[官方文档](https://reactjs.org/docs/hooks-rules.html)已经给出了原因：

> React relies on the order in which Hooks are called

简单来说，条件语句会导致 hook 被调用的次序发生变化，但是 React hooks 是依赖 hook 被调用的次序来决定该返回什么值的，因此条件语句会导致 hook 失效。

那么 React hook 具体的实现原理是什么样的呢？

有一篇详细介绍的文章: https://zhuanlan.zhihu.com/p/357232384

React 使用链表来实现 Hook 的查找，PReact 使用索引来实现。

https://overreacted.io/why-do-hooks-rely-on-call-order/
