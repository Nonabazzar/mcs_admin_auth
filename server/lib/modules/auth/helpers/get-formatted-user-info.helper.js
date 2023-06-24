'use strict';

((formatUserInfoHelper) => {

    formatUserInfoHelper.formatInfo = (user) => {
        try {
            return {
                userId: user.userid,
                firstName: user.firstname,
                middleName: user.middlename,
                lastName: user.lastname,
                email: user.email,
                phone: {
                    phone: user.phone && user.phone.phone || '',
                    countryCode: user.phone && user.phone.countrycode || '',
                    fullPhoneNumber: user.phone && user.phone.fullphonenumber || ''
                },
                country: user.country,
                gender: user.gender,
                status: user.status,
                dob: user.dob,
                type: user.type,
                birthPlace: user.birthplace,
                nationality: user.nationality,
                maritalStatus: user.maritalstatus,
                createdAt: user.createdat,
                profilePicUrl: user.profilepicurl,
                agreeTermsConditions: user.agreetermsconditions,
                userName: user.username,
                secondaryEmail: user.secondaryemail
            };
        } catch (err) {
            throw new Error(err);
        }
    };
})(module.exports);
