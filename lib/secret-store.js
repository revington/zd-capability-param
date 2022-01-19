'use strict';
const assert = require('assert');

function create(maxSecrets) {
	maxSecrets = +maxSecrets;
	assert(!Number.isNaN(+maxSecrets), 'maxSecrets is required and must be a number');
	const secrets = [];

	function push(input) {
		secrets.unshift(input);
		// apply maxSecrets rule
		if (secrets.length > maxSecrets) {
			secrets.pop();
		}
	}

	function getCurrentSecret() {
		return secrets[0];
	}
	return Object.freeze({
		validSecrets: secrets,
		push,
		getCurrentSecret
	});
}
exports = module.exports = create;
