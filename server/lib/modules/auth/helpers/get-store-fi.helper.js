'use strict';

((getStoreFiInfoHelper) => {
    const Promise = require('bluebird');
    const errorsPb = require(`${global._protobufDir}/build/errors_pb`);
    const {logger} = require(`${global._commonsDir}/logger/logwriter.helper`);
    const {storeClient} = require(`${global._commonsDir}/client/loader/store-index`);


    getStoreFiInfoHelper.getStoreFiInfo = ({call, debug, storeId}) => {
        return new Promise((resolve, reject) => {
            try {
                storeClient.internal_getStoreFi({call, debug, stringValue: storeId}, (err, res) => {
                    if (err) {
                        logger.error({
                            call: null,
                            requestId: null,
                            message: `Error while fetching store fi list info for storeId ${storeId} and error message is : ${err}`
                        });

                        return resolve({
                            error: true,
                            logLevel: 'warn',
                            errorCode: errorsPb.ErrorCode.INVALID,
                            msg: err.message
                        })
                    }
                    if (res.error) {
                        logger.error({
                            call: null,
                            requestId: null,
                            message: `Error while fetching retailer info res forstoreId ${storeId} and error message is : ${res.error}`
                        });

                        return resolve({
                            error: true,
                            logLevel: 'warn',
                            errorCode: errorsPb.ErrorCode.INVALID,
                            msg: res.msg
                        })
                    }
                    return resolve(res);
                });
            } catch (err) {
                reject(err);
            }
        })
    }
})(module.exports);