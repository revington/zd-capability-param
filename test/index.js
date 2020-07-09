'use strict';
const capabilityParam = require('..');
const assert = require('assert');
describe('Capability Param', function () {
    it('should encode/decode', function () {
        const link = capabilityParam.create('secret', {
            lifetime: 1000
        });
        const encoded = link.encode('my payload');
        const decoded = link.decode(encoded);
        assert.deepStrictEqual(decoded, 'my payload');
    });
    it('should fail when token has been manipulated', function () {
        const link = capabilityParam.create('secret', {
            lifetime: 1000
        });
        const [validUntil, payload, signature] = link.encode('my payload').split('.');
        try {
            const decoded = link.decode([validUntil, payload + 'a', signature].join('.'));
        } catch (e) {
            if (e.message === 'invalid signature') {
                return;
            }
            throw e;
        }
        assert.fail('error not thrown');
    });
    it('should try decode with more than one secret', function () {
        const link = capabilityParam.create('secret', {
            lifetime: 1000
        });
        const encoded = link.encode('my payload');
        link.pushSecret('bla');
        const decoded = link.decode(encoded);
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
        const link = capabilityParam.create('secret', {
            lifetime: 1000
        });
        const encoded = link.encode('my payload');
        results.push(['start', link.decode(encoded)]);
        for (let i = 0; i < 5; i++) {
            let newSecret = 'bla' + i;
            link.pushSecret(newSecret);
            let decoded;
            try {
                decoded = link.decode(encoded);
            } catch (e) {
                results.push([newSecret, e.message]);
                continue;
            }
            results.push([newSecret, decoded]);
        }
	assert.deepStrictEqual(results, expected);
    });
});
