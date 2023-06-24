'use strict';

(() => {

    const getPermissionInfoServiceHelper = require(`${global._projectDir}/lib/services/get-db-query.service`);
    const { logger } = require(`${global._commonsDir}/logger/logwriter.helper`);
    const responseHandler = require(`${global._commonsDir}/helpers/response-handler.helper`);

    module.exports = async (call, callback) => {
        const { permission, debug } = call.request;
        const { debugId } = debug;
        try {
            logger.debug({ call, requestId: debugId, message: `Fetching the list of permissions by title ${permission.name} and/or id ${permission.permissionId} for debugId ${debugId}, traceId ${call.tracerId} originated from ${debug.client}` });
            logger.debug({ call, requestId: debugId, message: "Payload: ", payload: { permission } });

            let whereOpts = {};
            if (permission) {
                if (permission.permissionId) {
                    whereOpts = Object.assign(whereOpts, {
                        permission_id: permission.permissionId
                    });
                }
                if (permission.name) {
                    whereOpts = Object.assign(whereOpts, {
                        name: {
                            like: permission.name
                        }
                    });
                }
            }
            const lstPermissions = await getPermissionInfoServiceHelper.getInfo({
                dbConnection: call.dbConnection,
                debug,
                whereOpts,
                call,
                projectionFields: 'permission_id name created_at',
                tableName: 'permissions'
            });
            return responseHandler.sendSuccessResponse({ call, callback, debug,
                responseData: {
                    permissions: lstPermissions
                }
            });
        } catch (err) {
            return responseHandler.sendServerErrorResponse({ call, callback, debug, errorObj: err });
        }

    };

})();
