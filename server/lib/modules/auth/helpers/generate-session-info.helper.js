"use strict";

((generateSessionInfoHelper) => {

    const Promise = require('bluebird');

    const createSessionInfoHelper = require('../helpers/create-session-object.helper');
    const getUserDetailInfoHelper = require('./get-user-detail-info.helper');
    const jwtHelper = require(`${global._commonsDir}/helpers/jwt.helper`);
    const { logger } = require(`${global._commonsDir}/logger/logwriter.helper`);
    const protobufHelper = require('../helpers/get-protobuf-message.helper');
    const redisHelper = require(`${global._commonsDir}/helpers/redis.helper`);
    const sessionHelper = require('../helpers/get-deserialized-session-data.helper');
    const loginSessionDbHelper = require(`${global._projectDir}/lib/services/login-session-db.helper`)
    const moduleConfig = require('../config')
    const idGenerator = require(`${global._commonsDir}/helpers/random-id-generator.helper`);
    const utilityHelper = require(`${global._commonsDir}/helpers/utilities.helper`)

    const loginSessionInsertHelper = (dbConnection, debug, token, userObj, call, ip) => {
        try {

            let dt = new Date();
            const expiryTime = utilityHelper.removeCharFromString(process.env.JWT_EXPIRES, 'h');
            dt.setHours(dt.getHours() + parseInt(expiryTime));
            const dataObj = {
                uuid: idGenerator.generateUuid(),
                token: token,
                user_id: userObj.id,
                session_expiry_timestamp: dt.getTime(),
                created_on: Date.now(),
                ip: ip
            }
            return loginSessionDbHelper.saveInfo({ dbConnection, debug, dataObj, call, dataFields: moduleConfig.projectionFields.loginSessionInsertFields, tableName: moduleConfig.config.loginSessionTableName });
        } catch (error) {
            throw error;
        }
    }

    generateSessionInfoHelper.generateSessionObject = async ({ call, debug, userObj, deviceType, deviceInfo, deviceId, ip }) => {
        try {
            logger.debug({ call, requestId: debug.debugId, message: `Generating session object` });

            let { sessionSecret } = await getUserDetailInfoHelper.getInfo();

            const _roleId = userObj.type || 0;

            const sessionObj = createSessionInfoHelper.getInfo({ userObj, _roleId, deviceType, deviceInfo, deviceId, ip });

            const [jwtToken, deSerializedData] = await Promise.all([
                jwtHelper.generateJWTToken({ userId: userObj.userId, roleId: _roleId, sessionId: sessionObj.sessionId, sessionSecret }),
                sessionHelper.getInfo(userObj.userId),
            ]);

            const jwtMessage = protobufHelper.createProtobufMessage({
                call, debug,
                sessionSecret,
                sessionObj,
                userObj,
                roleId: _roleId
            });
            if (jwtMessage) {
                if (deSerializedData) {
                    redisHelper.clearCacheKeys(userObj.userId);
                }

                const sessionData = Buffer.from(jwtMessage);
                const saveRes = await loginSessionInsertHelper(call.dbConnection, debug, jwtToken, userObj, call, ip);
                if (!saveRes) {
                    //TODO
                }
                redisHelper.setDataToCache({ keyData: userObj.userId, data: sessionData, expiryNumber: parseInt(process.env.TTL_EXPIRY), timeFormat: process.env.SESSION_DAY_TIME_FORMAT });
            }

            return {
                sessionObj,
                jwtToken,
            };
        } catch (err) {
            throw new Error(err);
        }
    };
})(module.exports);