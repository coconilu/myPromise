const {
    MyPromise
} = require('../src/MyPromise');

// 基本测试
let baseTest = () => {
    MyPromise.resolve('start')
        .then(value => {
            console.log(value)
            throw new Error('error1')
        }, err => {
            console.log(err)
        })
        .then(value => {
            console.log(value);
        }, err => {
            console.log(err)
            throw new Error('error2')
        })
        .catch(err => {
            console.log(err)
        })
        .finally(() => {
            console.log('end')
        })
}

// 测试报错
let errorTest = () => {
    new MyPromise(() => {
        throw new Error('test')
    }).catch(err => {
        console.log(err)
    })
}

// race测试
let raceTest = () => {
    var myRace = MyPromise.race([1, MyPromise.resolve(2).then(value => {
        return new MyPromise(resolve => {
            setTimeout(() => {
                resolve(value)
            }, 3000)
        })
    }), MyPromise.resolve(3).then(value => {
        return new MyPromise(resolve => {
            setTimeout(() => {
                resolve(value)
            }, 2000)
        })
    })])

    myRace.then(value => {
        console.log(value)
    })
}

// all测试
let allTest = () => {
    var myAll = MyPromise.all([1, MyPromise.resolve(2).then(value => {
        return new MyPromise(resolve => {
            setTimeout(() => {
                resolve(value)
            }, 3000)
        })
    }), MyPromise.resolve(3).then(value => {
        return new MyPromise(resolve => {
            setTimeout(() => {
                resolve(value)
            }, 2000)
        })
    })])

    myAll.then(value => {
        console.log(value)
    })
}

baseTest()
// errorTest()
// allTest()
// raceTest()