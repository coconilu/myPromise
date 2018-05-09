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
            if (this.onResolvedArray[0] && this.onResolvedArray[0] instanceof Function) {
                result = this.onResolvedArray[0].call(undefined, value)
            }
            // 判断返回的是不是一个Promise对象
            if (result instanceof Promise) {
                // result是Promise对象，则把上一个promise存储的链式then的回调传递给result并清理上一个promise
                result.fillCallbacks(this.onResolvedArray.slice(1), this.onRejectedArray.slice(1))
                this.onResolvedArray.length = 0
                this.onRejectedArray.length = 0
            } else {
                // result不是Promise对象，则
                for (let i = 1; i < this.onResolvedArray.length; ++i) {
                    let templeFun = this.onResolvedArray[0]
                    if (templeFun && templeFun instanceof Function) {
                        templeFun()
                    }
                }
            }
        })
    }
}

const rejecte = function (err) {
    if (this.state === stateEnum.pending) {
        this.state = stateEnum.rejected
        setTimeout(() => {
            let result;
            if (this.onRejectedArray[0] && this.onRejectedArray[0] instanceof Function) {
                result = this.onRejectedArray[0].call(undefined, err)
            } else if (this.catchCallback && this.catchCallback instanceof Function) {
                result = this.catchCallback.call(undefined, err)
            }
            // 判断返回的是不是一个Promise对象
            if (result instanceof Promise) {
                // result是Promise对象，则把上一个promise存储的链式then的回调传递给result并清理上一个promise
                result.fillCallbacks(this.onResolvedArray.slice(1), this.onRejectedArray.slice(1))
                this.onResolvedArray.length = 0
                this.onRejectedArray.length = 0
            }
        })
    }
}

class Promise {
    constructor(fun) {
        this.state = stateEnum.pending
        this.fun = fun
        this.onResolvedArray = [];
        this.onRejectedArray = [];
        this.catchCallback = undefined;
        this.finalCallback = undefined;
        this.fun.call(undefined, resolve.bind(this), rejecte.bind(this))
    }

    fillCallbacks(resolvedArray, rejectedArray) {
        this.onResolvedArray = this.onResolvedArray.concat(resolvedArray)
        this.onRejectedArray = this.onRejectedArray.concat(rejectedArray)
    }

    then() {
        this.onResolvedArray.push(arguments[0])
        this.onRejectedArray.push(arguments[1])
        return this
    }

    catch() {
        this.catchCallback = arguments[0]
        return this
    }

    finally() {
        this.finalCallback = arguments[0]
    }

}

// exports.Promise = Promise

// 兼容性导出
if (typeof define === 'function' && define.amd) {
    // AMD
    define(() => {
        return {
            Promise: Promise
        }
    });
} else if (typeof exports === 'object' && typeof module.exports === "object") {
    // Node, CommonJS之类的
    exports.Promise = Promise
}