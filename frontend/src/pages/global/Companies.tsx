import CompanyTable from "../../components/common/company/CompanyTable";

const Companies = () => {
  return (
    <div className="mt-6 min-h-[calc(100vh-7rem)] text-[#24395d]">
      <div className="w-full overflow-hidden rounded-2xl">
        <CompanyTable />
      </div>
    </div>
  );
};

export default Companies;
