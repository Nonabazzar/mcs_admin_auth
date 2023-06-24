'use strict';

const client = require('../health-client');

client.check({}, (err, response) => {
    if (err) {
        console.error('Error while logging in => ', err.stack);
    }
    console.log(response)
});