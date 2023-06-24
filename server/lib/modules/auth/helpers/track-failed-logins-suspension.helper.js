"use strict";

((trackFailedLoginInfoHelper) => {

    const moment = require('moment');
    const Promise = require('bluebird');

    const authDynamoHelper = require('../../../helpers/dynamo-db-auth.helper');
    const failedLoginTracker = require('../../failed-login-tracker');
    const getLoginSuspensionTimeHelper = require('./get-login-suspension-time.helper');

    trackFailedLoginInfoHelper.getInfo = async ({ call, debug, userObj, ip, deviceType, deviceInfo, deviceId, isMatch, location }) => {
        try {
            let response = false;
            const logsData = await Promise.all([failedLoginTracker.trackFailedLoginLogs({ call, userObj, ip }), authDynamoHelper.getLoginSuspensionInfo({ call, userObj, ip })]);

            const failedLoginLogObj =  logsData[0];
            const loginSuspensionInfo = logsData[1];
            const failedLoginCount = failedLoginLogObj ? failedLoginLogObj.failedLoginCount : 0;

            const failedAttempts = (0 === failedLoginCount.length) ? 0 : (failedLoginCount.length + 1);
            const logIds = failedLoginLogObj ? failedLoginLogObj.logIds : [];

            const lockContinuousEnabled = (failedLoginCount && failedLoginCount.length > 0)
                ? parseInt(process.env.LOCK_CONTINUOUS_PERIOD_IN_MIN) > ((moment().valueOf() - failedLoginCount[0].Timestamp.N)/(1000 * 60))
                : false;

            if (!lockContinuousEnabled && !isMatch) {
                (logIds && logIds.length >0) && await authDynamoHelper.expireFailedLoginTracker({
                    call,
                    userObj, ip,
                    logIds: logIds.map((item) => item.LogId)
                });
            }
            if ((failedAttempts >= parseInt(process.env.MAX_FAILED_ATTEMPTS)) && lockContinuousEnabled) {//&& (moment().valueOf() < loginLogs.Item.LockedUpto)
                const loginSuspensionTime = getLoginSuspensionTimeHelper.getInfo(loginSuspensionInfo);
                if ((!loginSuspensionInfo || (loginSuspensionInfo && loginSuspensionInfo.Items && loginSuspensionInfo.Items.length === 0))) {
                    authDynamoHelper.createLoginSuspension({
                        call,
                        loginSuspensionId: null,
                        suspensionTime: process.env.LOCK_PERIOD_IN_MINS,
                        userObj, ip
                    })
                } else if ((loginSuspensionTime && loginSuspensionTime < moment().unix())) {
                    authDynamoHelper.createLoginSuspension({
                        call,
                        loginSuspensionId: loginSuspensionInfo.Items[0].LoginSuspensionId,
                        suspensionTime: process.env.LOCK_PERIOD_IN_MINS,
                        userObj, ip
                    })
                }
                if (loginSuspensionTime && ((loginSuspensionTime - moment().unix()) > 0)) {
                    response = true;
                }
            }
            authDynamoHelper.createLoginLogs({ call, userObj, deviceType, deviceInfo, deviceId, ip, locationObj: location, failed_login: !isMatch });

            if (isMatch && (!lockContinuousEnabled || failedAttempts < parseInt(process.env.MAX_FAILED_ATTEMPTS))) {
                (logIds && logIds.length >0) && await authDynamoHelper.expireFailedLoginTracker({
                    call,
                    userObj, ip,
                    logIds: logIds.map((item) => item.LogId)
                });
                if (loginSuspensionInfo && loginSuspensionInfo.Items && loginSuspensionInfo.Items.length > 0 && loginSuspensionInfo.Items[0].LoginSuspensionId) {
                    await authDynamoHelper.resetLoginSuspension({ call, userObj, loginSuspensionId: loginSuspensionInfo.Items[0].LoginSuspensionId });
                }
            }
            return {
                error: response
            };
        } catch (err) {
            if (err.errno === "ECONNREFUSED") {
                return {
                    error: false
                };
            }
            throw new Error(err);
        }
    };
})(module.exports);