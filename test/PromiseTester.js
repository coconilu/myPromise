const { Promise } = require('../src/Promise')

new Promise((resolve, reject) => {
    setTimeout(() => {
        reject('hello world')
    }, 2000)
}).then(value => {
    console.log(value)
}, err => {
    console.log(err)
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('hello world')
        }, 2000)
    })
}).then(value => {
    console.log(value)
})