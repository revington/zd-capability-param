[![Build Status](https://travis-ci.org/revington/zd-capability-param.svg?branch=master)](https://travis-ci.org/revington/zd-capability-param)
[![Known Vulnerabilities](https://snyk.io/test/github/revington/zd-capability-param/badge.svg?targetFile=package.json)](https://snyk.io/test/github/revington/zd-capability-param?targetFile=package.json)
[![Coverage Status](https://coveralls.io/repos/github/revington/zd-capability-param/badge.svg?branch=master)](https://coveralls.io/github/revington/zd-capability-param?branch=master)
# zd-capability-param


## Install
```
$ npm install zd-capability-param
```

## Usage 


```javascript
// create a token valid for 48 hours
const CAPABILITY_PARAM_LIFETIME = 2 * 24 * 60 * 60 * 1000; // 48 HOURS
const param = capabilityParam.create('secret', CAPABILITY_PARAM_LIFETIME);
const token = param.encode({ validateEmail: user.email });

```
Check [express example](examples/express.js)

## API

`capabilityParam.create(secret, [options])`   
* `#secret` Could be an string or an array of strings
* `#options` Optional
	* `lifetime` Token lifetime in miliseconds
	* `algorithm` A hash algoritm. Default `sha256`
	* `maxSecrets` Max number of secrets to keep. See [secret rotation](#secret-rotation)

The algorithm is dependent on the available algorithms supported by the version of OpenSSL on the platform. Examples are 'sha256', 'sha512', etc. On recent releases of OpenSSL, `openssl list -digest-algorithms` (`openssl list-message-digest-algorithms` for older versions of OpenSSL) will display the available digest algorithms.

	* Returns `{encode, decode, pushSecret(secret)}`

### Secret rotation



