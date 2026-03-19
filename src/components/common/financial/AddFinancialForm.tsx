import { Button, Card, Col, DatePicker, Form, Input, Row, Select, Spin, Typography } from "antd";
import dayjs from "dayjs";
import { type FinancialFormValues, useFinancialForm } from "../../../hooks";

const formClassName =
  "app-form [&_.ant-form-item]:!mb-6 [&_.ant-form-item-explain-error]:!mt-1.5 [&_.ant-form-item-label>label]:!text-[13px]";
const requiredLabel = (label: string, isRequired = true) => (
  <span className="font-medium text-[#607257]">
    {label}
    {isRequired && <span className="ml-1 text-red-500">*</span>}
  </span>
);

const inputClass = "!h-11 !rounded-lg";
const selectClass ="!w-full [&_.ant-select-selector]:!h-11 [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selection-item]:!leading-[42px] [&_.ant-select-selection-placeholder]:!leading-[42px]";
const dateClass ="!w-full [&_.ant-picker-input>input]:!h-11 [&_.ant-picker-input>input]:!leading-[42px] [&_.ant-picker]:!rounded-lg [&_.ant-picker]:!h-11";
const secondaryButtonClass ="!h-11 !rounded-lg !border-[#cfe4b7] !bg-[#f7fde8] !px-7 !text-[#4f6841] hover:!border-[#b8d69a] hover:!bg-[#ebffd8] hover:!text-[#3a592b]";

const financialTypeOptions = [
  { value: "Income", label: "Income" },
  { value: "Expense", label: "Expense" },
];

const financialDatePresets = [
  { label: "Today", value: dayjs() },
  { label: "Tomorrow", value: dayjs().add(1, "day") },
  { label: "Yesterday", value: dayjs().subtract(1, "day") },
];

const AddFinancialForm = () => {
  const [form] = Form.useForm<FinancialFormValues>();
  const {goBack, isEdit, isAdmin, isCurrentUserLoading, isUsersLoading, isFinancialLoading, userOptions, mutation, handleSubmit,} = useFinancialForm(form);

  const isPageLoading = isFinancialLoading || isCurrentUserLoading || (isAdmin && isUsersLoading);
  const submitLabel = isEdit ? "Update Record" : "Add Record";

  if (isPageLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="app-form-layout">
      <Card className="app-form-card rounded-2xl">
        <div className="mb-7 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <Typography.Title level={3} className="mb-1 bg-gradient-to-r from-[#5a7e40] to-[#81ab63] bg-clip-text text-transparent">
              {isEdit ? "Update Financial Record" : "Add Financial Record"}
            </Typography.Title>
            <Typography.Text className="text-[#6d8060]">
              Track income and expenses with clear descriptions and dates.
            </Typography.Text>
          </div>
          <Button onClick={goBack} className={secondaryButtonClass}>
            Back
          </Button>
        </div>

        <Form<FinancialFormValues> form={form} layout="vertical" requiredMark={false} onFinish={handleSubmit} className={formClassName} initialValues={{ type: "Income", date: dayjs() }}>
          <Row gutter={[18, 4]}>
            {isAdmin && (
              <Col xs={24} md={12}>
                <Form.Item label={requiredLabel("Assign User")} name="userId" rules={[{ required: true, message: "Please select user" }]}>
                  <Select showSearch loading={isUsersLoading} optionFilterProp="label" placeholder="Select User" options={userOptions} className={selectClass}/>
                </Form.Item>
              </Col>
            )}

            <Col xs={24} md={12}>
              <Form.Item label={requiredLabel("Name")} name="name"
                rules={[
                  { required: true, message: "Please enter name" },
                  { min: 2, message: "Name must be at least 2 characters" },
                ]}
              >
                <Input placeholder="Name" className={inputClass} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={requiredLabel("Type")}
                name="type"
                rules={[{ required: true, message: "Please select type" }]}
              >
                <Select
                  placeholder="Select type"
                  options={financialTypeOptions}
                  className={selectClass}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={requiredLabel("From", false)}
                name="from"
                rules={[{ min: 2, message: "Source must be at least 2 characters" }]}
              >
                <Input placeholder="From (source)" className={inputClass} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={requiredLabel("Amount")}
                name="amount"
                rules={[{ required: true, message: "Please enter amount" }]}
              >
                <Input type="number" inputMode="decimal" placeholder="Amount" className={inputClass} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label={requiredLabel("Date")} name="date" rules={[{ required: true, message: "Please select date" }]} >
                <DatePicker format="DD/MM/YYYY" presets={financialDatePresets} className={dateClass} allowClear />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label={requiredLabel("Description", false)} name="description">
                <Input.TextArea placeholder="Description (optional)" rows={3} />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <Button onClick={goBack} className={secondaryButtonClass}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={mutation.isPending} className="!h-12 !rounded-lg !px-9 !font-semibold">
              {submitLabel}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default AddFinancialForm;
