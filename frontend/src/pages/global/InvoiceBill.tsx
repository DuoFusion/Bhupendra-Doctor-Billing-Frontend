import { useRef } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import html2pdf from "html2pdf.js";
import { getBillById } from "../../api/billApi";
import { URL_KEYS } from "../../constants/Url";

const InvoiceBill = () => {
  const { id } = useParams();
  const invoiceRef = useRef<HTMLDivElement>(null);

  const {
    data: bill,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["singleBill", id],
    queryFn: () => getBillById(id as string),
    enabled: !!id,
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!invoiceRef.current || !bill) return;

    const pdfOptions: any = {
      margin: 0,
      filename: `Invoice-${bill.billNumber}.pdf`,
      image: { type: "jpeg", quality: 1 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: 0,
      },
      pagebreak: { mode: ["css"] },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    const worker = html2pdf()
      .set(pdfOptions)
      .from(invoiceRef.current)
      .toPdf();

    worker.get("pdf").then((pdf: any) => {
      const totalPages = pdf.internal.getNumberOfPages();
      for (let page = totalPages; page > 1; page--) {
        pdf.deletePage(page);
      }
      worker.save();
    });
  };

  if (isLoading) return <p>Loading...</p>;
  if (isError || !bill) return <p>Bill Not Found</p>;

  const company = bill.items?.[0]?.company;
  const user = bill.user || {};
  const companyLocation = [company?.city, company?.state, company?.pincode].filter(Boolean).join(", ");
  const userLocation = [user?.city, user?.state, user?.pincode].filter(Boolean).join(", ");

  const formatCurrency = (value: number | string | undefined) => {
    const num = Number(value || 0);
    return `Rs ${num.toFixed(2)}`;
  };

  const formatDate = (value: string | undefined) => {
    if (!value) return "-";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString("en-CA");
  };

  return (
    <>
      <div className="invoice-page" ref={invoiceRef}>
        <div className="invoice-wrapper">
          <div className="invoice-accent-bar" />

        <div className="invoice-header">
          <div className="company-brand">
            <img
              crossOrigin="anonymous"
              src={
                company?.logoImage
                  ? company?.logoImage.startsWith("http")
                    ? company?.logoImage
                    : `http://localhost:7000${URL_KEYS.UPLOAD.GET_IMAGE}/${company?.logoImage}`
                  : "https://via.placeholder.com/48"
              }
              alt={company?.companyName || "logo"}
            />
            <div>
              <h2>{company?.companyName || "-"}</h2>
              <p className="company-subtitle">Medical Billing Invoice</p>
            </div>
          </div>

          <div className="invoice-meta">
            <h1>INVOICE</h1>
            <p>Bill No: {bill.billNumber || "-"}</p>
            <p>Date: {bill.createdAt ? new Date(bill.createdAt).toLocaleDateString() : "-"}</p>
          </div>

          <div className="info-card">
            <h4>Invoice From</h4>
            <p>{[company?.address, companyLocation].filter(Boolean).join(", ") || "-"}</p>
            <p>Phone: {company?.phone || "-"}</p>
            <p>Email: {company?.email || "-"}</p>
            <p>GST: {company?.gstNumber?.toUpperCase?.() || "-"}</p>
          </div>

          <div className="info-card">
            <h4>Invoice To</h4>
            <p>Name: {user?.name || "-"}</p>
            <p>Phone: {user?.phone || "-"}</p>
            <p>Email: {user?.email || "-"}</p>
            <p>Address: {user?.address || "-"}</p>
            <p>{userLocation || "-"}</p>
          </div>
        </div>

        <div className="invoice-table-wrap">
          <table className="invoice-table">
            <thead>
              <tr>
                <th>SR</th>
                <th>Product</th>
                <th>HSN</th>
                <th>EXP</th>
                <th>QTY</th>
                <th>RATE</th>
                <th>GST%</th>
                <th>GST AMT</th>
                <th>PAYMENT</th>
                <th>STATUS</th>
                <th>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {bill.items.map((item: any, index: number) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.productName || "-"}</td>
                  <td>{item.hsnCode || "-"}</td>
                  <td>{formatDate(item.expiry)}</td>
                  <td>{item.qty || 0}</td>
                  <td>{formatCurrency(item.rate)}</td>
                  <td>{item.gstPercent || 0}%</td>
                  <td>{formatCurrency(item.gstAmount)}</td>
                  <td>{bill.paymentMethod || "-"}</td>
                  <td>
                    <span className={`invoice-status ${bill.billStatus === "Paid" ? "paid" : "unpaid"}`}>
                      {bill.billStatus || "-"}
                    </span>
                  </td>
                  <td className="amount-cell">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="invoice-lower">
          <div className="summary">
            <div className="summary-row">
              <span>Sub Total</span>
              <span>{formatCurrency(bill.subTotal)}</span>
            </div>
            <div className="summary-row">
              <span>Total GST</span>
              <span>{formatCurrency(bill.totalGST)}</span>
            </div>
            <div className="summary-row">
              <span>Discount</span>
              <span>{formatCurrency(bill.discount)}</span>
            </div>
            <div className="summary-row summary-total">
              <span>Grand Total</span>
              <span>{formatCurrency(bill.grandTotal)}</span>
            </div>
          </div>

          <div className="signature-section">
            <p className="signature-label">Authorized Sign</p>
            <div className="signature-line" />
            <p className="signature-name">{company?.companyName || "Company"}</p>
          </div>
        </div>

          <div className="footer">Thank you for your business.</div>
        </div>
      </div>

      <div className="button-wrapper">
        <button className="btn btn-print" onClick={handlePrint}>
          Print PDF
        </button>
        <button className="btn btn-download" onClick={handleDownload}>
          Download PDF
        </button>
      </div>
    </>
  );
};

export default InvoiceBill;
