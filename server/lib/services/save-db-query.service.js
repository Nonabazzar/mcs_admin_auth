"use strict";

((userServiceHelper) => {

    const commonMessageConfig = require(`${global._commonsDir}/configs/common.config`);
    const databaseQueryHandler = require(`${global._commonsDir}/helpers/database-handler.helper`);
    const errorsPb = require(`${global._protobufDir}/build/errors_pb`);
    const { logger } = require(`${global._commonsDir}/logger/logwriter.helper`);

    userServiceHelper.saveInfo = async ({ dbConnection, debug, dataObj , call, dataFields, tableName, dbTx = false }) => {
        return new Promise( async (resolve, reject) => {
            try {
                logger.debug({ call, requestId: debug.debugId, message: `Initiating the service for saving the information of a ${tableName} for debugId ${debug.debugId}, traceId ${call.tracerId} originated from ${debug.client}` });
                const response = await databaseQueryHandler[dbTx ? "saveAsync" : "save"](dbConnection, tableName, dataObj, dataFields);
                if (response && 0 === response.affectedRows) {
                    return resolve({
                        error: true,
                        logLevel: 'error',
                        errorCode: errorsPb.ErrorCode.FAILED,
                        message: {
                            debugMessage: commonMessageConfig.message.en.requestFailed,
                            resMessage: commonMessageConfig.message[debug.locale ? debug.locale : process.env.DEFAULT_RES_LANGUAGE].requestFailed
                        },
                        txnRollback: dbTx,
                    });
                }
                return resolve(response);
            } catch (err) {
                logger.error({ call, requestId: debug.debugId, message: `SAVE ACTION ISSUE - TABLE ${tableName} Error with createDataObj ${JSON.stringify(dataObj)} resulted in error ${JSON.stringify(err)} issue for debugId ${debug.debugId} originated from ${debug.client}`, payload: JSON.stringify(err) });
                if (err.code === "ER_DUP_ENTRY") {
                    return resolve({
                        error: true,
                        logLevel: 'warn',
                        errorCode: errorsPb.ErrorCode.DUPLICATE,
                        txnRollback: dbTx,
                    });
                }
                reject(err);
            }
        });
    };
})(module.exports);