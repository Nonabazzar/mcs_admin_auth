"use strict";

((createSessionInfoHelper) => {

    const moment = require('moment');

    const idGenerator = require(`${global._commonsDir}/helpers/random-id-generator.helper`);

    createSessionInfoHelper.getInfo = ({ userObj, _roleId, deviceType, deviceInfo, deviceId, ip }) => {
        try {
            return {
                sessionId: idGenerator.generateUuid(),
                userId: userObj.id,
                deviceType: deviceType,
                deviceInfo: deviceInfo,
                deviceId: deviceId,
                ip: ip,
                timestamp: moment().valueOf(),
                active: true,
                user: userObj,
                roleId: _roleId,
            }
        } catch (err) {
            throw new Error(err);
        }
    };
})(module.exports);