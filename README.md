# 介绍MyPromise

MyPromise是模仿Promise实现的一套异步处理框架，但是MyPromise是使用setTimeout和ES6语法实现的。其中ES6语法是可选的。

它跟ES6标准实现的Promise是有区别的：

ES6的Promise是使用micro-task-queue，回调在一轮事件循环里就可以被主线程执行；

而MyPromise由于是使用setTimeout实现的，回调是放在macro-task-queue里，所以会在下一轮事件循环被主线程执行。

> micro-task-queue和macro-task-queue的介绍可以看我的[另一篇文章](https://github.com/coconilu/Blog/issues/7)

## 以ES6的Promise为参考

ES6的Promise规范可以[参考MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise)。

MyPromise将依次实现以下API：

```Javascript
Promise.prototype.then()
Promise.prototype.catch()
Promise.prototype.finally()
Promise.resolve()
Promise.reject()
Promise.race()
Promise.all()
```

## 必备的知识

1. ES6的一些基础语法，如class
2. `Function.prototype.bind()`
3. 闭包
4. setTimeout异步处理思维

## MyPromise原理

1. 基于setTimeout实现的异步框架；

2. 存储每一次链式调用的回调；

3. 在发起resolve（成功）或reject（失败）时发起异步处理。

> 用一张图描述整个业务逻辑：

![MyPromise原理](https://raw.githubusercontent.com/coconilu/myPromise/master/picture/MyPromise.jpg)

## 逐个实现API

完整的代码可以看：[`./src/MyPromise.js`](https://github.com/coconilu/myPromise/blob/master/src/MyPromise.js)

## 1. MyPromise的构造函数

首先需要保留MyPromise的状态，有3个状态：pending（未完成状态）、resolved（成功状态）、rejected（失败状态）；

其次需要存储链式调用中的回调函数（下面称之为`chain-callback`），使用数组来存储它们；

最后调用构造函数传入进来的实参回调（下面称之为`argument-callback`）。

代码如下：

```Javascript
constructor(fun) {
    this.state = stateEnum.pending
    this.fun = fun
    this.onResolvedArray = [];
    this.onRejectedArray = [];
    try {
        this.fun.call(undefined, resolve.bind(this), reject.bind(this))
    } catch (err) {
        // 处理错误
        setTimeout(() => {
            reject.bind(this)(err)
        })
    }
}
```

## 2. 对于resolve和reject函数

这两个函数才是MyPromise的灵魂所在，我并没有把它们放在构造函数或者构造函数的prototype里是因为不想它被使用者破坏。
这里使用resolve和reject命名是为了跟随潮流，别的命名也是可以的。
先把代码贴出来,由于resolve和reject函数逻辑差不多，这里仅讲解一下resolve：

```Javascript
const resolve = function (value) {
    if (this.state === stateEnum.pending) {
        this.state = stateEnum.resolved
        setTimeout(() => {
            let result;
            // 过滤onResolvedArray中undefined的情况，注意避免死循环
            while (!(this.onResolvedArray[0] instanceof Function)) {
                if (!this.onResolvedArray.length) return
                this.onResolvedArray = this.onResolvedArray.slice(1)
                this.onRejectedArray = this.onRejectedArray.slice(1)
            }
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
        })
    }
}
```

1. 为了防止在`argument-callback`多次调用resolve引起的不正常现象，我们对MyPromise对象的状态进行判断；
2. 当`argument-callback`里调用了resolve之后，除了进行状态判断，还会向定时器线程发起一个异步调用（也就是setTimeout），让它立即把回调放入任务队列（macro-task-queue）中，等待主线程的执行；
3. 等到主线程执行这个回调的时候，会把`chain-callback`中取出一个回调执行，并判断返回的结果是不是另一个MyPromise，如果不是则创造一个没有带值的MyPromise，并把`chain-callback`的剩下回调传给新的MyPromise；
4. 继续等待MyPromise里的`argument-callback`调用resolve方法，回到2。

这就是**链式调用的关键逻辑**。

## 3. then、catch、finally

这三个函数都是为了填充MyPromise对象的`chain-callback`，逻辑很简单。

```Javascript
then() {
    this.onResolvedArray.push(arguments[0])
    this.onRejectedArray.push(arguments[1])
    return this
}
catch () {
    this.onResolvedArray.push(undefined)
    this.onRejectedArray.push(arguments[0])
    return this
}
finally() {
    this.onResolvedArray.push(arguments[0])
    this.onRejectedArray.push(arguments[0])
    return this
}
```

## 4. MyPromise.resolve和MyPromise.reject

这两个方法不同于前面介绍的resolve和reject，它们是MyPromise类上的方法，主要作用是创建一个MyPromise对象并调用`argument-callback`里的resolve或reject：

```Javascript
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
```

## 5. MyPromise.race和MyPromise.all

到这里，其实已经介绍完MyPromise的主要代码和逻辑。

而MyPromise.race和MyPromise.all提供了一些特殊的用途，借用MDN的介绍。

> Promise.race(iterable) 方法返回一个 promise ，并伴随着 promise对象解决的返回值或拒绝的错误原因, 只要 iterable 中有一个 promise 对象"解决(resolve)"或"拒绝(reject)"。

```Javascript
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
```

> Promise.all(iterable) 方法返回一个 Promise 实例，此实例在 iterable 参数内所有的 promise 都“完成（resolved）”或参数中不包含 promise 时回调完成（resolve）；如果参数中  promise 有一个失败（rejected），此实例回调失败（rejecte），失败原因的是第一个失败 promise 的结果。

```Javascript
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
```

## 测试

上面主要介绍了resolve，而reject只是只言片语带过。希望[源码](https://github.com/coconilu/myPromise/blob/master/src/MyPromise.js)和[测试代码](https://github.com/coconilu/myPromise/blob/master/test/MyPromiseTester.js)能解答你心中的疑惑。

## 写在最后

如果文章哪里写的不对，还望不吝指教。

若有疑问，可以在issue中给我留言。

谢谢你能看到这里。