export const VALIDATION_REGEX = {
  phone10: /^[0-9]{10}$/,
  pincode6: /^[0-9]{6}$/,
  otp6: /^[0-9]{6}$/,
  gst15: /^[0-9A-Z]{15}$/,
  objectId24: /^[a-fA-F0-9]{24}$/,
} as const;

export const VALIDATION_MESSAGES = {
  phone10: "Phone number must be exactly 10 digits",
  pincode6: "Pincode must be exactly 6 digits",
  otp6: "OTP must be exactly 6 digits",
  gst15: "GST number must be 15 uppercase letters/numbers",
  passwordMin5: "Password must be at least 5 characters",
  nameMin5: "Full name should be at least 5 characters",
} as const;
