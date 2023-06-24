"use strict";

((loginSuspensionTimeHelper) => {

    loginSuspensionTimeHelper.getInfo = (loginSuspensionInfo) => {
        try {
            return (loginSuspensionInfo &&
                loginSuspensionInfo.Items &&
                loginSuspensionInfo.Items.length > 0 &&
                loginSuspensionInfo.Items[0].BlockedUpto &&
                loginSuspensionInfo.Items[0].BlockedUpto.N) ?
                loginSuspensionInfo.Items[0].BlockedUpto.N
                : null;
        } catch (err) {
            throw new Error(err);
        }
    };
})(module.exports);