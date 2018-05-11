const stateEnum = {
    pending: 0,
    resolved: 1,
    rejected: 2
}

const noop = () => { }

const resolve = function (value) {
    if (this.state === stateEnum.pending) {
        this.state = stateEnum.resolved
        setTimeout(() => {
            let result;
            if (this.onResolvedArray[0] && this.onResolvedArray[0] instanceof Function) {
                try {
                    result = this.onResolvedArray[0].call(undefined, value)
                    // 判断返回的是不是一个Promise对象
                    if (!(result instanceof MyPromise)) {
                        result = MyPromise.resolve(result)
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
        // asynFun.call(this, this.onResolvedArray)
    }
}

const reject = function (err) {
    if (this.state === stateEnum.pending || this.state === stateEnum.resolved) {
        this.state = stateEnum.rejected
        setTimeout(() => {
            let result;
            if (this.onRejectedArray[0] && this.onRejectedArray[0] instanceof Function) {
                try {
                    result = this.onRejectedArray[0].call(undefined, err)
                    // 判断返回的是不是一个Promise对象
                    if (!(result instanceof MyPromise)) {
                        result = MyPromise.resolve(result)
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
        // asynFun.call(this, this.onRejectedArray)
    }
}

// 先留着，后面重构用
const asynFun = function (onCallbackArray) {
    setTimeout(() => {
        let result;
        if (onCallbackArray[0] && onCallbackArray[0] instanceof Function) {
            try {
                result = onCallbackArray[0].call(undefined, value)
                // 判断返回的是不是一个Promise对象
                if (!(result instanceof MyPromise)) {
                    result = MyPromise.resolve(result)
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
            setTimeout(() => {
                reject(error)
            })
        }
    }

    fillCallbacks(resolvedArray, rejectedArray) {
        this.onResolvedArray = this.onResolvedArray.concat(resolvedArray)
        this.onRejectedArray = this.onRejectedArray.concat(rejectedArray)
    }

    then() {
        this.onResolvedArray.push(arguments[0] || noop)
        this.onRejectedArray.push(arguments[1] || noop)
        return this
    }

    catch() {
        this.onResolvedArray.push(noop)
        this.onRejectedArray.push(arguments[0] || noop)
        return this
    }

    finally() {
        this.onResolvedArray.push(arguments[0] || noop)
        this.onRejectedArray.push(arguments[0] || noop)
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

MyPromise.all = function () {
    let paramsArr = Array.prototype.slice.call(arguments)
}

MyPromise.race = function () {

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