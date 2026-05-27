export const BASE_URL = '';
// export const BASE_URL = 'http://stend.cogi.teka.ru';
// export const BASE_URL = 'http://localhost:3000';

export const Urls = {
        GET_CATEGORY_LIST_URL: `${BASE_URL}/api/goods/category/hirerarhy`,
        GET_GOOD_LIST_URL: `${BASE_URL}/api/goods/goods`,
        GET_GOOD_URL: `${BASE_URL}/api/goods/goods`,
        GET_GOOD_PHOTO_NAMES_URL: `${BASE_URL}/api/goods/goods /photo`,
        GET_GOOD_PHOTO_URL: `${BASE_URL}/api/goods/goods/photo`,
        GET_DISTRIBUTOR_TARIF_URL: `${BASE_URL}/api/goods/distributor-tarif`,

        GET_TVT_LIST_URL: `${BASE_URL}/api/tvt/all`,
        GET_TVT_URL: `${BASE_URL}/api/tvt`,
        SAVE_TVT_URL: `${BASE_URL}/api/tvt`,

        GET_ROLE_LIST_URL: `${BASE_URL}/api/goods/role`,
        GET_ROLE_URL: `${BASE_URL}/api/goods/role`,

        SAVE_WARE_HOUSE: `${BASE_URL}/api/goods/ware-house`,
        GET_WARE_HOUSE_LIST: `${BASE_URL}/api/goods/ware-house/list`,

        GET_COUNTRY_LIST_URL: `${BASE_URL}/api/address/countries`,
        GET_REGION_LIST_URL: `${BASE_URL}/api/address/regions`,
        GET_CITY_LIST_URL: `${BASE_URL}/api/address/cities`,
        GET_STREET_LIST_URL: `${BASE_URL}/api/address/streets`,
        GET_HOUSE_LIST_URL: `${BASE_URL}/api/address/houses`,
        GET_ADDRESS_ID_URL: `${BASE_URL}/api/address/addressId`,

        PAYMENT_STEP1_URL: `${BASE_URL}/api/payment/step1`,
        PAYMENT_STEP2_URL: `${BASE_URL}/api/payment/step2`,
        PAYMENT_STEP3_URL: `${BASE_URL}/api/payment/step3`,

        GET_PROFILE_URL: `${BASE_URL}/api/user/profile`,
        SAVE_PROFILE_ADDRESS_URL: `${BASE_URL}/api/user/profile/address`,
        GET_HEADER_INFO_URL: `${BASE_URL}/api/user/header_info`,
        GET_ACCOUNT_URL: `${BASE_URL}/api/user/account`,
        GET_OPERATION_HISTORY_URL: `${BASE_URL}/api/user/operation_history`,

        HOME_PAGE_TEXT_URL: `${BASE_URL}/api/utils/introductory`,

        LOGIN_URL: `${BASE_URL}/api/auth/login`,
        REGISTER_URL: `${BASE_URL}/api/auth/signUp`,
        REGISTER_CONFIRM_URL: `${BASE_URL}/api/auth/confirm`,
        LOGOUT_URL: `${BASE_URL}/api/auth/logout`,

        VALIDATE_LOGIN_URL: `${BASE_URL}/api/auth/validate/login`,
        VALIDATE_EMAIL_URL: `${BASE_URL}/api/auth/validate/email`,
        VALIDATE_PHONE_URL: `${BASE_URL}/api/auth/validate/phone`,

        LOGINURL: `${BASE_URL}/api/auth/login`,
        REGISTERURL: `${BASE_URL}/api/auth/signUp`,
        REGISTERCONFIRMURL: `${BASE_URL}/api/auth/confirm`,
        LOGOUTURL: `${BASE_URL}/api/auth/logout`,
        VALIDATELOGINURL: `${BASE_URL}/api/auth/validate/login`,
        VALIDATEEMAILURL: `${BASE_URL}/api/auth/validate/email`,
        VALIDATEPHONEURL: `${BASE_URL}/api/auth/validate/phone`,
};