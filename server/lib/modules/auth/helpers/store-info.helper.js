// "use strict";

// ((storeInfoHelper) => {

//     const errorsPb = require(`${global._protobufDir}/build/errors_pb`);

//     const { logger } = require(`${global._commonsDir}/logger/logwriter.helper`);
//     const { storeClient } = require(`${global._commonsDir}/client/loader/store-index`);
  
//     storeInfoHelper.getStoreInfo = (stringValue, debug) => {
    
//         return new Promise((resolve, reject) => {
//            try {
//             logger.debug({ call: null, requestId: debug.debugId, message: `Generating store info from auth for user id ${stringValue}` });

//                 storeClient.internal_getStoreInfoByUserId({ stringValue, debug }, '', (err, response) => {
//                     if (err) {
//                         return resolve({
//                             error: true,
//                             msg: err.message,
//                             logLevel: 'warn',
//                             errorCode: errorsPb.ErrorCode.FAILED,
//                         });
//                     }
//                     return resolve(response);
//                 });   
//             } catch (error) {
//                 reject(error);
//             }
//         })
//     }
// })(module.exports);
  