import axios from "axios";
import { URL_KEYS } from "../constants/Url";

const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_BASE_URL,
  withCredentials: true,
});

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  role: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface SigninPayload {
  email: string;
  password: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordSendOtpPayload {
  email: string;
}

export interface ForgotPasswordVerifyOtpPayload {
  email: string;
  otp: string;
}

export interface ForgotPasswordResetPayload {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

export const signupUser = async (data: SignupPayload) => {
  const response = await API.post(URL_KEYS.AUTH.SIGNUP , data);
  return response.data;
};


export const signinUser = async (data: SigninPayload) => {
  const response = await API.post(URL_KEYS.AUTH.SIGNIN , data);
  return response.data;
};

export const verifyOtpUser = async (data: VerifyOtpPayload) => {
  const response = await API.post( URL_KEYS.AUTH.OTP_VERIFICATION , data);
  return response.data;
};

export const getCurrentUser = async ()=>{
  const response = await API.get(URL_KEYS.AUTH.GET_CURRENT_USER);
  return response.data;
};

export const signout = async () => {
  const response = await API.post(URL_KEYS.AUTH.SIGNOUT, {}, { withCredentials: true });
  return response.data;
};

export const updateUserProfile = async (data: UpdateProfilePayload) => {
  const response = await API.put(URL_KEYS.AUTH.UPDATE_PROFILE, data);
  return response.data;
};

export const changeUserPassword = async (data: ChangePasswordPayload) => {
  const response = await API.put(URL_KEYS.AUTH.CHANGE_PASSWORD, data);
  return response.data;
};

export const sendForgotPasswordOtp = async (data: ForgotPasswordSendOtpPayload) => {
  const response = await API.post(URL_KEYS.AUTH.FORGOT_PASSWORD_SEND_OTP, data);
  return response.data;
};

export const verifyForgotPasswordOtp = async (data: ForgotPasswordVerifyOtpPayload) => {
  const response = await API.post(URL_KEYS.AUTH.FORGOT_PASSWORD_VERIFY_OTP, data);
  return response.data;
};

export const resetForgotPassword = async (data: ForgotPasswordResetPayload) => {
  const response = await API.put(URL_KEYS.AUTH.FORGOT_PASSWORD_RESET, data);
  return response.data;
};

