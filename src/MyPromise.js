const stateEnum = {
    pending: 0,
    resolved: 1,
    rejected: 2
}


const resolve = function (value) {
    if (this.state === stateEnum.pending) {
        setTimeout(() => {
            let result;
            // 过滤onResolvedArray中undefined的情况，注意避免死循环
            while (!(this.onResolvedArray[0] instanceof Function)) {
                if (!this.onResolvedArray.length) return
                this.onResolvedArray.shift()
                this.onRejectedArray.shift()
            }
            try {
                result = this.onResolvedArray[0].call(undefined, value)
                // 判断返回的是不是一个Promise对象
                if (!(result instanceof MyPromise)) {
                    result = MyPromise.resolve()
                }
                this.state = stateEnum.resolved
            } catch (err) {
                result = MyPromise.reject(err)
            } finally {
                this.onResolvedArray.shift()
                this.onRejectedArray.shift()
                result.fillCallbacks(this.onResolvedArray, this.onRejectedArray)
            }
        })
    }
}

const reject = function (err) {
    if (this.state === stateEnum.pending) {
        setTimeout(() => {
            let result;
            // 过滤onResolvedArray中undefined的情况
            while (!(this.onRejectedArray[0] instanceof Function)) {
                if (!this.onRejectedArray.length) return
                this.onResolvedArray.shift()
                this.onRejectedArray.shift()
            }
            try {
                result = this.onRejectedArray[0].call(undefined, err)
                // 判断返回的是不是一个Promise对象
                if (!(result instanceof MyPromise)) {
                    result = MyPromise.resolve()
                }
                this.state = stateEnum.rejected
            } catch (err) {
                result = MyPromise.reject(err)
            } finally {
                this.onResolvedArray.shift()
                this.onRejectedArray.shift()
                result.fillCallbacks(this.onResolvedArray, this.onRejectedArray)
            }
        })
    }
}

class MyPromise {
    constructor(fun) {
        this.state = stateEnum.pending
        this.fun = fun
        this.onResolvedArray = [];
        this.onRejectedArray = [];
        try {
            this.fun.call(undefined, resolve.bind(this), reject.bind(this))
        } catch (err) {
            // 处理错误
            reject.bind(this)(err)
        }
    }

    fillCallbacks(resolvedArray, rejectedArray) {
        this.onResolvedArray = resolvedArray
        this.onRejectedArray = rejectedArray
    }

    catch() {
        this.onResolvedArray.push(undefined)
        this.onRejectedArray.push(arguments[0])
        return this
    }

    then() {
        this.onResolvedArray.push(arguments[0])
        this.onRejectedArray.push(arguments[1])
        return this
    }

    finally() {
        this.onResolvedArray.push(arguments[0])
        this.onRejectedArray.push(arguments[0])
        return this
    }

    static resolve(value) {
        if (value instanceof MyPromise) return value
        return new MyPromise((_resolve, _reject) => {
            _resolve(value)
        })
    }
    
    static reject(err) {
        return new MyPromise((_resolve, _reject) => {
            _reject(err)
        })
    }
    
    static all(arr) {
        const results = []
        const paramsArr = Array.prototype.slice.call(arr)
        let numOfPromise = 0
        return new MyPromise((resolve, reject) => {
            paramsArr.map((value, index, arr) => {
                if (value instanceof MyPromise) {
                    ++numOfPromise;
                    value.then(val => {
                        results[index] = val;
                        --numOfPromise;
                        if (numOfPromise === 0) {
                            resolve(results)
                        }
                    }, err => {
                        reject(err)
                    })
                } else {
                    results[index] = value
                }
            })
        })
    }
    
    static race(arr) {
        const paramsArr = Array.prototype.slice.call(arr)
        return new MyPromise((resolve, reject) => {
            paramsArr.map((item, index, arr) => {
                if (!(item instanceof MyPromise)) {
                    item = MyPromise.resolve(item)
                }
                item.then(val => {
                    resolve(val)
                }, err => {
                    reject(err)
                })
            })
        })
    }
}

exports.MyPromise = MyPromise