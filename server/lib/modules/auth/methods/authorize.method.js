'use strict';

(() => {

    const errorsPb = require(`${global._protobufDir}/build/errors_pb`);
    const { logger } = require(`${global._commonsDir}/logger/logwriter.helper`);
    const moduleConfig = require('../config');
    const permissionFormatHelper = require('../helpers/get-formatted-role-permissions-info.helper');
    const responseHandler = require(`${global._commonsDir}/helpers/response-handler.helper`);
    const sessionFormatHelper = require('../helpers/get-formatted-session-info.helper');
    const userFormatHelper = require('../helpers/get-formatted-user-info.helper');
    const validateAuthTokenHelper = require('../helpers/validate-auth-token.helper');

    const helperFunc = {
        getSessionData: (sessionObj) => {
            return (sessionObj && sessionObj.sessionObj && sessionObj.sessionObj && sessionObj.sessionObj.session) ? sessionObj.sessionObj.session : null
        },
        sessionIsValid: (sessionValidationRes, sessionInfo) => {
            return ((sessionValidationRes && sessionValidationRes.success) && (sessionInfo && sessionInfo.userid));
        },
        invalidSessionHasEmail: (sessionInfo) => {
            return (sessionInfo && sessionInfo.user && sessionInfo.user.email);
        },
    };

    module.exports = async (call, callback) => {
        const { authorization, debug, method, service } = call.request;
        const { debugId } = debug;
        try {
            const { permission, ip, userAgent, deviceId } = authorization;
            logger.debug({ call, requestId: debugId, message: `Authorizing the JWT token with permission '${permission && permission.name || ''}' for debugId ${debugId}, traceId ${call.tracerId} originated from ${debug.client}` });
            // logger.debug({ call, requestId: debugId, message: "Payload: ", payload: { permission, ip, userAgent } });

            const sessionObj = await validateAuthTokenHelper.validate({
                call, debug, authorization, deviceId, method, service
            });
            // logger.debug({ call, requestId: debugId, message: "Payload for sessionObj vaidateAuthToken: ", payload: { exists: (sessionObj && sessionObj.success) } });

            let sessionData = helperFunc.getSessionData(sessionObj);
            if (helperFunc.sessionIsValid(sessionObj, sessionData)) {
                return responseHandler.sendSuccessResponse({
                    call, callback, debug,
                    responseData: {
                        authResponse: {
                            granted: true,
                            session: {
                                ...sessionFormatHelper.formatInfo(sessionData),
                                ip: sessionData.ip,
                                timestamp: sessionData.timestamp,
                                active: sessionData.active,
                                user: userFormatHelper.formatInfo(sessionData.user),
                                role: permissionFormatHelper.formatInfo(sessionData.role),
                                storeName: sessionData.storename,
                                merchantName: sessionData.merchantname,
                            }
                        }
                    },
                    logResponseData: false
                });
            }
            return responseHandler.sendErrorResponse({
                call, callback, debug,
                logLevel: sessionObj.logLevel,
                errorCode: sessionObj.errorCode,
                messageObj: (sessionObj.errorCode === errorsPb.ErrorCode.PERMISSION_ERROR)
                    ? {
                        debugMessage: moduleConfig.message.en.permissionErr,
                        resMessage: moduleConfig.message.en.permissionErr
                    } : {
                        debugMessage: moduleConfig.message.en.authorizationTokenInvalid,
                        resMessage: moduleConfig.message.en.authorizationTokenInvalid
                    }
            });
        } catch (err) {
            return responseHandler.sendServerErrorResponse({ call, callback, debug, errorObj: err });
        }
    };

})();
