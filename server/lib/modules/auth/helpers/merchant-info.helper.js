// "use strict";

// ((merchantInfoHelper) => {

//     const errorsPb = require(`${global._protobufDir}/build/errors_pb`);
//     const { logger } = require(`${global._commonsDir}/logger/logwriter.helper`);
//     const { merchantClient } = require(`${global._commonsDir}/client/loader/merchant-index`);
  
//     merchantInfoHelper.getMerchantInfo = (stringValue, debug) => {
    
//         return new Promise((resolve, reject) => {
//            try {
//                 logger.debug({ call: null, requestId: debug.debugId, message: `Generating merchant info from auth for user id ${stringValue}` });

//                 merchantClient.internal_getMerchantByUserId({ stringValue, debug }, (err, response) => {
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
  