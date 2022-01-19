'use strict';
/**
 * zd-capability-param
 * @module zd-capability-param
 * @see module:zd-capability-param
 */

const message = require('./lib/message');
const crypto = require('crypto');
const secretStore = require('./lib/secret-store');
const assert = require('assert');
const now = require('./lib/now');

/**
 * ExpiredCapabilityError.
 *
 * @extends {Error}
 * @property {string} capabilityParam - The expired capability param
 * @property {Date} expired - Date this capability param expired
 */
class ExpiredCapabilityError extends Error {
	constructor(capabilityParam, expired) {
		super('expired');
		this.expired = expired;
		this.capabilityParam = capabilityParam;
		this.name = this.constructor.name;
	}
}
/**
 * InvalidCapabilityError.
 *
 * @extends {Error}
 * @property {string} capabilityParam - The invalid capability param
 */
class InvalidCapabilityError extends Error {
	constructor(capabilityParam) {
		super('invalid signature');
		this.capabilityParam = capabilityParam;
		this.name = this.constructor.name;
	}
}
/**
 * Sign a string with HMAC
 *
 * @param {string} secret - Secret to sign the message
 * @param {string} message - String to be signed
 * @param {string} [algorithm=sha256] - Algorithm
 * @returns {string} Base64 HMAC signature
 */
function sign(secret, message, algorithm) {
	const hash = crypto.createHmac(algorithm, secret);
	hash.update(message);
	return hash.digest('base64');
}

function createSecrets(maxSecrets, ...secrets) {
	const ret = secretStore(maxSecrets);
	secrets.forEach(x => ret.push(x));
	return ret;
}

class Capability {
	#algorithm
	#lifetime
	#secrets
	constructor(secret, options) {
		this.#lifetime = options.lifetime;
		this.#algorithm = options.algorithm;
		this.#secrets = createSecrets(options.maxSecrets, secret);
	}
	/**
	 * Signs the payload with HMAC
	 *
	 * @param {string} input - String to sign
	 * @returns {string} Signature 
	 */
	encode(payload) {
		const validUntil = now() + this.#lifetime;
		const myMessage = message.stringify(validUntil, payload);
		const signature = sign(this.#secrets.getCurrentSecret(), myMessage, this.#algorithm);
		return encodeURIComponent(message.format(myMessage, signature));
	}
	decode(input) {
		input = decodeURIComponent(input);

		const {
			validUntil,
			signedMessage,
			payload,
			signature
		} = message.parse(input);
		if (validUntil < now()) {
			throw new ExpiredCapabilityError(input, new Date(validUntil * 60 * 1000));
		}
		// Try all valid secrets
		for (let s of this.#secrets.validSecrets) {
			if (sign(s, signedMessage, this.#algorithm) === signature) {
				return message.fromString(payload);
			}
		}
		throw new InvalidCapabilityError(input);
	}
	pushSecret(secret) {
		this.#secrets.push(secret);
	}
}

/**
 * create.
 *
 * @param {string} secret - Secret to sign
 * @param {Object} options
 * @param {string} [options.lifetime=2880] - Lifetime expresed in minutes. Default is 48 hours
 * @param {string} [options.algorithm=sha256] - Algorithm used for the signature
 * @param {number} [options.maxSecrets=5] - Max valid secrets to keep
 * @returns {Capability}
 */
function create(secret, options) {
	assert(secret, 'secret is required');

	const config = {
		lifetime: 48 * 60,
		algorithm: 'sha256',
		maxSecrets: 5,
		...options
	};

	config.lifetime = Number(config.lifetime);
	config.maxSecrets = Number(config.maxSecrets);

	assert(!Number.isNaN(config.lifetime), 'lifetime must be a number');
	assert(config.algorithm, 'algorithm must be a valid algorithm');
	assert(!Number.isNaN(config.maxSecrets), 'maxSecrets must be a number');

	return new Capability(secret, config);
}
module.exports = {
	create,
	ExpiredCapabilityError,
	InvalidCapabilityError
};
