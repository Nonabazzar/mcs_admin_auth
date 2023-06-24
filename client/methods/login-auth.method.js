'use strict';

(() => {
    const { adminClient } = require(`../client`);

    module.exports = async (authData) => {
        try {
            return new Promise((resolve, reject) => {
                adminClient.getAdminLoginDetail(authData, (err, response) => {
                    if (err) {
                        return reject(err);
                    }
                    if (response && response.success && response.adminLoginDetail) {
                        return resolve([{
                            type: response.adminLoginDetail.type,
                            password: response.adminLoginDetail.password,
                            status: response.adminLoginDetail.status,
                            userId: response.adminLoginDetail.userId,
                            id: response.adminLoginDetail.id,
                            email: response.adminLoginDetail.email,
                            menu: response?.adminLoginDetail?.menu
                        }])
                    }
                    return resolve([])
                });
            })
        } catch (error) {
            throw error;
        }
    }
})();