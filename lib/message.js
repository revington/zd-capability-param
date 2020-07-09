'use strict';

function toString(input) {
    let str = JSON.stringify(input);
    return Buffer.from(str).toString('base64');
}

function fromString(input) {
    let payload = Buffer.from(input, 'base64').toString('utf8');
    return JSON.parse(payload);
}

function stringify(ts, payload) {
    return format(ts, toString(payload));
}

function format(left, right) {
    return `${left}.${right}`;
}

function parse(input) {
    const [
        validUntil,
        payload,
        signature
    ] = input.split('.');
    return {
        validUntil: Number(validUntil),
        payload,
        signature,
        signedMessage: format(validUntil, payload)
    };
}
exports = module.exports = {
    toString,
    fromString,
    stringify,
    format,
    parse
};
