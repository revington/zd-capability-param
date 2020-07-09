'use strict';
const {
    URL
} = require('url');
const HOUR = 60 * 60 * 1000;
const message = require('./lib/message');
const crypto = require('crypto');
const secretStore = require('./lib/secret-store');
const assert = require('assert');
const now = require('./lib/now');

function sign(secret, message, algorithm) {
    const hash = crypto.createHmac(algorithm, secret);
    hash.update(message);
    return hash.digest('base64');
}
const defaults = {
    lifetime: HOUR * 48,
    algorithm: 'sha256',
    maxSecrets: 5
};

function createSecrets(maxSecrets, ...secrets) {
    const ret = secretStore(maxSecrets);
    secrets.forEach(x => ret.push(x));
    return ret;
}

function create(secret, options) {
    var {
        lifetime,
        algorithm,
        maxSecrets
    } = Object.assign({}, options || {}, defaults);
    lifetime = Number(lifetime);
    const secrets = createSecrets(maxSecrets, secret);

    function encode(payload) {
        const validUntil = now() + lifetime;
        const myMessage = message.stringify(validUntil, payload);
        const signature = sign(secrets.getCurrentSecret(), myMessage, algorithm);
        return encodeURIComponent(message.format(myMessage, sign(secrets.getCurrentSecret(), myMessage, algorithm)));
    }

    function decode(input) {
        input = decodeURIComponent(input);
        const {
            validUntil,
            signedMessage,
            payload,
            signature
        } = message.parse(input);
        if (validUntil < now()) {
            throw new Error('timeout');
        }
        // Try all valid secrets
        for (let s of secrets.validSecrets) {
            if (sign(s, signedMessage, algorithm) === signature) {
                return message.fromString(payload);
            }
        }
        throw new Error('invalid signature');
    }
    return Object.freeze({
        encode,
        decode,
        pushSecret: secrets.push
    });
}
exports = module.exports = {
    create
};
