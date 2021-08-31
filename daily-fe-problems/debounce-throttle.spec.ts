// https://github.com/haizlin/fe-interview/issues/1043
/**
 * 防抖：生成一个函数，它在被调用后会等待一段时间再执行
 * 如果在等待期间再次调用，之前还未执行的调用会被取消
 * 参考: https://lodash.com/docs/4.17.15#debounce
 * @param fn 要防抖的函数
 * @param timeout 超时时间
 */
function debounce<F extends (...args: any[]) => void> (fn: F, timeout: number) {
  let timerId: NodeJS.Timeout | null = null
  return function debounced (...args: Parameters<F>): void {
    // 两次间隔太短的调用会导致上一次直接被 clearTimeout 掉
    if (timerId) {
      clearTimeout(timerId)
    }
    timerId = setTimeout(() => {
      fn(...args)
      timerId = null
    }, timeout)
  }
}

describe('debounce', () => {
  it('should execute only once in timeout', async () => {
    let [accumulator, times, timeout] = [0, 100, 50]
    const add = jest.fn((a: number) => { accumulator += a })
    const addDebounced = debounce(add, timeout)
    for (let i = 0; i < times; i++) {
      addDebounced(1)
      // 由于是延时执行，这里一定没有执行，必须后面等待完毕
      expect(add).toHaveBeenCalledTimes(0)
    }
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(add).toHaveBeenCalledTimes(1)
    expect(accumulator).toEqual(1)
    addDebounced(1); addDebounced(1)
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(add).toHaveBeenCalledTimes(2)
    expect(accumulator).toEqual(2)
  })
})

/**
 * 节流：生成一个函数，它在被调用一段时间内再被调用直接忽视
 * @param fn 要节流的函数
 * @param timeout 超时时间
 */
function throttle<F extends (...args: any[]) => void> (fn: F, timeout: number) {
  let timerId: NodeJS.Timeout | null = null
  return function throttled (...args: any[]) {
    if (timerId === null) {
      fn(...args)
      timerId = setTimeout(() => {
        timerId = null
      }, timeout)
    }
  }
}
/**
 * 不需要 timer 也可以实现 throttle
 */
function throttleNoTimer<F extends (...args: any[]) => void> (fn: F, timeout: number) {
  let lastTime: number|null = null
  return function throttled (...args: any[]) {
    const nowTime = Date.now()
    if (!lastTime || nowTime - lastTime > timeout) {
      fn(...args)
      lastTime = nowTime
    }
  }
}

describe('throttle', () => {
  it('should execute only once in timeout', async () => {
    let [accumulator, times, timeout] = [0, 100, 50]
    const add = jest.fn((a: number) => { accumulator += a })
    const addThrottled = throttle(add, timeout)
    for (let i = 0; i < times; i++) {
      addThrottled(1)
      // 由于是立即执行，这里一定至少已经执行了依次
      expect(add).toHaveBeenCalledTimes(1)
    }
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(add).toHaveBeenCalledTimes(1)
    expect(accumulator).toEqual(1)
    addThrottled(1); addThrottled(1)
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(add).toHaveBeenCalledTimes(2)
    expect(accumulator).toEqual(2)
  })
})
