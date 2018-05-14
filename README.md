# 介绍MyPromise
MyPromise是模仿Promise实现的一套异步处理框架，但是MyPromise是使用setTimeout和ES6语法实现的。其中ES6语法是可选的。

它跟ES6标准实现的Promise是有区别的：

ES6的Promise是使用micro-task-queue，回调在一轮事件循环里就可以被主线程执行；

而MyPromise由于是使用setTimeout实现的，回调是放在macro-task-queue里，所以会在下一轮事件循环被主线程执行。

> micro-task-queue和macro-task-queue的介绍可以看我的[另一篇文章](https://github.com/coconilu/Blog/issues/7)

# 以ES6的Promise为参考

ES6的Promise规范可以[参考MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise)。

MyPromise将依次实现以下API：

```
Promise.prototype.then()
Promise.prototype.catch()
Promise.prototype.finally()
Promise.resolve()
Promise.reject()
Promise.race()
Promise.all()
```

# 必备的知识
1. ES6的一些基础语法，如class
2. `Function.prototype.bind()`
3. 闭包
4. setTimeout异步处理思维

# MyPromise原理
基于setTimeout实现的异步框架；
存储每一次链式调用的回调；
在发起resolve（成功）或reject（失败）时发起异步处理。


# 逐个实现API
完整的代码可以看：[`./src/MyPromise.js`](https://github.com/coconilu/myPromise/blob/master/src/MyPromise.js)

## MyPromise的构造函数
首先需要保留MyPromise的状态，有3个状态：pending（未完成状态）、resolved（成功状态）、rejected（失败状态）；
其次需要存储链式调用中的回调函数，使用数组来存储它们；
最后调用构造函数传入进来的回调。

代码如下：
```
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