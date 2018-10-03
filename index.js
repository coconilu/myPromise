const { MyPromise } = require('./src/MyPromise')

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