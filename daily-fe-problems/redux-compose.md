# Redux compose 源码解读

之前使用过 `react-redux`，但是一直没有搞明白它的实现原理是怎么样的，正好昨天看了 `koa-compose`，而 redux 的 `applyMiddleware` 中用到的 `compose` 也是同样地利用了「职责链模式」这种设计模式，川哥也写了[解读](https://github.com/lxchuan12/redux-analysis/blob/ebe5c674fea1582b731422af95f0d96618dcd115/README.md)，我也就来分析一下。

在 redux 中 middleware 可以理解为对一个 dispatch 做一些预处理，多个 middleware 嵌套就是用 `applyMiddleware` 中的 `compose` 来实现的。而 reducer 则是对 state 进行改变的函数。见下图（来自川哥）：

![2021-09-11](https://i.loli.net/2021/09/11/WYs51oTedPUE4wM.png)

redux 可以脱离 react 而使用，但是 vuex 则必须依赖 vue。我们来看一下 redux 使用最基础的 demo:

```js
// counter 是一个 reducer，之所以取名 reducer 是因为它和 Array.prototype.reduce 接收的 reducer 参数很像
// Array.prototype.reduce 属于一种高阶函数，它将其中的回调函数 reducer 递归应用到数组的所有元素上并返回一个独立的值。
// redux 的 reducer 则是接收旧状态 state 和一个 action，返回一个新状态
function counter (state, action) {
  if (typeof state === 'undefined') {
    return 0
  }

  switch (action.type) {
    case 'INCREMENT':
      return state + 1
    case 'DECREMENT':
      return state - 1
    default:
      return state
  }
}

// 有 3 中调用方式
// Redux.createStore(reducer)
// Redux.createStore(reducer, enhancer), 其中 enhancer 就是 applyMiddleware 返回的一个用来增强 store 的 dispatch 和 getState 的函数
// Redux.createStore(reducer, preloadedState, enhancer)，可以看到只传 2 个参数的时候第二个不太一样，是 enhancer 而不是 preloadedState，因为 createStore 内部对参数个数做了判断处理
// 这里的 Redux.applyMiddleware(logger1, logger2,  logger3) 就是一个 enhancer
const store = Redux.createStore(counter, Redux.applyMiddleware(logger1, logger2,  logger3))
const valueEl = document.getElementById('value')

function render () {
  valueEl.innerHTML = store.getState().toString()
}

render()
// 订阅之后每次 store 的 state 有更新，就调用 render 函数
// subscribe 返回一个函数，可以用来取消订阅
store.subscribe(render)

document.getElementById('increment')
  .addEventListener('click', function () {
    store.dispatch({ type: 'INCREMENT' })
  })

document.getElementById('decrement')
  .addEventListener('click', function () {
    store.dispatch({ type: 'DECREMENT' })
  })

document.getElementById('incrementIfOdd')
  .addEventListener('click', function () {
    if (store.getState() % 2 !== 0) {
      store.dispatch({ type: 'INCREMENT' })
    }
  })

document.getElementById('incrementAsync')
  .addEventListener('click', function () {
    setTimeout(function () {
      store.dispatch({ type: 'INCREMENT' })
    }, 1000)
  })


/**
     * middleware
     * @author 若川
     * @date 2020-06-06
     * @link https://lxchuan12.cn
     */

function logger1({ getState }) {
  return next => action => {
      console.log('will dispatch--1--next, action:', next, action)

      // Call the next dispatch method in the middleware chain.
      const returnValue = next(action)

      console.log('state after dispatch--1', getState())

      // This will likely be the action itself, unless
      // a middleware further in chain changed it.
      return returnValue
  }
}

function logger2({ getState }) {
  return function (next){
      return function (action){
          console.log('will dispatch--2--next, action:', next, action)

          // Call the next dispatch method in the middleware chain.
          const returnValue = next(action)

          console.log('state after dispatch--2', getState())

          // This will likely be the action itself, unless
          // a middleware further in chain changed it.
          return returnValue
      }
  }
}

function logger3({ getState }) {
  return function (next){
      return function (action){
          console.log('will dispatch--3--next, action:', next, action)

          // Call the next dispatch method in the middleware chain.
          const returnValue = next(action)

          console.log('state after dispatch--3', getState())

          // This will likely be the action itself, unless
          // a middleware further in chain changed it.
          return returnValue
      }
  }
}
```

中间件的输出和 `koa-compose` 是一样的：

```bash
will dispatch--1--next, action: ...
will dispatch--2--next, action: ...
will dispatch--3--next, action: ...
state after dispatch--3
state after dispatch--2
state after dispatch--1
```

主角就是在 `applyMiddleware` 这个函数，源码和解析如下：

```js
// src/compose.js
export default function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg
  }

  if (funcs.length === 1) {
    return funcs[0]
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)))
}
// 可以认为 compose([fn0, fn1, fn2, ...（省略号而不是展开运算符）, fnN]) 返回一个函数 (...args) => fn0(fn1(fn2(...（省略号而不是展开运算符）fnN(...args))))
// 当然实际的箭头函数嵌套层数要深

// src/applyMiddleware.js
// 返回一个 enhancer，这个 enhancer 接收 createStore，返回增强后的 store
export default function applyMiddleware(...middlewares) {
  return createStore => (...args) => {
    // 不使用 enhancer 直接创建一个 store，创建完之后再利用 middlewares 进行功能增强
    const store = createStore(...args)
    // applyMiddleware 还没执行完的话，dispatch 会报错
    let dispatch = () => {
      throw new Error(
        'Dispatching while constructing your middleware is not allowed. ' +
          'Other middleware would not be applied to this dispatch.'
      )
    }

    const middlewareAPI = {
      getState: store.getState,
      dispatch: (...args) => dispatch(...args)
    }
    // 给每个中间件传入 getState 和 dispatch 并执行，这样中间件中 `function logger1({ getState }) {` 这一层就执行完了，返回一个接收 next 函数的高阶函数
    const chain = middlewares.map(middleware => middleware(middlewareAPI))
    // 从右到左执行 chain 中每一个高阶函数，最右边 logger3({ getState }) 接收的 next 是 store.dispatch，然后对其增强一些功能，如此经过 logger2, logger1，store.dispatch 的功能已经被所有中间件增强了，然后返回最终的 dispatch 这样在后续就可以被调用了
    dispatch = compose(...chain)(store.dispatch)

    return {
      ...store,
      dispatch
    }
  }
}

```

`createStore` 内部对 `enhancer` 的调用方式：

```js
export default function createStore(reducer, preloadedState, enhancer) {
  if (
    (typeof preloadedState === 'function' && typeof enhancer === 'function') ||
    (typeof enhancer === 'function' && typeof arguments[3] === 'function')
  ) {
    throw new Error(
      'It looks like you are passing several store enhancers to ' +
        'createStore(). This is not supported. Instead, compose them ' +
        'together to a single function.'
    )
  }

  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState
    preloadedState = undefined
  }

  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.')
    }

    return enhancer(createStore)(reducer, preloadedState)
  }

  // 省略数百行...

  return {
    dispatch,
    subscribe,
    getState,
    replaceReducer,
    [$$observable]: observable
  }
```

## 参考链接

1. [Redux中的reducer到底是什么，以及它为什么叫reducer？](https://zhuanlan.zhihu.com/p/25863768)
2. https://github.com/lxchuan12/redux-analysis
