'use strict';
const express = require('express');
const capabilityParam = require('../');
const app = express();
const CAPABILITY_PARAM_LIFETIME = 2 * 24 * 60 * 60 * 1000; // 48 HOURS
const param = capabilityParam.create('secret', CAPABILITY_PARAM_LIFETIME);
app.get('/validate-email', function (req, res) {
    var payload;
    try {
        payload = param.decode(req.query.token);
    } catch (e) {
        if (e.message === 'invalid signature' || e.message === 'timeout') {
            res.end('Link is too old!!!');
        }
    }
    // update your db...
    res.json(payload);
});
app.on('signup', function (user) {
    const token = param.encode({
        validateEmail: user.email
    });
    const link = `https://yourdomain.com/validate-email/token=${token}`;
    // send your capability url to validate user email
    // ....
});
app.listen(function (err) {
    const port = this.address().port;
    const token = param.encode({
        validateEmail: 'me@server.com'
    });
    const url = `http://localhost:${port}/validate-email?token=${token}`;
    console.log(`Listening on ${port}`);
    console.log('Try this url', url);
});
