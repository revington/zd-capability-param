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

