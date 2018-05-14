const {
    MyPromise
} = require('../src/MyPromise');

// 基本测试
(() => {
    MyPromise.resolve()
        .then(value => {
            console.log(value)
        }, err => {
            console.log(err)
        })
        .then(value => {
            console.log(value);
            throw new Error('test')
        }, err => {
            console.log(err)
        })
        .then(value => {
            console.log(value)
        }, err => {
            console.log(err)
        })
        .catch(err => {
            console.log(err)
        })
        .then(value => {
            console.log(value)
        }, err => {
            console.log(err)
        })
        .finally(() => {
            console.log('end')
        })
})();

// 测试报错
(() => {
    new MyPromise(resolve => {
        throw new Error('test')
    }).then(value => { }, err => {
        console.log(err)
    }).catch(err => {
        console.log(err)
    })
})();

// race测试
(() => {
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
})();

// all测试
(() => {
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
})();