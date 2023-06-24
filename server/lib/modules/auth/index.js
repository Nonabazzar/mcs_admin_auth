'use strict';

(() => {

    module.exports = {
        internal_authorizeAdminUser: require('./methods/internal-services/internal-authorize-admin-user.method'),

        authorize : require('./methods/authorize.method'),
        login : require('./methods/login.method'),
        logout : require('./methods/logout.method'),
    };

})();