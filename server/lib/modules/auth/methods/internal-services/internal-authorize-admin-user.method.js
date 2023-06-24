'use strict';

(() => {    
    const errorsPb = require(`${global._protobufDir}/build/errors_pb`);
    const getUserInfoService = require(`${global._projectDir}/lib/services/get-db-query.service`);
    const hasher = require(`${global._commonsDir}/auth/hash-generator`);
    const { logger } = require(`${global._commonsDir}/logger/logwriter.helper`);
    const moduleConfig = require('../../config');
    const responseHandler = require(`${global._commonsDir}/helpers/response-handler.helper`);
    const usersPb = require(`${global._protobufDir}/build/user_pb`);

    module.exports = async (call, callback) => {
        const { loginRequest, debug, authSessionInfo } = call.request;
        const { debugId } = debug;
        try {
            const { session } = authSessionInfo;
            const { userId } = session
            const { password } = loginRequest;
            // logger.debug({ call, requestId: debugId, message: "Inializing internal authozie admin user: " });

            if (!password) {
                return responseHandler.sendErrorResponse({
                    call, callback, debug,
                    logLevel: 'warn',
                    errorCode: errorsPb.ErrorCode.NPE,
                    messageObj: {
                            debugMessage: moduleConfig.message.en.passwordRequired,
                            resMessage: moduleConfig.message.en.passwordRequired
                        }
                });
            }
            // logger.debug({ call, requestId: debugId, message: "Getting admin user info for internal authozie admin user: " });
            const userObj = await getUserInfoService.getInfo({
                dbConnection: call.dbConnection,
                debug,
                whereOpts: {
                    user_id: userId,
                    type: usersPb.RoleType.SUPER_ADMIN
                },
                call,
                projectionFields: 'password',
                tableName: 'user'
            });
            // logger.debug({ call, requestId: debugId, message: "The length for admin user info for internal authorize admin user: ", payload: {userLength: userObj.length} });
            if (userObj && userObj.length > 0) {
                const userInfo = userObj[0];
                const isMatch = await hasher.comparePassword(password, userInfo.password);
                if (isMatch) {
                    // logger.debug({ call, requestId: debugId, message: `Password matched for admin in internal svc for auth for debugId ${debugId}, traceId ${call.tracerId} originated from ${debug.client}` });
                    return responseHandler.sendSuccessResponse({ call, callback, debug,
                        responseData: {
                            message: moduleConfig.message.en.accessGranted,
                            success: true
                        },
                        logResponseData: false
                    });
                }
            }
            return responseHandler.sendErrorResponse({
                call, callback, debug,
                logLevel: 'warn',
                errorCode: errorsPb.ErrorCode.PERMISSION_ERROR,
                messageObj: {
                    debugMessage: moduleConfig.message.en.permissionNotGrantedToView,
                    resMessage: moduleConfig.message.en.permissionNotGrantedToView
                }
            });
        
   
        } catch (err) {
            return responseHandler.sendServerErrorResponse({ call, callback, debug, errorObj: err });
        }
    };
})();
