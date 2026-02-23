import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { addCompany, updateCompany, getCompanyById } from "../../../api/companyApi";
import { ROUTES } from "../../../constants/Routes";
import { Button, Card, Form, Input, Upload, Typography } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { VALIDATION_MESSAGES, VALIDATION_REGEX } from "../../../constants/validation";
import { notify } from "../../../utils/notify";

interface CompanyFormData {
  companyName: string;
  gstNumber: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  pincode: string;
  address: string;
}

const AddCompanyForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm<CompanyFormData>();

  const [logo, setLogo] = useState<File | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["company", id],
    queryFn: () => getCompanyById(id as string),
    enabled: !!id,
  });

  useEffect(() => {
    if (!data) return;

    form.setFieldsValue({
      companyName: data.companyName || "",
      gstNumber: data.gstNumber || "",
      phone: data.phone || "",
      email: data.email || "",
      city: data.city || "",
      state: data.state || "",
      pincode: data.pincode || "",
      address: data.address || "",
    });
  }, [data, form]);

  const mutation = useMutation({
    mutationFn: (payload: CompanyFormData & { logo?: File | null }) =>
      id ? updateCompany(id, payload) : addCompany(payload),
    onSuccess: () => {
      notify.success(id ? "Company updated successfully." : "Company added successfully.");
      setTimeout(() => {
        navigate(ROUTES.COMPANY.GET_COMPANY);
      }, 900);
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        notify.error(error.response?.data?.message || "Something went wrong");
      } else {
        notify.error("Something went wrong");
      }
    },
  });

  const handleSubmit = (values: CompanyFormData) => {
    const payload: CompanyFormData = {
      ...values,
      companyName: (values.companyName || "").trim(),
      gstNumber: (values.gstNumber || "").trim().toUpperCase(),
      phone: (values.phone || "").trim(),
      email: (values.email || "").trim(),
      city: (values.city || "").trim(),
      state: (values.state || "").trim(),
      pincode: (values.pincode || "").trim(),
      address: (values.address || "").trim(),
    };
    mutation.mutate({
      ...payload,
      logo,
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Typography.Text>Loading...</Typography.Text>
      </div>
    );
  }

  return (
    <div className="app-form-page p-4 sm:p-6">
      <Card className="app-form-card !mx-auto !max-w-6xl !rounded-2xl !border-[#d7e1f0] !bg-white" style={{ boxShadow: "none" }}>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Typography.Title level={4} className="!mb-0 !text-[#1f2f4f]">
            {id ? "Update Company" : "Add Company"}
          </Typography.Title>
          <Button onClick={() => navigate(-1)} style={{ boxShadow: "none" }}>
            Back
          </Button>
        </div>

        <Form<CompanyFormData>
          form={form}
          layout="vertical"
          requiredMark={false}
          className="app-form"
          onFinish={handleSubmit}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Form.Item
              label="Company Name"
              name="companyName"
              rules={[
                { required: true, message: "Please enter company name" },
                { min: 3, message: "Company name must be at least 3 characters" },
              ]}
            >
              <Input placeholder="Enter company name" />
            </Form.Item>

            <Form.Item
              label="GST Number"
              name="gstNumber"
              rules={[
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    return VALIDATION_REGEX.gst15.test(String(value).toUpperCase())
                      ? Promise.resolve()
                      : Promise.reject(new Error(VALIDATION_MESSAGES.gst15));
                  },
                },
              ]}
            >
              <Input placeholder="Enter GST number" maxLength={15} style={{ textTransform: "uppercase" }} />
            </Form.Item>

            <Form.Item
              label="Phone Number"
              name="phone"
              rules={[
                { required: true, message: "Please enter phone number" },
                { pattern: VALIDATION_REGEX.phone10, message: VALIDATION_MESSAGES.phone10 },
              ]}
            >
              <Input placeholder="Enter phone number" maxLength={10} />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Form.Item label="Email" name="email" rules={[{ type: "email", message: "Please enter valid email" }]}>
              <Input placeholder="Enter email" />
            </Form.Item>

            <Form.Item label="City" name="city">
              <Input placeholder="Enter city" />
            </Form.Item>

            <Form.Item label="State" name="state">
              <Input placeholder="Enter state" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Form.Item
              label="Pincode"
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
              <Input placeholder="Enter pincode" maxLength={6} />
            </Form.Item>

            <Form.Item label="Address" name="address">
              <Input placeholder="Enter company address" />
            </Form.Item>
          </div>

          <Form.Item label="Company Logo">
            <Upload
              beforeUpload={(file) => {
                setLogo(file);
                return false;
              }}
              maxCount={1}
              showUploadList={{ showRemoveIcon: true }}
            >
              <Button icon={<UploadOutlined />}>Select Logo</Button>
            </Upload>
          </Form.Item>

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <Button onClick={() => navigate(-1)} style={{ boxShadow: "none" }}>
              Cancel
            </Button>

            <Button type="primary" htmlType="submit" loading={mutation.isPending} style={{ boxShadow: "none" }}>
              {id ? "Update Company" : "Add Company"}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default AddCompanyForm;
