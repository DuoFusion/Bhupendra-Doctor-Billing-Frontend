export const URL_KEYS = {
  AUTH: {
    SIGNUP: "/signup",
    SIGNIN: "/signin",
    SIGNOUT : "/signout",
    OTP_VERIFICATION: "/otp/verify",
    FORGOT_PASSWORD_SEND_OTP: "/forgot-password/send-otp",
    FORGOT_PASSWORD_VERIFY_OTP: "/forgot-password/verify-otp",
    FORGOT_PASSWORD_RESET: "/forgot-password/reset-password",
    GET_CURRENT_USER: "/me",
    UPDATE_PROFILE: "/profile/update",
    CHANGE_PASSWORD: "/password/change",
  },

  PRODUCT: {
    GET_PRODUCT: "/get/products",
    GET_MY_PRODUCTS: "/get/my-products",
    ADD_PRODUCT: "/addNew/product",
    GET_PRODUCT_BY_ID : "/getById/product/:id",
    UPDATE_PRODUCT: "/update/product/:id",
    DELETE_PRODUCT: "/delete/product/:id",
  },

  COMPANY: {
    GET_COMPANY: "/get/company",   
    ADD_COMPANY: "/addNew/company",
    UPDATE_COMPANY: "/update/company/:id",
    GET_COMPANY_BY_ID : "/getById/company/:id",
    DELETE_COMPANY: "/delete/company/:id",
  },

  BILL: {
    GET_BILLS: "/get/bills",
    GET_BILL_BY_ID: "/get/bill/:id",
    ADD_BILL: "/add/bill",
    UPDATE_BILL: "/update/bill/:id",
    DELETE_BILL: "/delete/bill/:id",
  },

  USER: {
    GET_USERS: "/get/users",
    GET_USER_BY_ID: "/users/:id" ,
    UPDATE_USER: "/update/user/:id",
    DELETE_USER: "/delete/user/:id",

  },

  CATEGORY: {
    GET_CATEGORIES: "/get/categories",
    ADD_CATEGORY: "/add/category",
    UPDATE_CATEGORY: "/update/category",
    DELETE_CATEGORY: "/delete/category",
  },

  UPLOAD: {
    GET_IMAGE: "/upload",
  },
};

