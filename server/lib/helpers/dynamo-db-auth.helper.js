'use strict';

((dynamoDBAuthHelper) => {

const Promise = require("bluebird");
const moment = require('moment');
const idGenerator = require(`${global._commonsDir}/helpers/random-id-generator.helper`);

dynamoDBAuthHelper.createLoginLogs = async ({ call, userObj, deviceType, deviceInfo, deviceId, ip, locationObj, failed_login = false }) => {
    return new Promise(async (resolve, reject) => {
        try {
            const createParams = {
                TableName: "LoginLog",
                Item: {
                    LogId: idGenerator.generateUuid(),
                    UserId: userObj.userId,
                    DeviceType: deviceType,
                    DeviceInfo: deviceInfo,
                    DeviceId: deviceId,
                    Ip: ip,
                    Loc: locationObj,
                    Expired: false,
                    Timestamp: {
                        N: moment().valueOf()
                    },
                    FailedLogin: {
                        BOOL: failed_login
                    }
                },
                ReturnConsumedCapacity: "TOTAL",
                ReturnValues: "ALL_OLD"
            };
            const createRes = await call.dynamoDB.put(createParams).promise();
            resolve(createRes);
        } catch (err) {
            reject(err);
        }
    });
};

dynamoDBAuthHelper.createLoginSuspension = async ({ call, loginSuspensionId, suspensionTime, userObj, ip }) => {
    return new Promise(async (resolve, reject) => {
        try {
            const createParams = {
                TableName: "LoginSuspension",
                Item: {
                    LoginSuspensionId: loginSuspensionId ? loginSuspensionId : idGenerator.generateUuid(),
                    UserId: userObj.userId,
                    Ip: ip,
                    BlockedUpto: {
                        N: moment().add(suspensionTime, 'minutes').valueOf()
                    },
                    Timestamp: {
                        N: moment().valueOf()
                    }
                },
                ReturnConsumedCapacity: "TOTAL",
                ReturnValues: "ALL_OLD"
            };
            const createRes = await call.dynamoDB.put(createParams).promise();
            resolve(createRes);
        } catch (err) {
            reject(err);
        }
    });
};

dynamoDBAuthHelper.removeLoginLogs = async (call, userObj) => {
    return new Promise(async (resolve, reject) => {
        try {
            const deleteRes  = await call.dynamoDB.delete({
                TableName: "LoginLog",
                Key:{
                    UserId: userObj.userId
                }
            }).promise();
            resolve(deleteRes);
        } catch (err) {
            reject(err);
        }
    });
};

dynamoDBAuthHelper.resetLoginSuspension = async ({ call, userObj, loginSuspensionId }) => {
    return new Promise(async (resolve, reject) => {
        try {
            const deleteRes  = await call.dynamoDB.delete({
                TableName : "LoginSuspension",
                Key:{
                    LoginSuspensionId: loginSuspensionId,
                    UserId: userObj.userId
                }
            }).promise();
            resolve(deleteRes);
        } catch (err) {
            reject(err);
        }
    });
};

dynamoDBAuthHelper.getLoginLogs = async ({ call, userObj, ip }) => {
    return new Promise(async (resolve, reject) => {
        try {
            const loginLogs = await call.dynamoDB.query({
                TableName : "LoginLog",
                IndexName : "FailedLoginLogIdx",
                KeyConditionExpression: "#UserId = :v_UserId and #Ip = :v_Ip",
                ExpressionAttributeNames:{
                    "#UserId": "UserId",
                    "#Ip": "Ip"
                },
                ExpressionAttributeValues: {
                    ":v_UserId": userObj.userId,
                    ":v_Ip": ip
                }
            }).promise();
            resolve(loginLogs);
        } catch (err) {
            reject(err);
        }
    });
};

dynamoDBAuthHelper.getLoginSuspensionInfo = async ({ call, userObj, ip }) => {
    return new Promise(async (resolve, reject) => {
        try {
            const loginSuspensionInfo = await call.dynamoDB.query({
                TableName : "LoginSuspension",
                IndexName : "LoginSuspensionIdx",
                KeyConditionExpression: "#UserId = :v_UserId and #Ip = :v_Ip",
                ExpressionAttributeNames:{
                    "#UserId": "UserId",
                    "#Ip": "Ip"
                },
                ExpressionAttributeValues: {
                    ":v_UserId": userObj.userId,
                    ":v_Ip": ip
                }
            }).promise();
            resolve(loginSuspensionInfo);
        } catch (err) {
            reject(err);
        }
    });
};

dynamoDBAuthHelper.expireFailedLoginTracker = async ({ call, userObj, ip, logIds }) => {
    return new Promise(async (resolve, reject) => {
        try {
            logIds.forEach(async (item, index) => {
                const updateRes = await call.dynamoDB.update({
                    TableName: "LoginLog",
                    IndexName:"FailedLoginLogIdx",
                    Key:{
                        UserId: userObj.userId,
                        LogId: item
                    },
                    UpdateExpression: "set Expired = :e",
                    ExpressionAttributeValues: {
                        ":e": true
                    },
                    ReturnValues:"UPDATED_NEW"
                }).promise();
                if ( (index + 1) === logIds.length ) {
                    resolve(updateRes);
                }
            });
        } catch (err) {
            reject(err);
        }
    });
};

})(module.exports);