'use strict';

((getRoleInfoHelper) => {

    const getUserRoleServiceHelper = require(`${global._projectDir}/lib/services/get-db-query.service`);
    const utilityHelper = require(`${global._commonsDir}/helpers/utilities.helper`);

    getRoleInfoHelper.getInfo = async ({ call, debug, userId }) => {
        try {
            let roleData = await getUserRoleServiceHelper.getInfo({
                dbConnection: call.dbConnection,
                debug,
                whereOpts: {
                    ref_id: userId
                },
                call,
                projectionFields: 'role_id role ref_id',
                tableName: 'role'
            });
            if ((roleData && roleData.length > 0)) {
                roleData = utilityHelper.convertToCamelCase(roleData);
                const rolesInfo = roleData.map( (item) => {
                        return {
                            refId: item.refId,
                            roleId: item.roleId,
                            role: {
                                roleId: item.roleId,
                                role: item.role
                            }
                        }
                    });
                return rolesInfo[0];
            }
            return null;
        } catch (err) {
            throw new Error(err);
        }
    };

})(module.exports);