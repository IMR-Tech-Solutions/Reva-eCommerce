import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ButtonLoading from "../../components/common/ButtonLoading";
import Label from "../../components/form/Label";
import FileInput from "../../components/form/input/FileInput";
import { toast } from "react-toastify";
import { handleError } from "../../utils/handleError";
import { getmycategoryservice } from "../../services/categoryservices";
import { CategoryData } from "../../types/types";
import { addproductservice } from "../../services/productservices";
import ButtonComponentCard from "../../Admin/Components/ButtonComponentCard";
import { all_routes } from "../../Router/allroutes";

const AddProducts = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [productData, setProductData] = useState({
    category: "",
    product_name: "",
    sku_code: "",
    description: "",
    unit: "",
    low_stock_threshold: "10",
    is_live: false,
    is_active: true,
    // Equipment specification fields
    material: "",
    capacity: "",
    pressure: "",
    flow_rate: "",
    motor_hp: "",
    price: "",
  });
  const [productImage, setProductImage] = useState<File | null>(null);
  const [categories, setCategories] = useState<CategoryData[]>([]);

  const fetchCategories = async () => {
    try {
      const res = await getmycategoryservice();
      setCategories(res);
    } catch (err) {
      handleError(err);
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      setProductData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setProductData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setProductImage(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const requiredFields = [
      "category",
      "product_name",
      "sku_code",
      "unit",
      "low_stock_threshold",
    ];

    for (const field of requiredFields) {
      if (!productData[field as keyof typeof productData]) {
        toast.error(`${field.replace("_", " ")} is required.`);
        return;
      }
    }

    if (parseInt(productData.low_stock_threshold) < 0) {
      toast.error("Low stock threshold must be a positive number.");
      return;
    }

    setIsLoading(true);

    const data = new FormData();
    for (const key in productData) {
      const value = (productData as any)[key];
      if (typeof value === "boolean") {
        data.append(key, value.toString());
      } else {
        data.append(key, value);
      }
    }
    if (productImage) {
      data.append("product_image", productImage);
    }

    try {
      await addproductservice(data);
      toast.success("Product added successfully!");
      setProductData({
        category: "",
        product_name: "",
        sku_code: "",
        description: "",
        unit: "",
        low_stock_threshold: "10",
        is_live: false,
        is_active: true,
        material: "",
        capacity: "",
        pressure: "",
        flow_rate: "",
        motor_hp: "",
        price: "",
      });
      setProductImage(null);

      // Reset file input
      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (err) {
      handleError(err);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Add Product"
        description="Add a new product to Inventa System"
      />
      <PageBreadcrumb pageTitle="Add New Product" />
      <ButtonComponentCard
        title="Product Information"
        buttonlink={all_routes.products}
        buttontitle="View All Products"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-3">
            <div>
              <Label>Category</Label>
              <select
                name="category"
                value={productData.category}
                onChange={handleChange}
                className="input-field"
              >
                <option value="" className="text-black">
                  Select Category
                </option>
                {categories.map((category: CategoryData) => (
                  <option
                    key={category.id}
                    value={category.id}
                    className="text-black"
                  >
                    {category.category_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Product Name</Label>
              <input
                type="text"
                name="product_name"
                value={productData.product_name}
                onChange={handleChange}
                className="input-field"
                maxLength={150}
                placeholder="Enter product name"
              />
            </div>
            <div>
              <Label>SKU Code</Label>
              <input
                type="text"
                name="sku_code"
                value={productData.sku_code}
                onChange={handleChange}
                className="input-field"
                maxLength={50}
                placeholder="Enter SKU code "
              />
            </div>
            <div>
              <Label>Unit</Label>
              <input
                type="text"
                name="unit"
                value={productData.unit}
                onChange={handleChange}
                className="input-field"
                maxLength={50}
                placeholder="e.g., pieces, kg, liters"
              />
            </div>
            <div>
              <Label>Low Stock Threshold</Label>
              <input
                type="number"
                name="low_stock_threshold"
                value={productData.low_stock_threshold}
                onChange={handleChange}
                className="input-field"
                min="0"
              />
            </div>

            <div>
              <Label>Price (₹)</Label>
              <input
                type="number"
                name="price"
                value={productData.price}
                onChange={handleChange}
                className="input-field"
                min="0"
                step="0.01"
                placeholder="Enter price"
              />
            </div>
          </div>

          {/* Equipment Specifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-3">
            <div>
              <Label>Material</Label>
              <input
                type="text"
                name="material"
                value={productData.material}
                onChange={handleChange}
                className="input-field"
                maxLength={100}
                placeholder="e.g., SS316, MS, SS304"
              />
            </div>
            <div>
              <Label>Capacity</Label>
              <input
                type="text"
                name="capacity"
                value={productData.capacity}
                onChange={handleChange}
                className="input-field"
                maxLength={100}
                placeholder="e.g., 1000L, 500kg"
              />
            </div>
            <div>
              <Label>Pressure</Label>
              <input
                type="text"
                name="pressure"
                value={productData.pressure}
                onChange={handleChange}
                className="input-field"
                maxLength={100}
                placeholder="e.g., High Pressure, 8 Bar"
              />
            </div>
            <div>
              <Label>Flow Rate</Label>
              <input
                type="text"
                name="flow_rate"
                value={productData.flow_rate}
                onChange={handleChange}
                className="input-field"
                maxLength={100}
                placeholder="e.g., 50m³/hr, 1000LPM"
              />
            </div>
            <div>
              <Label>Motor HP</Label>
              <input
                type="text"
                name="motor_hp"
                value={productData.motor_hp}
                onChange={handleChange}
                className="input-field"
                maxLength={100}
                placeholder="e.g., 10HP, 25HP"
              />
            </div>
            <div>
              <Label>Product Image</Label>
              <FileInput
                onChange={handleFileChange}
                // @ts-ignore
                accept=".png,.jpg,.jpeg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Accepts only .jpeg, .jpg, .png
              </p>
            </div>
          </div>

          {/* Description - Full width */}
          <div className="mb-5">
            <Label>Description</Label>
            <textarea
              name="description"
              value={productData.description}
              onChange={handleChange}
              className="input-field min-h-[100px] resize-vertical"
              placeholder="Enter product description..."
              rows={4}
            />
          </div>

          {/* Status Checkboxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={productData.is_active}
                onChange={handleChange}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <Label htmlFor="is_active" className="mb-0">
                Product is Active
              </Label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_live"
                name="is_live"
                checked={productData.is_live}
                onChange={handleChange}
                className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <Label htmlFor="is_live" className="mb-0">
                Live on Ecommerce Store
              </Label>
            </div>
          </div>

          <ButtonLoading
            loading={isLoading}
            state="Add Product"
            loadingstate="Adding Product..."
            className="w-fit mt-8"
          />
        </form>
      </ButtonComponentCard>
    </>
  );
};

export default AddProducts;
