'use strict';

((formatPermissionsInfoHelper) => {

    formatPermissionsInfoHelper.formatInfo = (roleObj) => {
        try {
            return {
                "permissions": roleObj.permissionsList,
                "roleId": roleObj.roleid,
                "name": roleObj.name,
                "roleType": roleObj.roletype,
                "createdAt": roleObj.createdat
            };
        } catch (err) {
            throw new Error(err);
        }
    };

})(module.exports);
