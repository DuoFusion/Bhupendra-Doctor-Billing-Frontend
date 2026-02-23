import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { signinUser } from "../../api/authApi";
import { ROUTES } from "../../constants/Routes";
import { Button, Card, Form, Input, Typography } from "antd";
import { VALIDATION_MESSAGES } from "../../constants/validation";
import { notify } from "../../utils/notify";

interface SigninValues {
  email: string;
  password: string;
}

const SigninForm = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm<SigninValues>();

  const mutation = useMutation({
    mutationFn: signinUser,
    onSuccess: (_, vars) => {
      localStorage.setItem("email", vars.email);
      notify.success(`OTP sent successfully to ${vars.email}`);
      setTimeout(() => navigate(ROUTES.AUTH.VERIFY_OTP), 700);
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        notify.error(error.response?.data?.message || "Something went wrong");
      } else {
        notify.error("Something went wrong");
      }
    },
  });

  const handleSignin = (values: SigninValues) => {
    mutation.mutate({
      email: (values.email || "").trim(),
      password: values.password,
    });
  };

  return (
    <div className="app-form-page flex min-h-[70vh] items-center justify-center px-4 py-8">
      <Card className="app-form-card !w-full !max-w-md !rounded-2xl !border-[#d7e1f0] !bg-white" style={{ boxShadow: "none" }}>
        <Typography.Title level={3} className="!mb-1 !text-center !text-[#1f2f4f]">
          Welcome Back
        </Typography.Title>
        <Typography.Text className="!mb-6 !block !text-center !text-[#7483a3]">
          Sign in to continue to your dashboard
        </Typography.Text>

        <Form<SigninValues> form={form} layout="vertical" requiredMark={false} onFinish={handleSignin} className="app-form">
          <Form.Item
            label="Email Address"
            name="email"
            rules={[{ required: true, message: "Please enter email" }, { type: "email", message: "Please enter valid email" }]}
          >
            <Input placeholder="Email Address" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: "Please enter password" },
              { min: 5, message: VALIDATION_MESSAGES.passwordMin5 },
            ]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>

          <div className="mb-3 flex justify-end">
            <button
              type="button"
              className="text-sm text-[#2f55d4] hover:text-[#274bc0]"
              onClick={() => navigate(ROUTES.AUTH.FORGET_PASSWORD)}
            >
              Forget Password?
            </button>
          </div>

          <Button block type="primary" htmlType="submit" loading={mutation.isPending} style={{ boxShadow: "none" }}>
            Sign In
          </Button>
        </Form>

        <p className="mt-6 text-center text-sm text-[#7483a3]">
          Don't have an account?
          <span className="ml-1 cursor-pointer text-[#2f55d4]" onClick={() => navigate(ROUTES.AUTH.SIGNUP)}>
            Sign Up
          </span>
        </p>
      </Card>
    </div>
  );
};

export default SigninForm;
