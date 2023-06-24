'use strict';

(() => {

    const authPb = require(`${global._protobufDir}/build/auth_pb`);
    const checkSessionInfoHelper = require('../helpers/check-deserialized-session-data.helper');
    const jwtHelper = require(`${global._commonsDir}/helpers/jwt.helper`);
    const { logger } = require(`${global._commonsDir}/logger/logwriter.helper`);
    const protobufHelper = require('../helpers/get-protobuf-message.helper');
    const redisHelper = require(`${global._commonsDir}/helpers/redis.helper`);
    const responseHandler = require(`${global._commonsDir}/helpers/response-handler.helper`);
    const sessionFormatHelper = require('../helpers/get-formatted-session-info.helper');
    const sessionHelper = require('../helpers/get-deserialized-session-data.helper');
    const userFormatHelper = require('../helpers/get-formatted-user-info.helper');
    const moduleConfig = require('../config');

    module.exports = async (call, callback) => {
        const { authorization, debug, authSessionInfo } = call.request;
        const { debugId } = debug;
        try {
            let responseLogout = false;
            let message = moduleConfig.message.en.logoutFail;

            const userId= authSessionInfo?.session?.user?.userId;
            logger.debug({ call, requestId: debugId, message: `Logging out user having userId ${userId} for debugId ${debugId}, traceId ${call.tracerId} originated from ${debug.client}` });
            logger.debug({ call, requestId: debugId, message: "Payload: ", payload: { userId } });

            if (authSessionInfo) {
                const deSerializedData = await sessionHelper.getInfo(userId);

                const decodedTokenObj = jwtHelper.decodeJWTToken(authorization.token);

                if (deSerializedData) {

                    if (((decodedTokenObj && decodedTokenObj.payload && decodedTokenObj.payload.sessionId) && (deSerializedData && deSerializedData.session && deSerializedData.session.role)) && (decodedTokenObj.payload.sessionId !== deSerializedData.session.sessionid)) {
                        return responseHandler.sendNormalResponse({
                            call, callback, debug,
                            responseData: {
                                success: false,
                                msg: message
                            }
                        });
                    }
                }
                await redisHelper.clearCacheKeys(userId);
                responseLogout = true;
                message = moduleConfig.message.en.logoutSuccess;
            }
            return responseHandler.sendNormalResponse({
                call, callback, debug,
                responseData: {
                    success: responseLogout,
                    msg: message
                }
            });
        } catch (err) {
            return responseHandler.sendServerErrorResponse({ call, callback, debug, errorObj: err });
        }
    };
})();
