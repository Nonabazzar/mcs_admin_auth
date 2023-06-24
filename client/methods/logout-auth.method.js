'use strict';

const client = require('../client');
const authorization = require('../static/authorization.data');

client.logout(authorization, (err, response) => {
    if (err) {
        console.error('Error while logging in => ', err.stack);
    }

});