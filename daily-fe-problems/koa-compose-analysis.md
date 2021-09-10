# koa-compose 源码解析

Koa 的中间件会按照定义（调用 `.use`）的顺序被放在 `koa` 对象的 `this.middleware` 数组中，下图中从洋葱结构从外到内就可以认为是 `this.middleware` 中的各个中间件。外层的中间件处理完 request 之后，调用 `next()` 把控制权交给下一个中间件，如此递归处理 request 直到最后一个中间件，最后一个中间件生成完 response 之后从内到外逐层回溯经过之前在调用栈中每个中间件，执行每个中间件剩下的 `next()` 函数后面的代码，处理 response。

![2021-09-10](https://i.loli.net/2021/09/10/L8u7z2acEyTClWb.png)
![2021-09-10](https://i.loli.net/2021/09/10/voE8tgpTyOBJY7f.png)

川哥已经给我们整理好了 Koa 的主干流程：

```js
class Emitter{
  // node 内置模块
  constructor(){
  }
}
class Koa extends Emitter{
  constructor(options){
    super();
    options = options || {};
    this.middleware = [];
    this.context = {
      method: 'GET',
      url: '/url',
      body: undefined,
      set: function(key, val){
        console.log('context.set', key, val);
      },
    };
  }
  use(fn){
    this.middleware.push(fn);
    return this;
  }
  listen(){
    const  fnMiddleware = compose(this.middleware);
    const ctx = this.context;
    const handleResponse = () => respond(ctx);
    const onerror = function(){
      console.log('onerror');
    };
    fnMiddleware(ctx).then(handleResponse).catch(onerror);
  }
}
function respond(ctx){
  console.log('handleResponse');
  console.log('response.end', ctx.body);
}
```

在 `listen` 函数中，会调用 `koa-compose` 把所有的中间件变成一个新的中间件，最后使用 `fnMiddleware(ctx).then(handleResponse).catch(onerror)` 执行，返回一个 Promise，`ctx` 是全局的 context 变量通过这里传入，`handleResponse` 和 `onerror` 分别用来处理结果和错误。

`koa-compose` 源码如下：

```js
'use strict'

/**
 * Expose compositor.
 */

module.exports = compose

/**
 * Compose `middleware` returning
 * a fully valid middleware comprised
 * of all those which are passed.
 *
 * @param {Array} middleware
 * @return {Function}
 * @api public
 */

function compose (middleware) {
  // middleware 必须是数组
  if (!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array!')
  // middleware 数组中必须都是函数
  for (const fn of middleware) {
    if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!')
  }

  /**
   * @param {Object} context
   * @return {Promise}
   * @api public
   */
  // 返回一个新的中间件，也就是说将很多个中间件简化成了一个中间件
  return function (context, next) {
    // last called middleware #
    let index = -1
    return dispatch(0)
    function dispatch (i) {
      // 每次赋值 index = i，这个判断保证 index 是逐渐增加的，直到到达最后一层 index 变成 middleware.length，后面如果任何中间件再出现 next 函数，就会出现 i <= index，说明 next 被多次调用了
      if (i <= index) return Promise.reject(new Error('next() called multiple times'))
      index = i
      let fn = middleware[i]
      // 最后一个中间件的是传入的 next，没传的话就这个 dispatch 直接 resolve 结束，注意只是这个 dispatch resolve 了，上一层 fn 可能有逻辑继续执行
      if (i === middleware.length) fn = next
      if (!fn) return Promise.resolve()
      try {
        // 执行当前的中间件，将 context 传入，将下一个中间件的 dispatch 函数作为 next 函数传入，可以看到对中间件 i 来说，它的 next 函数就是 dispatch(i+1)
        // 中间件内部使用 const val = await next() 等价于 const val = dispatch.bind(null, i + 1)()
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)))
      } catch (err) {
        return Promise.reject(err)
      }
    }
  }
}
```

川哥给出了这个代码的简化形式：

```js
// 这样就可能更好理解了。
// simpleKoaCompose
const [fn0, fn1, fn2] = this.middleware;
const fnMiddleware = function(context){
    return Promise.resolve(
      fn0(context, function next(){
        return Promise.resolve(
          fn1(context, function next(){
              return Promise.resolve(
                  fn2(context, function next(){
                    return Promise.resolve();
                  })
              )
          })
        )
    })
  );
};
fnMiddleware(ctx).then(handleResponse).catch(onerror);
```

把下面高亮的部分等加成 `dispatch(1)` 就可以理解了，中间件 `fn0` 内部执行 `next()` 的时候，实际上执行的是 `dispatch(1)`，这样就实现了控制权交接和 next 的返回值的获取。

![2021-09-11](https://i.loli.net/2021/09/11/qo89uF74OjbWJ6w.png)

另外我发现测试用例写的是真的好，考虑了各种 corner case: https://github.dev/koajs/compose/blob/3f939549d38ba3f1c462c19f7f94b6b092206160/test/test.js ，居然还有 compose 套 compose 这种神仙操作，这么简洁的代码居然有这么神奇的力量。

重点看下前两个：

```js
// 洋葱结构的表现
it('should work', async () => {
    const arr = []
    const stack = []

    stack.push(async (context, next) => {
        arr.push(1)
        await wait(1)
        await next()
        await wait(1)
        arr.push(6)
    })

    stack.push(async (context, next) => {
        arr.push(2)
        await wait(1)
        await next()
        await wait(1)
        arr.push(5)
    })

    stack.push(async (context, next) => {
        arr.push(3)
        await wait(1)
        await next()
        await wait(1)
        arr.push(4)
    })

    await compose(stack)({})
    expect(arr).toEqual(expect.arrayContaining([1, 2, 3, 4, 5, 6]))
})

// 注意每个 next 都被 Promise 化了，因此使用的 next 的返回值话一定要用 await 拿结果
it('should create next functions that return a Promise', function () {
    const stack = []
    const arr = []
    for (let i = 0; i < 5; i++) {
      stack.push((context, next) => {
        arr.push(next())
      })
    }

    compose(stack)({})

    for (const next of arr) {
      assert(isPromise(next), 'one of the functions next is not a Promise')
    }
})

// compose 套 compose，太牛了
// https://github.com/koajs/compose/pull/27#issuecomment-143109739
it('should compose w/ other compositions', () => {
    const called = []

    return compose([
      compose([
        (ctx, next) => {
          called.push(1)
          return next()
        },
        (ctx, next) => {
          called.push(2)
          return next()
        }
      ]),
      (ctx, next) => {
        called.push(3)
        return next()
      }
    ])({}).then(() => assert.deepEqual(called, [1, 2, 3]))
})
```
