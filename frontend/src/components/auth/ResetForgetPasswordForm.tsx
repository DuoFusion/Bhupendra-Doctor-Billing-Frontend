import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  resetForgotPassword,
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
} from "../../api/authApi";
import { ROUTES } from "../../constants/Routes";
import { Button, Card, Form, Input, Typography } from "antd";
import { VALIDATION_MESSAGES, VALIDATION_REGEX } from "../../constants/validation";
import { getApiErrorMessage, notify } from "../../utils/notify";

const ResetForgetPasswordForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const sendOtpMutation = useMutation({
    mutationFn: sendForgotPasswordOtp,
    onSuccess: (data) => {
      notify.success(data?.message || "OTP sent successfully");
      setStep(2);
    },
    onError: (error) => {
      notify.error(getApiErrorMessage(error, "Failed to send OTP"));
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: verifyForgotPasswordOtp,
    onSuccess: (data) => {
      notify.success(data?.message || "OTP verified successfully");
      setStep(3);
    },
    onError: (error) => {
      notify.error(getApiErrorMessage(error, "Failed to verify OTP"));
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: resetForgotPassword,
    onSuccess: (data) => {
      notify.success(data?.message || "Password reset successfully");
      setStep(4);
      setTimeout(() => navigate(ROUTES.AUTH.SIGNIN), 1500);
    },
    onError: (error) => {
      notify.error(getApiErrorMessage(error, "Failed to reset password"));
    },
  });

  const isSubmitting = useMemo(
    () => sendOtpMutation.isPending || verifyOtpMutation.isPending || resetPasswordMutation.isPending,
    [sendOtpMutation.isPending, verifyOtpMutation.isPending, resetPasswordMutation.isPending]
  );

  const handleSendOtp = () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      notify.warning("Please enter email address");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      notify.warning("Please enter valid email");
      return;
    }

    sendOtpMutation.mutate({ email: trimmedEmail });
  };

  const handleVerifyOtp = () => {
    if (!otp.trim()) {
      notify.warning("OTP is required");
      return;
    }

    if (!VALIDATION_REGEX.otp6.test(otp.trim())) {
      notify.warning(VALIDATION_MESSAGES.otp6);
      return;
    }

    verifyOtpMutation.mutate({ email: email.trim(), otp: otp.trim() });
  };

  const handleResetPassword = () => {
    if (!newPassword || !confirmPassword) {
      notify.warning("New password and confirm password are required");
      return;
    }

    if (newPassword.length < 5) {
      notify.warning(VALIDATION_MESSAGES.passwordMin5);
      return;
    }

    if (newPassword !== confirmPassword) {
      notify.warning("New password and confirm password must match");
      return;
    }

    resetPasswordMutation.mutate({
      email: email.trim(),
      otp: otp.trim(),
      newPassword,
      confirmPassword,
    });
  };

  return (
    <div className="app-form-page flex min-h-[70vh] items-center justify-center px-4 py-8">
      <Card className="app-form-card !w-full !max-w-md !rounded-2xl !border-[#d7e1f0] !bg-white" style={{ boxShadow: "none" }}>
        <Typography.Title level={3} className="!mb-1 !text-center !text-[#1f2f4f]">
          Forgot Password
        </Typography.Title>
        <Typography.Text className="!block !text-center !text-[#7483a3]">
          {step === 1 && "Enter your email to receive OTP"}
          {step === 2 && "Enter OTP sent to your email"}
          {step === 3 && "Set your new password"}
          {step === 4 && "Password reset completed"}
        </Typography.Text>

        <div className="mb-4 mt-3 text-center text-xs text-[#8b98b4]">Step {step} of 4</div>

        {step === 1 && (
          <Form layout="vertical" requiredMark={false} className="app-form" onFinish={handleSendOtp}>
            <Form.Item
              label="Email Address"
              name="email"
              rules={[
                { required: true, message: "Please enter email address" },
                { type: "email", message: "Please enter valid email" },
              ]}
            >
              <Input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Item>
            <Button block type="primary" htmlType="submit" loading={isSubmitting} style={{ boxShadow: "none" }}>
              Send OTP
            </Button>
          </Form>
        )}

        {step === 2 && (
          <Form layout="vertical" requiredMark={false} className="app-form" onFinish={handleVerifyOtp}>
            <Form.Item
              label="OTP"
              name="otp"
              rules={[
                { required: true, message: "Please enter OTP" },
                { pattern: VALIDATION_REGEX.otp6, message: VALIDATION_MESSAGES.otp6 },
              ]}
            >
              <Input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
              />
            </Form.Item>
            <div className="flex gap-3">
              <Button block onClick={() => setStep(1)} style={{ boxShadow: "none" }}>
                Back
              </Button>
              <Button block type="primary" htmlType="submit" loading={isSubmitting} style={{ boxShadow: "none" }}>
                Verify OTP
              </Button>
            </div>
          </Form>
        )}

        {step === 3 && (
          <Form layout="vertical" requiredMark={false} className="app-form" onFinish={handleResetPassword}>
            <Form.Item
              label="New Password"
              name="newPassword"
              rules={[
                { required: true, message: "Please enter new password" },
                { min: 5, message: VALIDATION_MESSAGES.passwordMin5 },
              ]}
            >
              <Input.Password
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </Form.Item>
            <Form.Item
              label="Confirm Password"
              name="confirmPassword"
              dependencies={["newPassword"]}
              rules={[
                { required: true, message: "Please confirm password" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("New password and confirm password must match"));
                  },
                }),
              ]}
            >
              <Input.Password
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Form.Item>
            <div className="flex gap-3">
              <Button block onClick={() => setStep(2)} style={{ boxShadow: "none" }}>
                Back
              </Button>
              <Button block type="primary" htmlType="submit" loading={isSubmitting} style={{ boxShadow: "none" }}>
                Reset Password
              </Button>
            </div>
          </Form>
        )}

        {step === 4 && (
          <div className="mt-3 space-y-4 text-center">
            <p className="text-sm text-[#4e6287]">Your password has been reset successfully.</p>
            <Button type="primary" block onClick={() => navigate(ROUTES.AUTH.SIGNIN)} style={{ boxShadow: "none" }}>
              Go to Sign In
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ResetForgetPasswordForm;
