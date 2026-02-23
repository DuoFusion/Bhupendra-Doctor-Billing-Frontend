import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updateUserProfile, getCurrentUser } from "../../../api/authApi";
import { Button, Card, Col, Form, Input, Row, Tabs, Typography } from "antd";
import type { TabsProps } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../constants/Routes";
import { VALIDATION_MESSAGES, VALIDATION_REGEX } from "../../../constants/validation";
import { notify } from "../../../utils/notify";

interface UserData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  role: string;
}

interface ProfileFormValues {
  firstName: string;
  lastName: string;
  medicalName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  pincode: string;
  address: string;
}

const splitName = (fullName = "") => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" "),
  };
};

const ProfileDetailsForm = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm<ProfileFormValues>();

  const { data: userData, isLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

  const user = userData?.user as UserData | undefined;
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!user) return;
    const { firstName, lastName } = splitName(user.name || "");
    form.setFieldsValue({
      firstName,
      lastName,
      medicalName: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      city: user.city || "",
      state: user.state || "",
      pincode: user.pincode || "",
      address: user.address || "",
    });
  }, [user, form]);

  const mutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      notify.success("Profile updated successfully.");

      queryClient.setQueryData<{ user?: UserData } | undefined>(
        ["currentUser"],
        (prev) => ({
          ...(prev || {}),
          user: data?.user || prev?.user,
        })
      );

      const updatedUser = data?.user as UserData | undefined;
      if (updatedUser) {
        const { firstName, lastName } = splitName(updatedUser.name || "");
        form.setFieldsValue({
          firstName,
          lastName,
          medicalName: updatedUser.name || "",
          email: updatedUser.email || "",
          phone: updatedUser.phone || "",
          city: updatedUser.city || "",
          state: updatedUser.state || "",
          pincode: updatedUser.pincode || "",
          address: updatedUser.address || "",
        });
      }
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        notify.error(error.response?.data?.message || "Failed to update profile");
      } else {
        notify.error("An unexpected error occurred");
      }
    },
  });

  const handleFinish = (values: ProfileFormValues) => {
    const fullName = isAdmin
      ? `${values.firstName} ${values.lastName}`.trim()
      : (values.medicalName || "").trim();

    if (fullName.length < 5) {
      notify.warning(VALIDATION_MESSAGES.nameMin5);
      return;
    }
    mutation.mutate({
      name: fullName,
      email: (values.email || "").trim(),
      phone: (values.phone || "").trim(),
      city: (values.city || "").trim(),
      state: (values.state || "").trim(),
      pincode: (values.pincode || "").trim(),
      address: (values.address || "").trim(),
    });
  };

  const accountForm = (
    <div className="px-4 pb-5 pt-1 sm:px-6 sm:pb-6">
      <Form<ProfileFormValues>
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        requiredMark={false}
        className="profile-settings-form"
      >
        <Row gutter={[16, 0]}>
          {isAdmin ? (
            <>
              <Col xs={24} md={12}>
                <Form.Item
                  label="First Name"
                  name="firstName"
                  rules={[{ required: true, message: "Please enter first name" }]}
                >
                  <Input placeholder="First name" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item label="Last Name" name="lastName">
                  <Input placeholder="Last name" />
                </Form.Item>
              </Col>
            </>
          ) : (
            <Col xs={24} md={24}>
              <Form.Item
                label="Medical Name"
                name="medicalName"
                rules={[{ required: true, message: "Please enter medical name" }]}
              >
                <Input placeholder="Medical name" />
              </Form.Item>
            </Col>
          )}

          <Col xs={24} md={12}>
            <Form.Item
              label="Phone Number"
              name="phone"
              rules={[
                { required: true, message: "Please enter phone number" },
                { pattern: VALIDATION_REGEX.phone10, message: VALIDATION_MESSAGES.phone10 },
              ]}
            >
              <Input placeholder="Enter 10 digit phone number" maxLength={10} />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Email Address"
              name="email"
              rules={[
                { required: true, message: "Please enter email address" },
                { type: "email", message: "Enter a valid email address" },
              ]}
            >
              <Input placeholder="name@example.com" />
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
              <Input placeholder="Pincode" maxLength={6} />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Address" name="address">
              <Input placeholder="Address" />
            </Form.Item>
          </Col>
        </Row>

        <div className="flex flex-wrap gap-3 pt-1">
          <Button
            type="primary"
            htmlType="submit"
            loading={mutation.isPending}
            className="!h-10 !rounded-lg !px-7 !font-semibold"
            style={{ boxShadow: "none" }}
          >
            Update
          </Button>

          <Button
            type="default"
            onClick={() => navigate(ROUTES.AUTH.CHANGE_PASSWORD)}
            className="!h-10 !rounded-lg !px-5 !font-semibold"
            style={{ boxShadow: "none" }}
          >
            Change Password
          </Button>
        </div>
      </Form>
    </div>
  );

  const tabItems: TabsProps["items"] = [
    {
      key: "account",
      label: "Personal Information",
      children: accountForm,
    },
  ];

  return (
    <Card
      className="!rounded-xl !border-[#d8e1ef] !bg-white"
      style={{ boxShadow: "none", textShadow: "none" }}
      styles={{ body: { padding: 0 } }}
      loading={isLoading}
    >
      <div className="border-b border-[#e6ecf7] px-4 py-4 sm:px-6">
        <Typography.Title level={5} className="!mb-1 !text-[#1f2f4f]">
          Profile Settings
        </Typography.Title>
        <Typography.Text className="!text-[13px] !text-[#7483a3]">
          Keep your account information up to date.
        </Typography.Text>
      </div>

      <Tabs
        defaultActiveKey="account"
        className="profile-settings-tabs"
        items={tabItems}
        animated={{ inkBar: true, tabPane: false }}
      />
    </Card>
  );
};

export default ProfileDetailsForm;
