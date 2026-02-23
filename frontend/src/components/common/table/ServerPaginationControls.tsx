import { Pagination, Select, Space, Typography } from "antd";

type ServerPaginationControlsProps = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  currentCount: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

const ServerPaginationControls = ({
  page,
  limit,
  total,
  totalPages,
  currentCount,
  onPageChange,
  onLimitChange,
}: ServerPaginationControlsProps) => {
  return (
    <div className="app-pagination-wrap flex flex-col gap-3 border-t border-[#e6ecf7] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <Typography.Text className="!text-[#7483a3]">
        Showing {currentCount}/{total} results
      </Typography.Text>

      <Space size={12} wrap>
        <Space size={8}>
          <Typography.Text className="!text-[#7483a3]">Rows</Typography.Text>
          <Select
            value={limit}
            onChange={(value) => onLimitChange(value)}
            options={[5, 10, 20, 50].map((size) => ({ value: size, label: size }))}
            className="!w-[86px]"
          />
        </Space>

        <Pagination
          current={totalPages === 0 ? 1 : page}
          total={total}
          pageSize={limit}
          showSizeChanger={false}
          onChange={(nextPage) => onPageChange(nextPage)}
          className="app-pagination"
        />
      </Space>
    </div>
  );
};

export default ServerPaginationControls;
