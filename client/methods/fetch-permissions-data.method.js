'use strict';

const client = require('../client');
const permissionData = require('../static/permissions.data');

client.authorize(permissionData, (err, response) => {
    if (err) {
        console.error('Error while logging in => ', err.stack);
    }

});