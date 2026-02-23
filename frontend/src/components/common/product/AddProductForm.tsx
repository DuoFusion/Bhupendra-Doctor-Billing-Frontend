import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ROUTES } from "../../../constants/Routes";
import axios from "axios";
import { getAllCompanies } from "../../../api/companyApi";
import { addProduct, updateProduct, getProductById } from "../../../api/productApi";
import CategorySelector from "../category/CategorySelector";
import { Button, Card, Input, Radio, Select, Spin, Typography } from "antd";
import { VALIDATION_REGEX } from "../../../constants/validation";
import { notify } from "../../../utils/notify";

interface ProductFormData {
  productName: string;
  company: string;
  category: string;
  hsnCode: string;
  batch: string;
  expiry: string;
  mrp: string;
  purchasePrice: string;
  sellingPrice: string;
  gstPercent: string;
  stock: string;
  minStock: string;
  stockStatus: string;
  description: string;
}

const AddProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState<ProductFormData>({
    productName: "",
    company: "",
    category: "",
    hsnCode: "",
    batch: "",
    expiry: "",
    mrp: "",
    purchasePrice: "",
    sellingPrice: "",
    gstPercent: "",
    stock: "",
    minStock: "",
    stockStatus: "In Stock",
    description: "",
  });

  const { data: companiesData, isLoading: isCompaniesLoading } = useQuery({
    queryKey: ["companies"],
    queryFn: getAllCompanies,
  });

  const { data: productData, isLoading: isProductLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (productData) {
      setFormData({
        productName: productData.productName || "",
        company: productData.company?._id || "",
        category: productData.category || "",
        hsnCode: productData.hsnCode || "",
        batch: productData.batch || "",
        expiry: productData.expiry || "",
        mrp: productData.mrp || "",
        purchasePrice: productData.purchasePrice || "",
        sellingPrice: productData.sellingPrice || "",
        gstPercent: productData.gstPercent || "",
        stock: productData.stock || "",
        minStock: productData.minStock || "",
        stockStatus: productData.stockStatus || "In Stock",
        description: productData.description || "",
      });
    }
  }, [productData]);

  const mutation = useMutation({
    mutationFn: (payload: ProductFormData) => (id ? updateProduct(id, payload) : addProduct(payload)),
    onSuccess: () => {
      notify.success(id ? "Product updated successfully." : "Product added successfully.");
      setTimeout(() => navigate(ROUTES.PRODUCTS.GET_PRODUCTS), 900);
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        notify.error(error.response?.data?.message || "Something went wrong");
      } else {
        notify.error("Something went wrong");
      }
    },
  });

  const updateField = (name: keyof ProductFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateProductForm = () => {
    if (formData.productName.trim().length < 2) {
      return "Product name must be at least 2 characters";
    }

    if (!VALIDATION_REGEX.objectId24.test(formData.company)) {
      return "Please select a valid company";
    }

    if (formData.category.trim().length < 2) {
      return "Please select a valid category";
    }

    if (formData.hsnCode.trim().length < 4 || formData.hsnCode.trim().length > 10) {
      return "HSN code must be between 4 and 10 characters";
    }

    if (!formData.expiry.trim()) {
      return "Expiry date is required";
    }

    const mrp = Number(formData.mrp);
    const purchasePrice = Number(formData.purchasePrice);
    const sellingPrice = Number(formData.sellingPrice);
    const gstPercent = Number(formData.gstPercent);
    const stock = Number(formData.stock);
    const minStock = Number(formData.minStock);

    if (!Number.isFinite(mrp) || mrp < 1 || mrp > 100000) {
      return "MRP must be between 1 and 100000";
    }

    if (!Number.isFinite(purchasePrice) || purchasePrice < 0 || purchasePrice > 100000) {
      return "Purchase price must be between 0 and 100000";
    }

    if (!Number.isFinite(sellingPrice) || sellingPrice < 0 || sellingPrice > 100000) {
      return "Selling price must be between 0 and 100000";
    }

    if (![0, 5, 12, 18, 28].includes(gstPercent)) {
      return "GST must be one of: 0, 5, 12, 18, 28";
    }

    if (!Number.isFinite(stock) || stock < 0 || stock > 100000) {
      return "Stock must be between 0 and 100000";
    }

    if (!Number.isFinite(minStock) || minStock < 0 || minStock > 10000) {
      return "Minimum stock must be between 0 and 10000";
    }

    if (!["In Stock", "Low Stock", "Out Of Stock"].includes(formData.stockStatus)) {
      return "Please select a valid stock status";
    }

    return "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationMessage = validateProductForm();
    if (validationMessage) {
      notify.warning(validationMessage);
      return;
    }

    const payload: any = {
      ...formData,
      productName: formData.productName.trim(),
      company: formData.company.trim(),
      category: formData.category.trim(),
      hsnCode: formData.hsnCode.trim(),
      batch: formData.batch.trim(),
      expiry: formData.expiry.trim(),
      description: formData.description.trim(),
      mrp: Number(formData.mrp),
      purchasePrice: Number(formData.purchasePrice),
      sellingPrice: Number(formData.sellingPrice),
      gstPercent: Number(formData.gstPercent),
      stock: Number(formData.stock),
      minStock: Number(formData.minStock),
    };

    mutation.mutate(payload);
  };

  if (isProductLoading || isCompaniesLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="app-form-page p-4 sm:p-6">
      <Card className="app-form-card !mx-auto !max-w-6xl !rounded-2xl !border-[#d7e1f0] !bg-white" style={{ boxShadow: "none" }}>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Typography.Title level={4} className="!mb-0 !text-[#1f2f4f]">
            {id ? "Update Product" : "Add Product"}
          </Typography.Title>
          <Button onClick={() => navigate(-1)} style={{ boxShadow: "none" }}>
            Back
          </Button>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <Typography.Text className="!mb-2 !block !text-[#637397]">Product Name</Typography.Text>
            <Input
              value={formData.productName}
              onChange={(e) => updateField("productName", e.target.value)}
              placeholder="Enter product name"
            />
          </div>

          <div>
            <Typography.Text className="!mb-2 !block !text-[#637397]">Company</Typography.Text>
            <Select
              value={formData.company || undefined}
              onChange={(value) => updateField("company", value)}
              options={(companiesData?.companies || []).map((c: any) => ({ value: c._id, label: c.companyName }))}
              placeholder="Select Company"
              className="!w-full"
            />
          </div>

          <div>
            <Typography.Text className="!mb-2 !block !text-[#637397]">Category</Typography.Text>
            <CategorySelector value={formData.category} onChange={(v: string) => updateField("category", v)} />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Input value={formData.hsnCode} onChange={(e) => updateField("hsnCode", e.target.value)} placeholder="HSN Code" />
            <Input value={formData.batch} onChange={(e) => updateField("batch", e.target.value)} placeholder="Batch" />
            <Input type="date" value={formData.expiry} onChange={(e) => updateField("expiry", e.target.value)} />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Input type="number" value={formData.mrp} onChange={(e) => updateField("mrp", e.target.value)} placeholder="MRP" />
            <Input type="number" value={formData.purchasePrice} onChange={(e) => updateField("purchasePrice", e.target.value)} placeholder="Purchase Price" />
            <Input type="number" value={formData.sellingPrice} onChange={(e) => updateField("sellingPrice", e.target.value)} placeholder="Selling Price" />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Input type="number" value={formData.gstPercent} onChange={(e) => updateField("gstPercent", e.target.value)} placeholder="GST %" />
            <Input type="number" value={formData.stock} onChange={(e) => updateField("stock", e.target.value)} placeholder="Stock Quantity" />
            <Input type="number" value={formData.minStock} onChange={(e) => updateField("minStock", e.target.value)} placeholder="Minimum Stock" />
          </div>

          <div>
            <Typography.Text className="!mb-2 !block !text-[#637397]">Stock Status</Typography.Text>
            <Radio.Group
              value={formData.stockStatus}
              onChange={(e) => updateField("stockStatus", e.target.value)}
              options={["In Stock", "Low Stock", "Out Of Stock"].map((status) => ({
                label: status,
                value: status,
              }))}
            />
          </div>

          <div>
            <Typography.Text className="!mb-2 !block !text-[#637397]">Description</Typography.Text>
            <Input.TextArea
              rows={4}
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Enter product description"
            />
          </div>

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <Button onClick={() => navigate(-1)} style={{ boxShadow: "none" }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={mutation.isPending} style={{ boxShadow: "none" }}>
              {id ? "Update Product" : "Add Product"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddProductForm;
