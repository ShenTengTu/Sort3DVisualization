"use strict";
/*
 * @description Promise delay
 */
function delay(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve.bind(null, ...arguments), ms);
    });
}

module.exports = {delay:delay};


