"use strict";

(()=>{
    module.exports = {
        "STORE": [
            'getApplicationInfoById',
            'getApplicationListForStore',
            'getFinancialInstitutions',
            'registerApplication',
            'registerApplicationDetails',
            'registerApplicationInvoice',
            'requestApplicationEmail',
            'requestApplicationPhoneOtp',
            'registerApplicationByEmailPhone',
            'getRequestLoanInfoByApplicationId',
            'updatePassword',
            'getUserProfile',
            'updateUser',
            'getWeeklyApplicationInfoAssoWithStore',
            'getMonthlyApplicationInfoAssoWithStore',
            'getAllApplicationCountAssoWithStore',
            'logout',
            'getStoreFiList',
            'requestApplicationPayment',
            'applicationSpsApprovalInfo',
            'getSPSPaymentInfo',
            'requestApplicationCustomerPhoneVerification',
            'verifyApplicationCustomerPhoneNumber',
            'requestApplicationTempoeApi',
            'getTempoeInfo',
            'getInfoForApplicationContinual',
            'applicationPaymentCountClearRedisInfo',
            'updateSpsApplicationErrorFields',
            'deleteStoreMid',
            'getStoreApplicationCode',
            'registerApplicationProduct',
            'getApplicationFundingForStore',
            'getApplicationFundingById',
            'getApplicationFundingByApplicationId',
            'getApplicationFundingSum',
            'getApplicationProduct',
            'removeApplicationProduct',
            'updateApplicationProduct',
            'getApplicationRejectionInfo',
            'getTotalProductPrice',
            'getSpsAgreementLengthListForStore',
            'initiatePreAuthorizationForSelectedFinancingTerm',
            ],
        "MERCHANT": [
            'updatePassword',
            'getUserProfile',
            'updateUser',
            'getWeeklyApplicationAssoWithMerchant',
            'getMonthlyApplicationAssoWithMerchant',
            'getAllStoreCountAssoWithMerchant',
            'getAllApplicationCountAssoWithMerchant',
            'filterStoresAssoWithMerchant',
            'getStoreInfoByMerchantId',
            'getApplicationInfoById',
            'getApplicationListForMerchant',
            'getRequestLoanInfoByApplicationId',
            'getStoreInfo',
            'logout',
            'getMerchantRetailerId',
            'getMerchantApplicationCode',
            'getApplicationFundingForMerchant',
            'getApplicationFundingById',
            'getApplicationFundingByApplicationId',
            'getApplicationFundingSum',
            'getApplicationProduct',
            'getApplicationRejectionInfo'
        ],
        "SPS_ADMIN": [
            'logout',
            'updatePassword',
            'getUserProfile',
            'updateUser',
            "getMonthlyApplicationStatus",
            "getWeeklyApplicationStatus",
            "getAllMerchantStatusCount",
            "getStoreStatusCountFromDateRange",
            "getAllStoreStatusCount",
            "getMerchantStatusCountFromDateRange",
            "getAllApplicationStatusCount",
            "getApplicationStatusCountFromDateRange",
            "getApplications",
            "getAllApplicationFunding",
            'getApplicationFundingById',
            'getApplicationFundingByApplicationId',
            'getApplicationById',
            'getApplicationProduct',
            'getApplicationInfoById',
            "exportApplication",
            'getApplicationListForSpsAdmin',
            'getApplicationRejectionInfo',
            'getFicoScoreByFicoCategoryRange',
            'getApplicationCompletedInfoForFi',
            'getFiStoreInfo'
        ]
    }
})();