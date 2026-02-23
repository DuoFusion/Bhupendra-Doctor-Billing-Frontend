import type { Table } from "@tanstack/react-table";
import { Pagination, Select, Space, Typography } from "antd";

type TablePaginationControlsProps<TData> = {
  table: Table<TData>;
};

const TablePaginationControls = <TData,>({ table }: TablePaginationControlsProps<TData>) => {
  const totalRows = table.getPrePaginationRowModel().rows.length;
  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();
  const pageSize = table.getState().pagination.pageSize;

  return (
    <div className="app-pagination-wrap flex flex-col gap-3 border-t border-[#e6ecf7] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <Typography.Text className="!text-[#7483a3]">
        Showing {totalRows === 0 ? 0 : table.getRowModel().rows.length}/{totalRows} results
      </Typography.Text>

      <Space size={12} wrap>
        <Space size={8}>
          <Typography.Text className="!text-[#7483a3]">Rows</Typography.Text>
          <Select
            value={pageSize}
            onChange={(value) => table.setPageSize(value)}
            options={[5, 10, 20, 50].map((size) => ({ value: size, label: size }))}
            className="!w-[86px]"
          />
        </Space>

        <Pagination
          current={totalPages === 0 ? 1 : currentPage}
          total={totalRows}
          pageSize={pageSize}
          showSizeChanger={false}
          onChange={(nextPage) => table.setPageIndex(nextPage - 1)}
          className="app-pagination"
        />
      </Space>
    </div>
  );
};

export default TablePaginationControls;
