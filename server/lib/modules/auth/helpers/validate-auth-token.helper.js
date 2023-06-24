'use strict';

((validAuthTokenHelper) => {

    const checkSessionInfoHelper = require('./check-deserialized-session-data.helper');
    const errorsPb = require(`${global._protobufDir}/build/errors_pb`);
    const jwtHelper = require(`${global._commonsDir}/helpers/jwt.helper`);
    const { logger } = require(`${global._commonsDir}/logger/logwriter.helper`);
    // const permissionHelper = require('./permission.helper');
    const redisHelper = require(`${global._commonsDir}/helpers/redis.helper`);
    const roleAuthConfigHelper = require('../../../configs/role-authorize.config');
    const roleMapperHelper = require('../../../configs/user-role.config');
    const sessionHelper = require('./get-deserialized-session-data.helper');
    const userPb = require(`${global._protobufDir}/build/user_pb`);
    const menuPermissionConfig = require(`${global._commonsDir}/configs/menu_privilege.config`);

    const helperFunc = {
        jwtTokenHasPayload: (decodedJwtToken) => {
            return (decodedJwtToken && decodedJwtToken.payload);
        },
        isJwtTokenInvalid: (jwtVerificationObj) => {
            return (jwtVerificationObj && jwtVerificationObj.error && (jwtVerificationObj.err && jwtVerificationObj.err.name !== "TokenExpiredError"));
        },
        jwtTokenIssuerMatched: (jwtVerificationObj) => {
            return (jwtVerificationObj && (jwtVerificationObj.iss === process.env.JWT_ISSUER));
        },
        checkPermission: (method, permissionList, service) => {
            try {
                if (menuPermissionConfig['CommonService'].includes(method)) return true;

                if (permissionList.length > 0) {
                    for (let permissionItem of permissionList) {
                        if (menuPermissionConfig[permissionItem] && menuPermissionConfig.hasOwnProperty(permissionItem) && menuPermissionConfig[permissionItem].hasOwnProperty(service)) {
                            if (menuPermissionConfig[permissionItem][service].includes(method)) return true;
                        }
                    }
                }
                return false;
            } catch (error) {
                throw error;
            }
        }
    };

    validAuthTokenHelper.validate = async ({ call, debug, authorization, deviceId, method, service }) => {
        try {
            const { token, permission } = authorization;
            const decodedJwtToken = await jwtHelper.decodeJWTToken(token);
            if (helperFunc.jwtTokenHasPayload(decodedJwtToken)) {
                const deSerializedData = await sessionHelper.getInfo(decodedJwtToken.payload.userId);

                if (deSerializedData && deSerializedData.session) {

                    const verificationObj = await jwtHelper.verifyJWTToken(token, deSerializedData.signaturesecret);

                    if (helperFunc.isJwtTokenInvalid(verificationObj)) {
                        // logger.debug({ call, requestId: debug.debugId, message: `Invalid JWT Token for user having userId ${decodedJwtToken.payload.userId} for debugId ${debug.debugId}, traceId ${call.tracerId} originated from ${debug.client}` });
                    } else if (helperFunc.jwtTokenIssuerMatched(verificationObj)) {
                        const ttl = await redisHelper.getExpiryTime(decodedJwtToken.payload.userId);
                        if (ttl > 0) {
                            redisHelper.setExpiryTime({ keyData: decodedJwtToken.payload.userId, ttl: parseInt(process.env.TTL_EXPIRY), timeFormat: process.env.SESSION_DAY_TIME_FORMAT });
                            // uncomment the below commented code once the data in permissions table are loaded
                            let userType = (deSerializedData.session && deSerializedData.session.user && deSerializedData.session.user.type) ? deSerializedData.session.user.type : 0;
                            // userType = 4;
                            let permissionGranted = false;
                            permissionGranted = (userType === userPb.RoleType.SUPER_ADMIN || userType === userPb.RoleType.MANAGER || userType === userPb.RoleType.PRODUCT_MANAGER ||  userType === userPb.RoleType.SHOP_MANAGER) ? true : helperFunc.checkPermission(method, deSerializedData?.session?.menupermissionList, service)//helperFunc.checkPermission(roleAuthConfigHelper, roleMapperHelper[userType], permission.name[0]);
                            // logger.debug({ call, requestId: debug.debugId, message: `Is permission granted for user having userId ${decodedJwtToken.payload.userId} and roleType ${roleMapperHelper[userType]} and userType ${userType} and permission name ${permission.name[0]} and permission granted ${permissionGranted} for debugId ${debug.debugId}, traceId ${call.tracerId} originated from ${debug.client}` });
                            return permissionGranted ? {
                                success: true,
                                sessionObj: deSerializedData
                            } : {
                                success: false,
                                logLevel: 'debug',
                                errorCode: errorsPb.ErrorCode.PERMISSION_ERROR
                            };
                        }
                    }

                }
            }
            return {
                error: true,
                logLevel: 'debug',
                errorCode: errorsPb.ErrorCode.AUTH_ERROR
            };
        } catch (err) {
            throw new Error(err);
        }
    };

})(module.exports);
