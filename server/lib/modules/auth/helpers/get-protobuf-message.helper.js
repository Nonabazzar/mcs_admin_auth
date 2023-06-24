'use strict';

((protobufInfoHelper) => {

    const AuthMessage = require(`${global._protobufDir}/build/auth_pb`);
    const CommonsMessage = require(`${global._protobufDir}/build/commons_pb`);
    const { logger } = require(`${global._commonsDir}/logger/logwriter.helper`);
    const UserMessage = require(`${global._protobufDir}/build/user_pb`);

    protobufInfoHelper.createProtobufMessage = ({ call, debug, sessionSecret, sessionObj, userObj, roleId }) => {
        try {
            logger.debug({
                call,
                requestId: debug.debugId,
                message: "Token deserialized Data: ",
                payload: {
                    sessionObjExists: (sessionObj && Object.keys(sessionObj).length > 0),
                    userObjExists: (userObj && Object.keys(userObj).length > 0),
                    roleId
                }
            });
            const jwtMessage = new AuthMessage.Jwt();
            const sessionMessage = new AuthMessage.Session();
            const userMessage = new UserMessage.User();
            const roleMessage = new UserMessage.Role();
            const phoneMessage = new CommonsMessage.Phone();

            jwtMessage.setSignaturesecret(sessionSecret);
            roleMessage.setRoleid(roleId);
            roleMessage.setRoletype(roleId);
            sessionMessage.setSessionid(sessionObj.sessionId || sessionObj.sessionid);
            sessionMessage.setUserid(sessionObj.userId || sessionObj.userid);
            sessionMessage.setDeviceinfo(sessionObj.deviceInfo || sessionObj.deviceinfo);
            sessionMessage.setIp(sessionObj.ip);
            sessionMessage.setTimestamp(sessionObj.timestamp);
            sessionMessage.setActive(sessionObj.active);

            if(userObj?.menu.length>0){
                for(let item of userObj.menu){
                    sessionMessage.addMenupermission(item)
                }
            }

            phoneMessage.setPhone((userObj.phone && userObj.phone.phone) ? userObj.phone.phone : '');
            phoneMessage.setCountrycode((userObj.phone && (userObj.phone.countryCode || userObj.phone.countrycode)) ? (userObj.phone.countryCode || userObj.phone.countrycode) : '');
            phoneMessage.setFullphonenumber((userObj.phone && (userObj.phone.fullPhoneNumber || userObj.phone.fullphonenumber)) ? (userObj.phone.fullPhoneNumber || userObj.phone.fullphonenumber) : '');

            userMessage.setUserid(userObj.userId || userObj.userid);
            userMessage.setFirstname(userObj.firstName || userObj.firstname);
            userMessage.setMiddlename(userObj.middleName || userObj.middlename);
            userMessage.setLastname(userObj.lastName || userObj.lastname);
            userMessage.setEmail(userObj.email);
            userMessage.setStatus(userObj.status);
            userMessage.setCreatedat(userObj.createdAt || userObj.createdat);
            userMessage.setType(userObj.type);
            userMessage.setProfilepicurl(userObj.profilePicUrl || userObj.profilepicurl);
            userMessage.setAgreetermsconditions(userObj.agreeTermsConditions || userObj.agreetermsconditions);
            userMessage.setPhone(phoneMessage);
            userMessage.setSecondaryemail(userObj.secondaryEmail || '');
            userMessage.setUsername(userObj.userName || '');
            sessionMessage.setUser(userMessage);
            sessionMessage.setRole(roleMessage);

            jwtMessage.setSession(sessionMessage);
            return jwtMessage.serializeBinary();
        } catch (err) {
            throw new Error(err);
        }
    };

})(module.exports);
