# Vue 的 nextTick 原理

- Vue 的 DOM 更新是异步的，修改数据时，视图不会立即更新，而是会监听数据的变化，并缓存在同一事件循环中，等同一事件循环的所有数据变化完成之后，在统一进行视图更新。为确保得到更新后的 DOM，所以设置了 Vue.nextTick() 方法。
- 改变 DOM 数据并不会立即生效，可以在 nextTick 访问，能够确保改变生效了。同一事件循环中的数据变化后，DOM 完成更新，立即执行 Vue.nextTick 事件。
- MutationObserver 是 HTML5 的 API，属于微任务，可以监听原生 DOM 的状态变化。

nextTick 源码主要分为能力检测和根据能力检测以不同的方式执行回调队列。

- 能力检测（if else 判断），如果能用微任务，尽量用微任务，不行再用宏任务。
- 核心利用 Promise、MutationObserver、setImmediate、setTimeout 的原生 JavaScript 来实现的，模拟异步回调队列。

## 参考资料

1. https://github.com/lgwebdream/FE-Interview/issues/263
