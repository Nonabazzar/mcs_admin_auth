"use strict";

((getUserDetailInfoHelper) => {

    const Promise = require('bluebird');

    const hasher = require(`${global._commonsDir}/auth/hash-generator`);

    getUserDetailInfoHelper.getInfo = async () => {
        try {
            const sessionSecret = await hasher.generateRandomBytes(parseInt(process.env.SESSION_SECRET_LENGTH));
            return {
                sessionSecret: sessionSecret
            };
        } catch (err) {
            throw new Error(err);
        }
    };
})(module.exports);