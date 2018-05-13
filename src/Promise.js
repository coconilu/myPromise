const stateEnum = {
    pending: 0,
    resolved: 1,
    rejected: 2
}


const resolve = function (value) {
    if (this.state === stateEnum.pending) {
        this.state = stateEnum.resolved
        setTimeout(() => {
            let result;
            // 过滤onResolvedArray中undefined的情况，注意避免死循环
            while (!(this.onResolvedArray[0] instanceof Function)) {
                if (!this.onResolvedArray.length) break
                this.onResolvedArray = this.onResolvedArray.slice(1)
                this.onRejectedArray = this.onRejectedArray.slice(1)
            }
            if (this.onResolvedArray[0] instanceof Function) {
                try {
                    result = this.onResolvedArray[0].call(undefined, value)
                    // 判断返回的是不是一个Promise对象
                    if (!(result instanceof MyPromise)) {
                        result = MyPromise.resolve()
                    }
                } catch (err) {
                    result = MyPromise.reject(err)
                } finally {
                    result.fillCallbacks(this.onResolvedArray.slice(1), this.onRejectedArray.slice(1))
                    this.onResolvedArray.length = 0
                    this.onRejectedArray.length = 0
                }
            }
        })
    }
}

const reject = function (err) {
    if (this.state === stateEnum.pending || this.state === stateEnum.resolved) {
        this.state = stateEnum.rejected
        setTimeout(() => {
            let result;
            // 过滤onResolvedArray中undefined的情况
            while (!(this.onRejectedArray[0] instanceof Function)) {
                if (!this.onRejectedArray.length) break
                this.onResolvedArray = this.onResolvedArray.slice(1)
                this.onRejectedArray = this.onRejectedArray.slice(1)
            }
            if (this.onRejectedArray[0] instanceof Function) {
                try {
                    result = this.onRejectedArray[0].call(undefined, err)
                    // 判断返回的是不是一个Promise对象
                    if (!(result instanceof MyPromise)) {
                        result = MyPromise.resolve()
                    }
                } catch (err) {
                    result = MyPromise.reject(err)
                } finally {
                    result.fillCallbacks(this.onResolvedArray.slice(1), this.onRejectedArray.slice(1))
                    this.onResolvedArray.length = 0
                    this.onRejectedArray.length = 0
                }
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
        } catch (error) {
            // 处理错误
            console.log(err)
            setTimeout(() => {
                reject(error)
            })
        }
    }

    fillCallbacks(resolvedArray, rejectedArray) {
        this.onResolvedArray = this.onResolvedArray.concat(resolvedArray)
        this.onRejectedArray = this.onRejectedArray.concat(rejectedArray)
    }

    catch () {
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

}

MyPromise.resolve = function (value) {
    return new MyPromise((_resolve, _reject) => {
        _resolve(value)
    })
}

MyPromise.reject = function (err) {
    return new MyPromise((_resolve, _reject) => {
        _reject(err)
    })
}

MyPromise.all = function (arr) {
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

MyPromise.race = function (arr) {
    const paramsArr = Array.prototype.slice.call(arr)
    return new MyPromise((resolve, reject) => {
        paramsArr.map((value, index, arr) => {
            if (value instanceof MyPromise) {
                value.then(val => {
                    resolve(val)
                }, err => {
                    reject(err)
                })
            }
        })
    })
}

// 兼容性导出
if (typeof define === 'function' && define.amd) {
    // AMD
    define(() => {
        return {
            Promise: MyPromise
        }
    });
} else if (typeof exports === 'object' && typeof module.exports === "object") {
    // Node, CommonJS之类的
    exports.MyPromise = MyPromise
}