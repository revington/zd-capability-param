'use strict';
/**
 * Returns minutes since 1970/1/1
 * @returns {number} - returns current time
 */
function now() {
    return Math.floor(Date.now() / (60 * 1000));
}
module.exports = now;
