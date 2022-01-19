
![Build Status](https://github.com/revington/zd-capability-param/actions/workflows/node.js.yml/badge.svg)

[![Known Vulnerabilities](https://snyk.io/test/github/revington/zd-capability-param/badge.svg?targetFile=package.json)](https://snyk.io/test/github/revington/zd-capability-param?targetFile=package.json)
[![Coverage Status](https://coveralls.io/repos/github/revington/zd-capability-param/badge.svg?branch=master)](https://coveralls.io/github/revington/zd-capability-param?branch=master)
# zd-capability-param

Library to create, validate and decode [capability url](https://www.w3.org/TR/capability-urls/) tokens.  
You know, this "click on this link to validate your email account" or "click to recover your account".  
Generated tokens are:
* Difficult to guess/tamper
* Limited lifetime
* URL not-unfriendly 

### Difficult to guess/tamper

Because TTL + payload is signed with HMAC.

### Limited lifetime

The link includes an expiration date. This expiration date is included in the HMAC signature.

### Secret rotation

The HMAC secret could be easily rotated by just "pushing" more secrets. Each secret will be tested if the TTL looks good. For this reason it is important to set a low `maxSecrets` number (i.e 5).  
Older secrets will get discarded.

### URL not-unfriendly
Token is kept short enough by encoding it as Base64. This Base64 string is also URL-encoded to prevent unfriendly url characters like %, /, ? or &
.
## Install
```
$ npm install zd-capability-param
```

## Usage 

### Encode/decode

```javascript
// create a token valid for 48 hours
const lifetime = 2 * 24 * 60 * 60 * 1000; // 48 HOURS
const param = capabilityParam.create('secret', {lifetime});
// encode
const token = param.encode({ validateEmail: user.email });

// decode
const payload = param.decode(token);
```
Check [express example](examples/express.js)

## API

`capabilityParam.create(secret, [options])`   

* `#secret` Could be an string or an array of strings
* `#options` Optional
	* `lifetime` Token lifetime in miliseconds. Default is 48 hours.
	* `algorithm` A hash algoritm. Default `sha256`.
	* `maxSecrets` Max number of secrets to keep. See [secret rotation](#secret-rotation). Default is `5`.
* Returns `{encode(payload), decode(token), pushSecret(secret)}`

The algorithm is dependent on the available algorithms supported by the version of OpenSSL on the platform. Examples are 'sha256', 'sha512', etc. On recent releases of OpenSSL, `openssl list -digest-algorithms` (`openssl list-message-digest-algorithms` for older versions of OpenSSL) will display the available digest algorithms.


### Secret rotation
```
// Provide a secret set on creation
const secrets = ['currentSecret','oldSecret'];
const param = capabilityParam.create(secrets, {maxSecrets:2});
// Add a new secret
param.pushSecret('new current secret');
// Because maxSecrets === 2 'oldSecret' is no longer valid.
// Valid secrets are 'new current secret'  and 'currentSecret'
// New tokens are signed with 'new current secret'
```



