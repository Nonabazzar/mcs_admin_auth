"use strict";

((checkSessionInfoHelper) => {

    checkSessionInfoHelper.getInfo = (deSerializedData) => {
        try {
            return !!((deSerializedData && Object.keys(deSerializedData).length > 0)
                && (deSerializedData.jwtsList && deSerializedData.jwtsList.length > 0));
        } catch (err) {
            throw new Error(err);
        }
    };

})(module.exports);