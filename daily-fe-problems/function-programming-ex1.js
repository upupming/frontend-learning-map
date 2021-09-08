function HardMan (name) {
  this.tasks = []
  this.tasks.push(() => console.log(`I am ${name}`))

  this.rest = (timeout) => {
    this.tasks.push(() => new Promise(resolve => {
      setTimeout(() => {
        console.log(`Start learning after ${timeout} seconds`)
        resolve()
      }, timeout * 1000)
    }))
    return this
  }
  this.restFirst = (timeout) => {
    this.tasks.unshift(() => new Promise(resolve => {
      setTimeout(() => {
        console.log(`Start learning after ${timeout} seconds`)
        resolve()
      }, timeout * 1000)
    }))
    return this
  }
  this.learn = (something) => {
    this.tasks.push(() => console.log(`Learning ${something}`))
    return this
  }

  // 等宏任务完成，也就是链式调用结束，执行 tasks 里面所有的任务
  setTimeout(async () => {
    for (const task of this.tasks) {
      await task()
    }
  }, 0)
  return this
}

new HardMan('jack').rest(2).learn('computer')
// I am jack
// //等待10秒
// Start learning after 10 seconds
// Learning computer
new HardMan('jack').restFirst(2).learn('computer')
// new HardMan('jack').restFirst(5).learn('chinese')
// //等待5秒
// Start learning after 5 seconds
// I am jack
// Learning chinese
