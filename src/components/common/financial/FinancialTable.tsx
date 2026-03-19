import { CheckCircleOutlined, DeleteOutlined, EditOutlined, PlusOutlined, PoweroffOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Card, DatePicker, Input, Select, Space, Table, Tabs, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { ROUTES } from "../../../constants/Routes";
import ConfirmActiveStatusModal from "../confirm/ConfirmActiveStatusModal";
import ServerPaginationControls from "../table/ServerPaginationControls";
import TableEmpty from "../table/TableEmpty";
import TableLoader from "../table/TableLoader";
import { tableActionButtonClass, tableCardClass, tableHeaderClass, tableInputClass, tablePrimaryButtonClass, tableSelectClass, tableSurfaceClass, tableTabClass, tableToolbarActionWrapClass, tableToolbarFiltersClass, tableToolbarLayoutClass,} from "../table/themeClasses";
import { formatCreatedAndUpdatedAt } from "../../../utils/createdAndUpdatedDate";
import { renderNameEmail } from "../../../utils/addedBy";
import { billDateRangePresets, getFinancialAddedByEmail, getFinancialAddedByName, type FinancialRecord, type FinancialStatusTab, useFinancialTable } from "../../../hooks";

const { RangePicker } = DatePicker;

const financialStatusTabs = [ { key: "active", label: "Active Records" }, { key: "inactive", label: "Inactive Records" },] satisfies Array<{ key: FinancialStatusTab; label: string }>;

const FinancialTable = () => {
  const { navigate, isAdmin, statusTab, setStatusTab, searchInput, setSearchInput, selectedType, setSelectedType, dateRange, setDateRange, selectedMedicalStore, setSelectedMedicalStore, page, setPage, limit, setLimit, pendingStatus, medicalStoreOptions, financials, total, totalPages, isLoading, isStoresLoading, isError, error, isFetching, statusMutation, resolveMedicalStoreName, handleDeleteFinancial, closeStatusModal, openStatusModal, applyStatusChange,} = useFinancialTable();

  const formatAmount = (value?: number) => {
    const formatted = new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value || 0));
    return `Rs ${formatted}`;
  };

  const columns: ColumnsType<FinancialRecord> = [
    {
      title: "Sr. No",
      key: "sr_no",
      width: 90,
      render: (_, __, index) => (page - 1) * limit + index + 1,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (value: string) => <Typography.Text strong>{value || "-"}</Typography.Text>,
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (value: string) => <Typography.Text>{value || "-"}</Typography.Text>,
    },
    {
      title: "From",
      dataIndex: "from",
      key: "from",
      render: (value: string) => <Typography.Text>{value || "-"}</Typography.Text>,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (value: number) => <Typography.Text>{formatAmount(value)}</Typography.Text>,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (value: string) => (value ? dayjs(value).format("DD/MM/YYYY") : "-"),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (value: string) => <Typography.Text>{value || "-"}</Typography.Text>,
    },
    ...(isAdmin
      ? [
          {
            title: "Medical Store Name",
            key: "medicalStoreName",
            render: (_: unknown, record: FinancialRecord) => (
              <Typography.Text>{resolveMedicalStoreName(record.medicalStoreId)}</Typography.Text>
            ),
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            title: "Added By",
            key: "addedBy",
            render: (_: unknown, record: FinancialRecord) =>
              renderNameEmail(getFinancialAddedByName(record), getFinancialAddedByEmail(record)),
          },
        ]
      : []),
    {
      title: "Created / Updated At",
      key: "createdUpdated",
      render: (_, record) => formatCreatedAndUpdatedAt(record.createdAt, record.updatedAt),
    },
    {
      title: "Action",
      key: "actions",
      width: 180,
      render: (_, record) => {
        const active = record.isActive !== false;
        return (
          <Space size={10}>
            <Button type="text" icon={active ? <PoweroffOutlined className="text-orange-600" /> : <CheckCircleOutlined className="text-emerald-600" />} onClick={() => openStatusModal(record)} className={tableActionButtonClass} />
            <Button type="text" icon={<EditOutlined className="text-[#4f6841]" />} onClick={() => navigate(ROUTES.FINANCIAL.UPDATE_FINANCIAL.replace(":id", record._id))} className={tableActionButtonClass}/>
            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDeleteFinancial(record._id)} className={`${tableActionButtonClass} hover:!border-[#f7caca] hover:!bg-red-50`}/>
          </Space>
        );
      },
    },
  ];

  if (isLoading || isStoresLoading) return <TableLoader tip="Loading financial records..." />;

  if (isError) {
    return (
      <Typography.Text type="danger" className="p-6">
        {(error as Error).message}
      </Typography.Text>
    );
  }

  return (
    <Card className={tableCardClass}>
      <div className={tableHeaderClass}>
        <div className={tableToolbarLayoutClass}>
          <div className={tableToolbarFiltersClass}>
            <Input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} allowClear prefix={<SearchOutlined className="text-[#6d8060]" />} placeholder="Search by name" className={`${tableInputClass} !w-full sm:!w-[280px] lg:!w-[320px]`}/>

            <Select value={selectedType || undefined} onChange={(value) => setSelectedType(value || "")} options={[{ value: "Income", label: "Income" }, { value: "Expense", label: "Expense" }]} allowClear placeholder="Type" className={`${tableSelectClass} !w-full sm:!w-[200px]`} />

            {isAdmin && (
              <Select  value={selectedMedicalStore || undefined}  onChange={(value) => setSelectedMedicalStore(value || "")}  options={medicalStoreOptions}  allowClear  showSearch  optionFilterProp="label"  placeholder="Select medical store"  className={`${tableSelectClass} !w-full sm:!w-[250px]`}  />
            )}

            <RangePicker value={dateRange} onChange={(values) => setDateRange(values && values[0] && values[1] ? [values[0], values[1]] : null)} presets={billDateRangePresets} allowEmpty={[true, true]} className="!h-11 !w-full sm:!w-[290px] !rounded-xl !border-[#cfe4b7] !bg-[#fefffc] hover:!border-[#b8d69a]" />
          </div>

          <div className={tableToolbarActionWrapClass}>
            <Button type="text" icon={<PlusOutlined />} onClick={() => navigate(ROUTES.FINANCIAL.ADD_FINANCIAL)} className={tablePrimaryButtonClass}>
              Add Record
            </Button>
          </div>
        </div>
      </div>

      <Tabs activeKey={statusTab} onChange={(key) => setStatusTab(key as FinancialStatusTab)} items={financialStatusTabs} className={tableTabClass}/>
      <Table<FinancialRecord> className={tableSurfaceClass} rowKey="_id" columns={columns} dataSource={financials} loading={isFetching && !isLoading} pagination={false} locale={{ emptyText: <TableEmpty description="No financial records found" /> }} scroll={{ x: "max-content" }} />
      <ServerPaginationControls page={page} limit={limit} total={total} totalPages={totalPages} currentCount={financials.length} onPageChange={setPage} onLimitChange={(nextLimit) => { setLimit(nextLimit);setPage(1); }}/>
      <ConfirmActiveStatusModal open={pendingStatus.open} nextIsActive={pendingStatus.nextIsActive} countdown={pendingStatus.secondsLeft} subjectName={pendingStatus.financial?.name} entityLabel="Record" onCancel={closeStatusModal} onConfirm={applyStatusChange} confirmLoading={statusMutation.isPending}/>
    </Card>
  );
};

export default FinancialTable;
