/**
 * Created by lakhe on 22/11/2018.
 */
"use strict";

(() => {

    module.exports = {
        message: {
            en: {
                userNameRequired: 'Username Required',
                emailRequired: "Email Required",
                passwordRequired: "Please input your password",
                wrongCredentials: "User Credentials not valid.",
                maxWrongAttemptExceed: "Your account has been temporarily suspended ",
                authorizationTokenInvalid: "Invalid Authorization token",
                permissionErr: "Authorization not granted",
                payloadMsg: 'Payload: ',
                userNotFound: 'Oops! User with identifier <%USER_IDENTIFIER%> does not exist',
                userIdRequired: "UserId missing in the payload",
                sessionNotFound: 'User\'s session not found',
                invalid_token: 'Invalid Authorization Token',
                userAccessBlocked: "User Access Blocked",
                permissionNotGrantedToView: "Please re-enter your password",
                accessGranted: 'Access granted to user',
                logoutSuccess: "Logout success",
                logoutFail: "Logout fail"


            },
        },
        config: {
            loginSessionTableName: "login_session"
        },
        projectionFields: {
            fullUserInfo: 'user_id first_name middle_name last_name email phone phone_country_code password country country_code agree_terms_conditions status created_at profile_pic_url occupation access_blocked type is_first_login user_name secondary_email',
            loginSessionInsertFields: 'uuid token user_id session_expiry_timestamp created_on ip'
        },
        properties: {
            updateFirstLogin: 'is_first_login updated_at'
        }
    };
})();
