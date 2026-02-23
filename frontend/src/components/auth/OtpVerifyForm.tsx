import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { verifyOtpUser } from "../../api/authApi";
import { ROUTES } from "../../constants/Routes";
import { Button, Card, Form, Input, Typography } from "antd";
import { VALIDATION_MESSAGES, VALIDATION_REGEX } from "../../constants/validation";
import { notify } from "../../utils/notify";

interface OtpValues {
  otp: string;
}

const OtpVerifyForm = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm<OtpValues>();
  const [email, setEmail] = useState("");

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      notify.warning("Email not found. Please sign in again.");
      navigate(ROUTES.AUTH.SIGNIN);
    }
  }, [navigate]);

  const mutation = useMutation({
    mutationFn: verifyOtpUser,
    onSuccess: (data) => {
      localStorage.removeItem("email");
      notify.success("OTP verified successfully.");

      setTimeout(() => {
        if (data.user.role === "admin") {
          navigate(ROUTES.ADMIN.DASHBOARD);
        } else if (data.user.role === "user") {
          navigate(ROUTES.USER.DASHBOARD);
        } else {
          navigate("/");
        }
        window.location.reload();
      }, 700);
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        notify.error(error.response?.data?.message || "Something went wrong");
      } else {
        notify.error("Something went wrong");
      }
    },
  });

  const handleVerify = (values: OtpValues) => {
    mutation.mutate({ email: email.trim(), otp: values.otp.trim() });
  };

  return (
    <div className="app-form-page flex min-h-[70vh] items-center justify-center px-4 py-8">
      <Card className="app-form-card !w-full !max-w-md !rounded-2xl !border-[#d7e1f0] !bg-white" style={{ boxShadow: "none" }}>
        <Typography.Title level={3} className="!mb-1 !text-center !text-[#1f2f4f]">
          Verify OTP
        </Typography.Title>
        <Typography.Text className="!mb-6 !block !text-center !text-[#7483a3]">
          Enter the verification code sent to your email
        </Typography.Text>

        <Form<OtpValues> form={form} layout="vertical" requiredMark={false} onFinish={handleVerify} className="app-form">
          <Form.Item
            label="OTP"
            name="otp"
            rules={[
              { required: true, message: "Please enter OTP" },
              { pattern: VALIDATION_REGEX.otp6, message: VALIDATION_MESSAGES.otp6 },
            ]}
          >
            <Input placeholder="Enter OTP" maxLength={6} />
          </Form.Item>

          <Button block type="primary" htmlType="submit" loading={mutation.isPending} style={{ boxShadow: "none" }}>
            Verify OTP
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default OtpVerifyForm;
