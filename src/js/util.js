"use strict";
/*
 * @description Promise delay
 */
function delay(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve.bind(null, ...arguments), ms);
    });
}

/*
 * @description is function or not
 */
function isFunction(functionToCheck) {
 var getType = {};
 return functionToCheck && getType.toString.call(functionToCheck) === "[object Function]";
}
module.exports = {
    delay:delay,
    isFn:isFunction
};


