"use strict";
/**
 * ES6 HTML template
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Tagged_template_literals
 */
function template(strings, ...keys) {
    return (function (obj) {
        let result = [strings[0]];
        keys.forEach(function (key, i) {
            result.push(obj[key], strings[i + 1]);
        });
        return result.join('');
    });
}

module.exports = {template: template};

