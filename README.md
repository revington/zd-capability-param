# zd-capability-param

Library to create, validate and decode [capability url](https://www.w3.org/TR/capability-urls/) tokens.  

![Build Status](https://github.com/revington/zd-capability-param/actions/workflows/node.js.yml/badge.svg)

[![Known Vulnerabilities](https://snyk.io/test/github/revington/zd-capability-param/badge.svg?targetFile=package.json)](https://snyk.io/test/github/revington/zd-capability-param?targetFile=package.json)
[![Coverage Status](https://coveralls.io/repos/github/revington/zd-capability-param/badge.svg?branch=master)](https://coveralls.io/github/revington/zd-capability-param?branch=master)

You know, this "click on this link to validate your email account" or "click to recover your account".  
Generated tokens are:
* Difficult to guess/tamper
* Limited lifetime
* Valid URL

### Difficult to guess/tamper

Because TTL + payload is signed with HMAC.

### Limited lifetime

The link includes an expiration date. This expiration date is included in the HMAC signature.

### Secret rotation

The HMAC secret could be easily rotated by just "pushing" more secrets. Each secret will be tested if the TTL looks good. For this reason it is important to set a low `maxSecrets` number (i.e 5).  
Older secrets will get discarded.

### Valid URL
Token is kept short enough by encoding it as Base64. This Base64 string is also URL-encoded to prevent breaking urls i.e by adding `&`.
.
## Install
```
$ npm install zd-capability-param
```

## Usage 

### Encode/decode

```javascript
// create a token valid for 48 hours
const lifetime = 2 * 24 * 60; // 48 HOURS
const param = capabilityParam.create('secret', {lifetime});
const toEncode = {user: 'alice@localhost'};
// encode
const token = param.encode(toEncode);
console.log('token', token);
// prints
// token 27376691.eyJ1c2VyIjoiYWxpY2VAbG9jYWxob3N0In0%3D.7cf77z2h%2Bz0cR%2Brc2hVO5L8cV7Q05pfanwMxqHTM9Qc%3D

// decode
let result;
try{
	result = param.decode(token);
}catch(e){
	if(e instanceof ExpiredCapabilityError){
	// capability param has expired i.e link is too old
		console.log(`token expired at ${e.expired}`);
		return;
	}
	if(e instanceof InvalidCapabilityError){
		// capability param has expired i.e link is too old
		console.log(`capability is not valid: "${e.capabilityParam}"`);
		return;
	}
}
console.log('user', result.user);
// prints user alice@localhost
```
Check [express example](examples/express.js)

## API

`capabilityParam.create(secret, [options])`   

* `#secret` Could be an string or an array of strings
* `#options` Optional
	* `lifetime` Token lifetime in minutes. Default is 48 hours.
	* `algorithm` A hash algoritm. Default `sha256`.
	* `maxSecrets` Max number of secrets to keep. See [secret rotation](#secret-rotation). Default is `5`.
* Returns `{encode(payload), decode(token), pushSecret(secret)}`

The algorithm is dependent on the available algorithms supported by the version of OpenSSL on the platform. Examples are 'sha256', 'sha512', etc. On recent releases of OpenSSL, `openssl list -digest-algorithms` (`openssl list-message-digest-algorithms` for older versions of OpenSSL) will display the available digest algorithms.


### Secret rotation
```javascript
// Provide a secret set on creation
const secrets = ['currentSecret','oldSecret'];
const param = capabilityParam.create(secrets, {maxSecrets:2});
// Add a new secret
param.pushSecret('new current secret');
// Because maxSecrets === 2 'oldSecret' is no longer valid.
// Valid secrets are 'new current secret'  and 'currentSecret'
// New tokens are signed with 'new current secret'
```
## Security warning

The `payload` is signed with HMAC and encoded to Base64 but IT IS NOT ENCRYPTED. Anyone can "see" the contents of the payload by decoding the string.
