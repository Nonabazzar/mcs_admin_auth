'use strict';

const client = require('../client');
const authorizationData = require('../static/auth.data');

client.authorize(authorizationData, (err, response) => {
    if (err) {
        console.error('Error while logging in => ', err.stack);
    }

});