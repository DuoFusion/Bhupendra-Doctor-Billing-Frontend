import BillTable from "../../components/common/bill/BillTable";

const Bills = () => {
  return (
    <div className="mt-6 min-h-[calc(100vh-7rem)] text-[#24395d]">
      <div className="w-full overflow-hidden rounded-2xl">
        <BillTable />
      </div>
    </div>
  );
};

export default Bills;
