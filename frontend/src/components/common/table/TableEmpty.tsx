import { Empty } from "antd";
import { InboxOutlined } from "@ant-design/icons";

const TableEmpty = ({ description = "No data found" }: { description?: string }) => {
  return (
    <Empty
      image={<InboxOutlined style={{ fontSize: 34, color: "#64748b" }} />}
      description={<span className="text-[#7483a3]">{description}</span>}
    />
  );
};

export default TableEmpty;
