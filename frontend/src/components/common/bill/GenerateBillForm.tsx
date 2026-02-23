import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { getAllCompanies } from "../../../api/companyApi";
import { getAllProducts } from "../../../api/productApi";
import { getCurrentUser } from "../../../api/authApi";
import { addBill, getBillById, updateBill } from "../../../api/billApi";
import { ROUTES } from "../../../constants/Routes";
import { Button, Card, Input, Radio, Select, Spin, Typography } from "antd";
import { VALIDATION_REGEX } from "../../../constants/validation";
import { notify } from "../../../utils/notify";

const GenerateBillForm = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();

  const { data: currentUserData, isLoading: isUserLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

  const { data: companiesData, isLoading: isCompaniesLoading } = useQuery({
    queryKey: ["companies"],
    queryFn: getAllCompanies,
  });

  const { data: productsData, isLoading: isProductsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: getAllProducts,
  });

  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [qty, setQty] = useState<number | "">(1);
  const [freeQty, setFreeQty] = useState<number | "">(0);
  const [itemDiscount, setItemDiscount] = useState<number | "">(0);
  const [items, setItems] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>("Cash");
  const [billDiscount, setBillDiscount] = useState<number | "">(0);
  const [billStatus, setBillStatus] = useState<string>("");
  const [itemErrors, setItemErrors] = useState<{ product?: string; qty?: string }>({});
  const [formErrors, setFormErrors] = useState<{ company?: string; items?: string; paymentMethod?: string; billStatus?: string }>({});

  const userId = currentUserData?.user?._id;
  const myCompanies = companiesData?.companies?.filter((c: any) => {
    if (currentUserData?.user?.role === "admin") return true;
    return c.user?._id === userId;
  });

  const productsForCompany = productsData?.products?.filter((p: any) => p.company?._id === selectedCompany) || [];

  useEffect(() => {
    if (id) return;
    setSelectedProduct("");
    setItems([]);
  }, [selectedCompany, id]);

  const { data: billData, isLoading: isBillLoading } = useQuery({
    queryKey: ["bill", id],
    queryFn: () => getBillById(id as string),
    enabled: !!id,
  });

  const companyOptions = (() => {
    const base = myCompanies ? [...myCompanies] : [];
    if (!billData) return base;
    const billCompanyId = billData.company?._id || billData.company || billData.items?.[0]?.company?._id || billData.items?.[0]?.company;
    if (!billCompanyId) return base;
    const exists = base.find((c: any) => c._id === billCompanyId);
    if (exists) return base;
    const companyName = billData.company?.companyName || billData.items?.[0]?.company?.companyName || billData.companyName || "Selected Company";
    return [...base, { _id: billCompanyId, companyName }];
  })();

  useEffect(() => {
    if (!billData) return;
    const b = billData;
    setSelectedCompany(
      b.company?._id || b.company || b.items?.[0]?.company?._id || b.items?.[0]?.company || ""
    );
    setPaymentMethod(b.paymentMethod || "Cash");
    setBillDiscount(b.discount ?? 0);
    setBillStatus(b.status || b.billStatus || "");

    const mappedItems = (b.items || []).map((it: any) => {
      const prod = it.product || {};
      return {
        product: prod._id || prod,
        productName: prod.productName || it.productName || "",
        qty: it.qty || 0,
        freeQty: it.freeQty || 0,
        discount: it.discount || 0,
        sellingPrice: prod.sellingPrice || it.sellingPrice || 0,
        gstPercent: prod.gstPercent || it.gstPercent || 0,
      };
    });

    setItems(mappedItems);
  }, [billData]);

  const subtotal = items.reduce((sum, it) => {
    const line = it.qty * it.sellingPrice - (Number(it.discount) || 0);
    return sum + line;
  }, 0);

  const gstTotal = items.reduce((sum, it) => {
    const taxable = it.qty * it.sellingPrice - (Number(it.discount) || 0);
    return sum + (taxable * (Number(it.gstPercent) || 0)) / 100;
  }, 0);

  const grandTotal = subtotal + gstTotal - (Number(billDiscount) || 0);

  const addItemToList = () => {
    const newItemErrors: { product?: string; qty?: string } = {};
    if (!selectedCompany) newItemErrors.product = "Select a company first";
    if (!selectedProduct) newItemErrors.product = "Please select a product";
    if (qty === "" || Number(qty) < 1) newItemErrors.qty = "Quantity must be at least 1";
    if (Number(freeQty) < 0) newItemErrors.qty = "Free quantity cannot be negative";
    if (Number(itemDiscount) < 0) newItemErrors.qty = "Item discount cannot be negative";
    setItemErrors(newItemErrors);
    if (Object.keys(newItemErrors).length > 0) return;

    const productObj = productsForCompany.find((p: any) => p._id === selectedProduct);
    if (!productObj) {
      setItemErrors({ product: "Selected product not found" });
      return;
    }

    const newItem = {
      product: productObj._id,
      productName: productObj.productName,
      qty: qty === "" ? 0 : Number(qty),
      freeQty: Number(freeQty) || 0,
      discount: Number(itemDiscount) || 0,
      gstPercent: productObj.gstPercent || 0,
      sellingPrice: productObj.sellingPrice,
    };

    setItems((prev) => [...prev, newItem]);
    setSelectedProduct("");
    setQty(1);
    setFreeQty(0);
    setItemDiscount(0);
    setItemErrors({});
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const mutation = useMutation({
    mutationFn: (data: any) => (id ? updateBill(id, data) : addBill(data)),
    onSuccess: () => {
      notify.success(id ? "Bill updated successfully." : "Bill generated successfully.");
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      setTimeout(() => navigate(ROUTES.BILL.GET_BILLS), 900);
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        notify.error(error.response?.data?.message || "Something went wrong");
      } else {
        notify.error("Something went wrong");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newFormErrors: { company?: string; items?: string; paymentMethod?: string; billStatus?: string } = {};
    if (!userId || !VALIDATION_REGEX.objectId24.test(userId)) {
      notify.error("Invalid user session. Please sign in again.");
      return;
    }
    if (!selectedCompany) newFormErrors.company = "Please select a company";
    if (selectedCompany && !VALIDATION_REGEX.objectId24.test(selectedCompany)) newFormErrors.company = "Please select a valid company";
    if (items.length === 0) newFormErrors.items = "Add at least one item to generate bill";
    if (!paymentMethod) newFormErrors.paymentMethod = "Select a payment method";
    if (!billStatus) newFormErrors.billStatus = "Select a bill status";
    if (Number(billDiscount) < 0) newFormErrors.items = "Bill discount cannot be negative";

    const invalidItem = items.find(
      (it) =>
        !VALIDATION_REGEX.objectId24.test(String(it.product)) ||
        Number(it.qty) < 1 ||
        Number(it.freeQty) < 0 ||
        Number(it.discount) < 0
    );
    if (invalidItem) {
      newFormErrors.items = "Please keep valid items: quantity >= 1 and discount/free qty >= 0";
    }

    setFormErrors(newFormErrors);
    if (Object.keys(newFormErrors).length > 0) return;

    const payload = {
      user: userId,
      company: selectedCompany,
      items: items.map((it) => ({ product: it.product, qty: it.qty, freeQty: it.freeQty, discount: it.discount })),
      paymentMethod,
      discount: Number(billDiscount) || 0,
      billStatus,
    };

    mutation.mutate(payload);
  };

  if (isUserLoading || isCompaniesLoading || isProductsLoading || isBillLoading)
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Spin size="large" />
      </div>
    );

  return (
    <div className="app-form-page p-4 sm:p-6">
      <Card className="app-form-card !mx-auto !max-w-6xl !rounded-2xl !border-[#d7e1f0] !bg-white" style={{ boxShadow: "none" }}>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Typography.Title level={4} className="!mb-0 !text-[#1f2f4f]">
            {id ? "Update Bill" : "Generate Bill"}
          </Typography.Title>
          <Button onClick={() => navigate(-1)} style={{ boxShadow: "none" }}>
            Back
          </Button>
        </div>

        <form className="space-y-8" onSubmit={handleSubmit}>
          <div>
            <Typography.Text className="!mb-2 !block !text-[#637397]">Select Company</Typography.Text>
            <Select
              value={selectedCompany || undefined}
              onChange={(value) => setSelectedCompany(value)}
              options={(companyOptions || []).map((c: any) => ({ value: c._id, label: c.companyName }))}
              placeholder="Select Company"
              className="!w-full"
            />
            {formErrors.company && <p className="mt-2 text-sm text-[#dc2626]">{formErrors.company}</p>}
          </div>

          <div className="rounded-xl border border-[#e6ecf7] p-4">
            <Typography.Title level={5} className="!mb-4 !text-[#1f2f4f]">
              Add Product Item
            </Typography.Title>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Typography.Text className="!mb-2 !block !text-[#637397]">Product</Typography.Text>
                <Select
                  value={selectedProduct || undefined}
                  onChange={(value) => setSelectedProduct(value)}
                  options={productsForCompany.map((p: any) => ({ value: p._id, label: p.productName }))}
                  placeholder="Select Product"
                  disabled={!selectedCompany}
                  className="!w-full"
                />
                {itemErrors.product && <p className="mt-2 text-sm text-[#dc2626]">{itemErrors.product}</p>}
                {itemErrors.qty && <p className="mt-2 text-sm text-[#dc2626]">{itemErrors.qty}</p>}
              </div>

              <div>
                <Typography.Text className="!mb-2 !block !text-[#637397]">Qty</Typography.Text>
                <Input
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(e.target.value === "" ? "" : Number(e.target.value))}
                  disabled={!selectedCompany}
                  min={1}
                />
              </div>

              <div>
                <Typography.Text className="!mb-2 !block !text-[#637397]">Free Qty</Typography.Text>
                <Input
                  type="number"
                  value={freeQty}
                  onChange={(e) => setFreeQty(e.target.value === "" ? "" : Number(e.target.value))}
                  disabled={!selectedCompany}
                  min={0}
                />
              </div>

              <div>
                <Typography.Text className="!mb-2 !block !text-[#637397]">Item Discount</Typography.Text>
                <Input
                  type="number"
                  value={itemDiscount}
                  onChange={(e) => setItemDiscount(e.target.value === "" ? "" : Number(e.target.value))}
                  disabled={!selectedCompany}
                  min={0}
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <Button type="primary" onClick={addItemToList} disabled={!selectedCompany} style={{ boxShadow: "none" }}>
                Add Item
              </Button>
              <Typography.Text className="!text-[#7483a3]">{items.length} item(s) added</Typography.Text>
            </div>

            {formErrors.items && <p className="mt-2 text-sm text-[#dc2626]">{formErrors.items}</p>}

            {items.length > 0 && (
              <div className="app-table-scroll mt-4 overflow-x-auto rounded-lg border border-[#e6ecf7]">
                <table className="app-data-table min-w-[760px] w-full text-left text-sm text-[#3e5175]">
                  <thead>
                    <tr>
                      <th className="px-3 py-2">Product</th>
                      <th className="px-3 py-2">Qty</th>
                      <th className="px-3 py-2">Free</th>
                      <th className="px-3 py-2">Item Discount</th>
                      <th className="px-3 py-2">Price</th>
                      <th className="px-3 py-2 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2">{it.productName}</td>
                        <td className="px-3 py-2">{it.qty}</td>
                        <td className="px-3 py-2">{it.freeQty}</td>
                        <td className="px-3 py-2">{it.discount}</td>
                        <td className="px-3 py-2">Rs {((it.qty * it.sellingPrice - (Number(it.discount) || 0)) || 0).toFixed(2)}</td>
                        <td className="px-3 py-2 text-center">
                          <Button danger size="small" onClick={() => removeItem(idx)}>
                            Remove
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-4 rounded-lg border border-[#e6ecf7] bg-[#fbfcff] p-4">
              <Typography.Text className="!mb-3 !block !text-[#637397]">Summary</Typography.Text>
              <div className="flex justify-between text-sm"><span>Subtotal</span><span>Rs {subtotal.toFixed(2)}</span></div>
              <div className="mt-2 flex justify-between text-sm"><span>GST</span><span>Rs {gstTotal.toFixed(2)}</span></div>
              <div className="mt-2 flex justify-between text-sm"><span>Bill Discount</span><span>- Rs {(Number(billDiscount) || 0).toFixed(2)}</span></div>
              <div className="mt-4 flex items-center justify-between border-t border-[#e6ecf7] pt-3">
                <span className="text-sm text-[#637397]">Grand Total</span>
                <span className="text-lg font-semibold text-[#1f2f4f]">Rs {grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <Typography.Text className="!mb-3 !block !text-[#637397]">Payment Method</Typography.Text>
              <Radio.Group
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                options={["Cash", "UPI", "Card", "Net Banking"].map((method) => ({ label: method, value: method }))}
              />
              {formErrors.paymentMethod && <p className="mt-2 text-sm text-[#dc2626]">{formErrors.paymentMethod}</p>}
            </div>

            <div>
              <Typography.Text className="!mb-3 !block !text-[#637397]">Bill Status</Typography.Text>
              <Radio.Group
                value={billStatus}
                onChange={(e) => setBillStatus(e.target.value)}
                options={["Paid", "Unpaid", "Cancelled"].map((s) => ({ label: s, value: s }))}
              />
              {formErrors.billStatus && <p className="mt-2 text-sm text-[#dc2626]">{formErrors.billStatus}</p>}
            </div>
          </div>

          <div>
            <Typography.Text className="!mb-2 !block !text-[#637397]">Bill Discount (optional)</Typography.Text>
            <Input
              type="number"
              value={billDiscount}
              onChange={(e) => setBillDiscount(e.target.value === "" ? "" : Number(e.target.value))}
              min={0}
            />
          </div>

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <Button onClick={() => navigate(-1)} style={{ boxShadow: "none" }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={mutation.isPending} style={{ boxShadow: "none" }}>
              {id ? "Update Bill" : "Generate Bill"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default GenerateBillForm;
