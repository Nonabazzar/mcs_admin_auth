"use strict";

((userProfileHelper) => {

    const databaseQueryHandler = require(`${global._commonsDir}/helpers/database-handler.helper`);
    const { logger } = require(`${global._commonsDir}/logger/logwriter.helper`);

    userProfileHelper.getUsernfo = ({ dbConnection, debug, call, email }) => {
        try {
            logger.debug({ call, requestId: debug.debugId, message: `Initiating the service for fetching the user, merchant and address information of a user having email '${email}' for debugId ${debug.debugId}, traceId ${call.tracerId} originated from ${debug.client}` });

            let query = 'Select `user`.`user_id`, `user`.`first_name`, `user`.`middle_name`, `user`.`last_name`, `user`.`email`, `user`.`phone`, `user`.`phone_country_code`, `user`.`password`, ';
            query += '`user`.`country` as user_addewss, `user`.`country_code`, `user`.`status`, `user`.`type`, `user`.`profile_pic_url`, `user`.`is_first_login`, `address`.`address_id`, `address`.`type` as address_type, ';
            query += '`address`.`city`, `address`.`state`, `address`.`country`, `address`.`line1_address`, `address`.`line2_address`, `address`.`zip_code`, `address`.`municipality`, `address`.`latitude`, `address`.`longitude`, `address`.`street` ';
            query += 'from `user` left join ';
            query += '`address` on `user`.`user_id` = `address`.`user_id` ';
            query += 'WHERE `user`.`email` = ?';
            return databaseQueryHandler.handleRawQuery(dbConnection, query, [ email ]);
        } catch (err) {
            throw new Error(err);
        }
    };

})(module.exports);