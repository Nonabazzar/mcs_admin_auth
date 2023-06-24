'use strict';

((userInfoByEmailHelper) => {

    const getAdminDetailInfo = require('../../../../../client/methods/login-auth.method');
    const { logger } = require(`${global._commonsDir}/logger/logwriter.helper`);
    // const usersPb = require(`${global._protobufDir}/build/user_pb`);
    const utilityHelper = require(`${global._commonsDir}/helpers/utilities.helper`);

    const helperFunc = {
        userDoesNotExist: (userInfo) => {
            return (!userInfo || (0 === userInfo.length));
        }
    };

    userInfoByEmailHelper.getInfo = async ({ call, debug }) => {
        try {
            let [userData] = await getAdminDetailInfo({
                getAdminReq: {
                    username: call.request.loginRequest.userName
                }
            });
            if (helperFunc.userDoesNotExist(userData)) {
                return null;
            }
            
            return userData;
        } catch (err) {
            throw new Error(err);
        }
    };
})(module.exports);

