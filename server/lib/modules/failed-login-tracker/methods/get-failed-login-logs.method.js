'use strict';

(() => {

    const authDynamoHelper = require('../../../helpers/dynamo-db-auth.helper');

    module.exports = async ({ call, userObj, ip }) => {
        try {
            const failedLoginLogs =  await authDynamoHelper.getLoginLogs({ call, userObj, ip });
            const failedLoginCount = (failedLoginLogs && failedLoginLogs.Items && failedLoginLogs.Items.length > 0) ?
                failedLoginLogs.Items.filter( (item) => {
                    if (!item.Expired && (item.FailedLogin && item.FailedLogin.BOOL)) {
                        return item;
                    }
            }) : 0;
            const logIds = (failedLoginLogs && failedLoginLogs.Items && failedLoginLogs.Items.length > 0) ?
                failedLoginLogs.Items.filter( (item) => {
                    if (!item.Expired) {
                        return item;
                    }
            }): [];
            return {
                failedLoginCount,
                logIds
            }
        } catch (err) {
            if (err.errno === "ECONNREFUSED") {
                return {
                    failedLoginCount: 0,
                    logIds: []
                }
            }
            throw new Error(err);
        }
    };
})();
