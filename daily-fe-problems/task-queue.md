# 任务队列、事件循环、宏任务、微任务

- 调用栈（Call Stack）/执行栈（Execution Context Stack）: 后进先出（LIFO），调用栈上存放执行期间所有的执行上下文
    - 调用一个函数，就将函数的上下文压入栈，执行值之后会清楚调用栈，执行上层的上下文中的剩余代码，栈空间不够会报错

## 任务队列与事件循环的引入

JS 是单线程的，这一点已经在很多地方体现了，如果执行一个耗时很长的同步任务（请求数据、定时器、读取文件），会造成后面的执行语句等待这个同步任务，造成页面卡顿。

浏览器有 Browser、Render、Plugin、GPU 这几个进程，Render 进程代表一个 Tab 窗口，有一个主线程，需要处理 DOM、计算样式、处理布局、处理 JS 任务和各种输入。需要有一个统筹调度系统来调度这些任务。

- 事件循环: 在线程运行的过程中接收并执行新的任务
- 消息（任务）队列: 接收其他线程发送的消息，FIFO

异步任务在等待异步函数的**回调函数之后**，推入到任务队列中，例如 setTimeout 是在时间结束后，会把执行函数推入任务队列中，当主线程清空后，即所有同步任务结束后，解释器会读取任务队列，并依次将已完成的异步任务加入调用栈中并执行。

JS 引擎线程是单线程，但是浏览器必须要利用一些其他的线程处理一些典型的异步任务：

- GUI渲染线程
- http异步网络请求线程：处理用户的get、post等请求，等**返回结果后**将回调函数推入到任务队列
- 定时触发器线程：setInterval、setTimeout**等待时间结束后**，会把执行函数推入任务队列中
- 浏览器事件处理线程：将**click、mouse等UI交互事件发生后**，将要执行的回调函数放入到事件队列中

## 宏任务队列和微任务队列

- 宏任务队列（Task Queue）：script、setTimeout、setInterval、IO、UI 交互事件、postMessage、MessageChannel、setImmediate（Node.JS）
- 微任务队列（Microtask Queue）：Promise.then、Object.observe、MutationObserver、process.nextTick（Node.JS 环境）

## 事件循环

事件循环（Event Loop）系统负责监听并执行消息队列中的任务，任务队列的执行过程调度靠的就是事件循环。

- 宏任务队列
    - 按照入队顺序依次执行宏任务，放入调用栈
    - 执行完宏任务下的所有同步任务，调用栈清空，微任务队列开始按照入队顺序、依次执行完其中所有的微任务
- 接着返回下一个宏任务，开始第二个事件循环

第一个宏任务往往是 script 标签中的代码。

如果在执行微任务的过程中，产生新的微任务添加到微任务队列中，也需要一起清空；**微任务队列没清空之前，是不会执行下一个宏任务的。**

微任务和宏任务是绑定的，每个宏任务在执行时，会创建自己的微任务队列。微任务的执行时长会影响到当前宏任务的时长。比如一个宏任务在执行过程中，产生了 100 个微任务，执行每个微任务的时间是 10 毫秒，那么执行这 100 个微任务的时间就 是 1000 毫秒，也可以说这 100 个微任务让宏任务的执行时间延长了 1000 毫秒。所以 你在写代码的时候一定要注意控制微任务的执行时长。在一个宏任务中，分别创建一个用于回调的宏任务和微任务，无论什么情况下，微任务都 早于宏任务执行。

## 具体例子

需要注意的是 Promise 在 new 的时候就会立即执行定义函数里面的代码，然后 resolve() 之后会将后面的一连串 .then 放入一个微任务，然后等待执行。具体来说可以看 https://segmentfault.com/q/1010000022578087 :

```js
setTimeout(function () {
    console.log('a')
}, 0);


new Promise(function (resolve) {
    console.log('b');

    for (let i = 0; i < 10000; i++) {
        i == 99 && resolve();
    }

}).then(function () {
    console.log('c')
}).then(function () {
    console.log('d')
});

console.log('e');
/*
b
e
c
d
a
*/
```

```js
new Promise((resolve, reject) => {
    console.log('11')
    resolve()
}).then(() => {
    console.log('12')
})

new Promise((resolve, reject) => {
    console.log('21')
    resolve()
}).then(() => {
    console.log('22')
})
/*
11
21
12
22
*/
```

```js
new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve()
    }, 0)
}).then(() => {
    console.log('resolved1')
})
new Promise((resolve, reject) => {
    resolve()
}).then(() => {
    console.log('resolved2')
})
console.log('sync')
/*
sync
resolved2
resolved1
*/

```

关于 Promise 真的是一个人一个理解的方法，不管了，只要得出来的表现一致就好了。只要理解了上面 3 个例子就 OK 了。

## 参考链接

1. https://mp.weixin.qq.com/s/H9rbU_HNRuzhM0slBws5tg
2. http://latentflip.com/loupe
