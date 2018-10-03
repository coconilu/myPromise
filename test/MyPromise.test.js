const { MyPromise } = require('../src/MyPromise');

// 基本测试
test('基本测试', done => {
    MyPromise.resolve('start')
        .then(value => {
            expect(value).toBe('start')
            throw new Error('error')
        })
        .catch(err => {
            expect(err.message).toBe('error')
        })
        .finally(() => {
            done()
        })
})

// race测试
test('race测试', done => {
    let myRace = MyPromise.race([1, MyPromise.resolve(2).then(value => {
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
        expect(value).toBe(1)
        done()
    })
})

// all测试
test('all测试', done => {
    let myAll = MyPromise.all([1, MyPromise.resolve(2).then(value => {
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
        expect(value[0]).toBe(1)
        expect(value[1]).toBe(2)
        expect(value[2]).toBe(3)
        done()
    })
})
