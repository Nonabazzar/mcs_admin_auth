"use strict";

((authServiceHelper) => {

    const databaseQueryHandler = require(`${global._commonsDir}/helpers/database-handler.helper`);
    const { logger } = require(`${global._commonsDir}/logger/logwriter.helper`);

    authServiceHelper.getInfo = ({ dbConnection, debug, whereOpts, call, projectionFields, tableName }) => {
        try {
            // logger.debug({ call, requestId: debug.debugId, message: `Initiating the service for fetching the  information of a ${tableName} for debugId ${debug.debugId}, traceId ${call.tracerId} originated from ${debug.client}` });
            return databaseQueryHandler.find(dbConnection, tableName, whereOpts, projectionFields);
        } catch (err) {
            throw new Error(err);
        }
    };
})(module.exports);