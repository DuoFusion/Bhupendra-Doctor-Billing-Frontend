import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { signupUser } from "../../api/authApi";
import { ROUTES } from "../../constants/Routes";
import { Button, Card, Form, Input, Typography } from "antd";
import { VALIDATION_MESSAGES } from "../../constants/validation";
import { notify } from "../../utils/notify";

interface SignupValues {
  name: string;
  email: string;
  password: string;
}

const SignupForm = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm<SignupValues>();

  const mutation = useMutation({
    mutationFn: signupUser,
    onSuccess: () => {
      notify.success("Signup successful. Please sign in.");
      setTimeout(() => navigate(ROUTES.AUTH.SIGNIN), 700);
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        notify.error(error.response?.data?.message || "Something went wrong");
      } else {
        notify.error("Something went wrong");
      }
    },
  });

  const handleSignup = (values: SignupValues) => {
    mutation.mutate({
      name: (values.name || "").trim(),
      email: (values.email || "").trim(),
      password: values.password,
      role: "user",
    });
  };

  return (
    <div className="app-form-page flex min-h-[70vh] items-center justify-center px-4 py-8">
      <Card className="app-form-card !w-full !max-w-md !rounded-2xl !border-[#d7e1f0] !bg-white" style={{ boxShadow: "none" }}>
        <Typography.Title level={3} className="!mb-1 !text-center !text-[#1f2f4f]">
          Create Your Account
        </Typography.Title>
        <Typography.Text className="!mb-6 !block !text-center !text-[#7483a3]">
          Set up your account details to get started
        </Typography.Text>

        <Form<SignupValues> form={form} layout="vertical" requiredMark={false} onFinish={handleSignup} className="app-form">
          <Form.Item
            label="Medical Name"
            name="name"
            rules={[
              { required: true, message: "Please enter name" },
              { min: 5, message: "Name should be at least 5 characters" },
            ]}
          >
            <Input placeholder="Medical Name" />
          </Form.Item>

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

          <Form.Item label="Role">
            <Input value="user" disabled />
          </Form.Item>

          <Button block type="primary" htmlType="submit" loading={mutation.isPending} style={{ boxShadow: "none" }}>
            Sign Up
          </Button>
        </Form>

        <p className="mt-6 text-center text-sm text-[#7483a3]">
          Already have an account?
          <span className="ml-1 cursor-pointer text-[#2f55d4]" onClick={() => navigate(ROUTES.AUTH.SIGNIN)}>
            Sign In
          </span>
        </p>
      </Card>
    </div>
  );
};

export default SignupForm;
