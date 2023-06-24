'use strict';

(() => {

    const moment = require('moment');

    const errorsPb = require(`${global._protobufDir}/build/errors_pb`);
    //const failedLoginSuspensionInfoHelper = require('../helpers/track-failed-logins-suspension.helper');
    const generateSessionInfoHelper = require('../helpers/generate-session-info.helper');
    const getUserByEmailHelper = require('../helpers/get-user-info-by-email.helper');
    const hasher = require(`${global._commonsDir}/auth/hash-generator`);
    const { logger } = require(`${global._commonsDir}/logger/logwriter.helper`);
    const moduleConfig = require('../config');
    const responseHandler = require(`${global._commonsDir}/helpers/response-handler.helper`);
    const usersPb = require(`${global._protobufDir}/build/user_pb`);

    const helperFunc = {
        hasRecord: (list) => {
            return (list && (list.length > 0));
        },
        isUserAccessBlocked: (userObj) => {
            return userObj.accessBlocked;
        },
        isUserAccessSuccess: (userObj) => {
            if (userObj.status === usersPb.UserStatus.REGISTERED || userObj.status === usersPb.UserStatus.ACCEPTED || userObj.status === usersPb.UserStatus.VERIFIED) {
                return true;
            }
            return false;
        }
    };

    module.exports = async (call, callback) => {
        const startTime = moment().valueOf();
        const { loginRequest, debug } = call.request;
        const { debugId } = debug;
        try {
            // throw new Error("Custom error")
            const { userName, emailPhone, password, deviceInfo, deviceId, ip, deviceType, location } = loginRequest;
            logger.debug({ call, requestId: debugId, message: `Checking if the user credentials submitted via the login form having email ${emailPhone} and user name ${userName} and ip address ${ip} for debugId ${debugId}, traceId ${call.tracerId} originated from ${debug.client}` });
            logger.debug({ call, requestId: debugId, message: "Payload: ", payload: { userName, emailPhone, deviceInfo, deviceId, ip, deviceType, location } });

            if (userName && password) {
                // check to see if the account with the provided username/email already exists in the table or not
                const userObj = await getUserByEmailHelper.getInfo({
                    call,
                    debug

                });
                if (userObj) {
                    if (!helperFunc.isUserAccessSuccess(userObj)) {
                        return responseHandler.sendErrorResponse({
                            call, callback, debug,
                            logLevel: 'warn',
                            errorCode: errorsPb.ErrorCode.FORBIDDEN,
                            messageObj: {
                                debugMessage: moduleConfig.message.en.userAccessBlocked,
                                resMessage: moduleConfig.message.en.userAccessBlocked
                            }
                        });
                    }
                    const isMatch = await hasher.comparePassword(password, userObj.password);
                    if (isMatch) {
                        // if user is found and password is right
                        delete userObj.password;
                        // delete userObj.passwordSalt;

                        const {
                            jwtToken,
                        } = await generateSessionInfoHelper.generateSessionObject({ call, debug, userObj: userObj, deviceType, deviceInfo, deviceId, ip });

                        const endTime = moment().valueOf();
                        logger.debug({ call, requestId: debugId, message: `Login complete in  ${(endTime - startTime)} ms for debugId ${debugId}, traceId ${call.tracerId} originated from ${debug.client}` });
                        return responseHandler.sendSuccessResponse({
                            call, callback, debug,
                            responseData: {
                                loginResponse: {
                                    token: jwtToken
                                },
                            },
                            logResponseData: false
                        });
                    }
                }

                return responseHandler.sendErrorResponse({
                    call, callback, debug,
                    logLevel: 'warn',
                    errorCode: errorsPb.ErrorCode.AUTH_ERROR,
                    messageObj: {
                        debugMessage: moduleConfig.message.en.wrongCredentials,
                        resMessage: moduleConfig.message.en.wrongCredentials
                    }
                });
            }
            return responseHandler.sendErrorResponse({
                call, callback, debug,
                logLevel: 'warn',
                errorCode: errorsPb.ErrorCode.NPE,
                messageObj: !userName
                    ? {
                        debugMessage: moduleConfig.message.en.userNameRequired,
                        resMessage: moduleConfig.message.en.userNameRequired
                    } : {
                        debugMessage: moduleConfig.message.en.passwordRequired,
                        resMessage: moduleConfig.message.en.passwordRequired
                    }
            });
        } catch (err) {
            return responseHandler.sendServerErrorResponse({ call, callback, debug, errorObj: err });
        }
    };
})();
