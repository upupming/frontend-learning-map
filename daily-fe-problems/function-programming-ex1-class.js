class HardMan {
  constructor (name) {
    this.tasks = [() => console.log(`I am ${name}`)]
    setTimeout(async () => {
      for (const task of this.tasks) {
        await task()
      }
    }, 0)
  }

  rest (timeout) {
    this.tasks.push(() => new Promise(resolve => {
      setTimeout(() => {
        console.log(`Start learning after ${timeout} seconds`)
        resolve()
      }, timeout * 1000)
    }))
    return this
  }

  restFirst (timeout) {
    this.tasks.unshift(() => new Promise(resolve => {
      setTimeout(() => {
        console.log(`Start learning after ${timeout} seconds`)
        resolve()
      }, timeout * 1000)
    }))
    return this
  }

  learn (something) {
    this.tasks.push(() => console.log(`Learning ${something}`))
    return this
  }
}

// new HardMan('jack').rest(2).learn('computer')
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
