'use strict';

((sessionHelper) => {

    const Promise = require('bluebird');
    
    const AuthMessage = require(`${global._protobufDir}/build/auth_pb`);
    const redisHelper = require(`${global._commonsDir}/helpers/redis.helper`);

    sessionHelper.getInfo = (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const tokenData = await redisHelper.getCachedData(userId);
                const deSerializedData = AuthMessage.Jwt.deserializeBinary(new Uint8Array(tokenData));
                return resolve(deSerializedData.toObject());
            } catch (err) {
                reject(err);
            }
        });

    };

})(module.exports);

