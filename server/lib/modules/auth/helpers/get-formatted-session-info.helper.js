'use strict';

((formatSessionsInfoHelper) => {


    formatSessionsInfoHelper.formatInfo = (session) => {
        try {
            return {
                ...session,
                sessionId: session.sessionid,
                userId: session.userid,
                deviceType: session.devicetype,
                deviceInfo: session.deviceinfo,
                deviceId: session.deviceid,
                merchantId: session.merchantid,
                storeId: session.storeid
            };
        } catch (err) {
            throw new Error(err);
        }
    };

})(module.exports);
