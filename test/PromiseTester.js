const { MyPromise } = require('../src/Promise')

MyPromise.resolve()
.then(value=>{console.log(value)},err=>{console.log(err)})
.then(value=>{console.log(value);throw new Error('test')},err=>{console.log(err)})
.then(value=>{console.log(value)},err=>{console.log(err)})
.catch(err=>{console.log(err)})
.then(value=>{console.log(value)},err=>{console.log(err)})
.finally(()=>{console.log('end')})