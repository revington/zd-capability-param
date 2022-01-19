'use strict';
const capabilityParam = require('..');
const assert = require('assert');
describe('Capability Param', function () {
	describe('Happy path🍦', function () {
		it('should encode/decode', function () {
			const param = capabilityParam.create('secret', {
				lifetime: 1
			});
			const payload = {user: 'alice@localhost'};
			const encoded = param.encode(payload);
			const decoded = param.decode(encoded);
			assert.deepStrictEqual(decoded, payload);
		});
		it('should append capability params to url', function () {
			const param = capabilityParam.create('secret', {
				lifetime: 1
			});

		});
	});
	describe('Errors', function () {
		describe('#decode(payload)', function () {
			describe('When token has been tampered', function () {
				before(function () {
					this.param = capabilityParam.create('secret', {
						lifetime: 1
					});
					this.valid = this.param.encode('my payload');

					const [validUntil, payload, signature] = this.valid.split('.');
					this.tamperedDate = ['666' + validUntil.slice(3), payload, signature].join('.');
					this.tamperedPayload = [validUntil, '666' + payload.slice(3), signature].join(',');
				});

				function testTampered(signature, param) {
					try {
						param.decode(signature);
					} catch (e) {
						assert(e instanceof capabilityParam.InvalidCapabilityError, 'did not thrown InvalidCapabilityError');
						assert.deepStrictEqual(e.capabilityParam, decodeURIComponent(signature));
						return;
					}
					assert.fail('error not thrown');
				}
				it('should fail when expire date has been manipulated', function () {
					const {tamperedDate, param} = this;
					testTampered(tamperedDate, param);
				});
				it('should fail when payload has been manipulated', function () {
					const {tamperedPayload, param} = this;
					testTampered(tamperedPayload, param);
				});
			});
			it('should fail when token has expired', function () {
				const expired = 2;
				const param = capabilityParam.create('secret', {
					lifetime: expired * -1
				});
				const signature = param.encode('my payload');
				try {
					param.decode(signature);
				} catch (e) {
					// Test if the error is an instance of ExpiredCapabilityError
					if (e instanceof capabilityParam.ExpiredCapabilityError) {
						// And if the #expired value of the error is set to 2 days ago
						const dateDiff = Math.floor(Math.abs(Date.now() - e.expired.valueOf()));
						const dateDiffInDays = Math.floor(dateDiff / (60 * 1000));

						assert.deepStrictEqual(dateDiffInDays, expired);

						return;
					}
				}
				assert.fail('error not thrown');
			});
		});
	});
	describe('Secret rotation', function () {
		it('should try decode with more than one secret', function () {
			const param = capabilityParam.create('secret', {
				lifetime: 1
			});
			const encoded = param.encode('my payload');
			param.pushSecret('bla');
			const decoded = param.decode(encoded);
			assert.deepStrictEqual(decoded, 'my payload');
		});
		it('should keep up to #maxSecrets', function () {
			const results = [];
			const expected = [
				['start', 'my payload'],
				['bla0', 'my payload'],
				['bla1', 'my payload'],
				['bla2', 'my payload'],
				['bla3', 'my payload'],
				['bla4', 'invalid signature']
			];
			const param = capabilityParam.create('secret', {
				lifetime: 1
			});
			const encoded = param.encode('my payload');
			results.push(['start', param.decode(encoded)]);
			for (let i = 0; i < 5; i++) {
				let newSecret = 'bla' + i;
				param.pushSecret(newSecret);
				let decoded;
				try {
					decoded = param.decode(encoded);
				} catch (e) {
					results.push([newSecret, e.message]);
					continue;
				}
				results.push([newSecret, decoded]);
			}
			assert.deepStrictEqual(results, expected);
		});
	});
});
