import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { signupUser } from "../../api/authApi";
import { getUserById, updateUser } from "../../api/userApi";
import { ROUTES } from "../../constants/Routes";
import { Button, Card, Col, Form, Input, Row, Select, Typography } from "antd";
import { VALIDATION_MESSAGES, VALIDATION_REGEX } from "../../constants/validation";
import { notify } from "../../utils/notify";

interface UserFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: string;
  phone?: string;
  city?: string;
  state?: string;
  pincode?: string;
  address?: string;
}

const splitName = (fullName = "") => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" "),
  };
};

const AddUserForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const [form] = Form.useForm<UserFormValues>();

  const { data, isLoading } = useQuery({
    queryKey: ["user", id],
    queryFn: () => getUserById(id as string),
    enabled: isEdit,
  });

  useEffect(() => {
    if (data?.user && isEdit) {
      const { firstName, lastName } = splitName(data.user.name || "");
      form.setFieldsValue({
        firstName,
        lastName,
        email: data.user.email || "",
        role: data.user.role || "user",
        phone: data.user.phone || "",
        city: data.user.city || "",
        state: data.user.state || "",
        pincode: data.user.pincode || "",
        address: data.user.address || "",
      });
    } else if (!isEdit) {
      form.setFieldsValue({ role: "user" });
    }
  }, [data, form, isEdit]);

  const addMutation = useMutation({
    mutationFn: signupUser,
    onSuccess: () => {
      notify.success("User created successfully.");
      setTimeout(() => navigate(ROUTES.ADMIN.MANAGE_USERS), 900);
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        notify.error(error.response?.data?.message || "Failed to create user");
      } else {
        notify.error("Something went wrong");
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: (formData: {
      id: string;
      name: string;
      email: string;
      role: string;
      phone?: string;
      city?: string;
      state?: string;
      pincode?: string;
      address?: string;
    }) =>
      updateUser(formData.id, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        phone: formData.phone,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        address: formData.address,
      }),
    onSuccess: () => {
      notify.success("User updated successfully.");
      setTimeout(() => navigate(ROUTES.ADMIN.MANAGE_USERS), 900);
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        notify.error(error.response?.data?.message || "Failed to update user");
      } else {
        notify.error("Something went wrong");
      }
    },
  });

  const handleSubmit = (values: UserFormValues) => {
    const fullName = `${values.firstName || ""} ${values.lastName || ""}`.trim();
    if (fullName.length < 5) {
      notify.warning("Name should be at least 5 characters");
      return;
    }

    const userPayload = {
      name: fullName,
      email: (values.email || "").trim(),
      role: values.role,
      phone: (values.phone || "").trim(),
      city: (values.city || "").trim(),
      state: (values.state || "").trim(),
      pincode: (values.pincode || "").trim(),
      address: (values.address || "").trim(),
    };

    if (isEdit && id) {
      updateMutation.mutate({
        id,
        ...userPayload,
      });
    } else {
      addMutation.mutate({
        ...userPayload,
        password: (values.password || "").trim(),
      });
    }
  };

  const mutation = isEdit ? updateMutation : addMutation;

  if (isEdit && isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Typography.Text>Loading...</Typography.Text>
      </div>
    );
  }

  return (
    <div className="app-form-page px-4 py-8">
      <Card className="app-form-card !mx-auto !max-w-4xl !rounded-2xl !border-[#d7e1f0] !bg-white" style={{ boxShadow: "none" }}>
        <div className="mb-6 flex items-center justify-between gap-3">
          <Typography.Title level={4} className="!mb-0 !text-[#1f2f4f]">
            {isEdit ? "Edit User" : "Add New User"}
          </Typography.Title>
          <Button onClick={() => navigate(ROUTES.ADMIN.MANAGE_USERS)} style={{ boxShadow: "none" }}>
            Back
          </Button>
        </div>

        <Form<UserFormValues>
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleSubmit}
          className="app-form"
          initialValues={{ role: "user" }}
        >
          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                label="First Name"
                name="firstName"
                rules={[{ required: true, message: "Please enter first name" }]}
              >
                <Input placeholder="First Name" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="Last Name" name="lastName">
                <Input placeholder="Last Name" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Phone Number"
                name="phone"
                rules={[
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      return VALIDATION_REGEX.phone10.test(String(value))
                        ? Promise.resolve()
                        : Promise.reject(new Error(VALIDATION_MESSAGES.phone10));
                    },
                  },
                ]}
              >
                <Input placeholder="Phone Number" maxLength={10} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Email Address"
                name="email"
                rules={[
                  { required: true, message: "Please enter email" },
                  { type: "email", message: "Please enter valid email" },
                ]}
              >
                <Input placeholder="Email Address" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="City" name="city">
                <Input placeholder="City" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="State/County" name="state">
                <Input placeholder="State" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Postcode"
                name="pincode"
                rules={[
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      return VALIDATION_REGEX.pincode6.test(String(value))
                        ? Promise.resolve()
                        : Promise.reject(new Error(VALIDATION_MESSAGES.pincode6));
                    },
                  },
                ]}
              >
                <Input placeholder="Postcode" maxLength={6} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="Address" name="address">
                <Input placeholder="Address" />
              </Form.Item>
            </Col>

            {!isEdit && (
              <Col xs={24} md={12}>
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
              </Col>
            )}

            <Col xs={24} md={12}>
              <Form.Item label="Role" name="role" rules={[{ required: true, message: "Please select role" }]}>
                <Select
                  options={[
                    { value: "user", label: "User" },
                    { value: "admin", label: "Admin" },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Button
            type="primary"
            htmlType="submit"
            loading={mutation.isPending}
            className="!h-11 !rounded-lg !px-6 !font-semibold"
            style={{ boxShadow: "none" }}
          >
            {isEdit ? "Update User" : "Add User"}
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default AddUserForm;
