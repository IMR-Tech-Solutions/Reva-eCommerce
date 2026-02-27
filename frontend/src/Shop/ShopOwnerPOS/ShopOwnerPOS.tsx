import { useState, useEffect, useRef } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import PosComponentCard from "../../POS/PosComponentCard";
import PageMeta from "../../components/common/PageMeta";
import {
  // CategoryData,
  ShopPurchasedProduct,
  POSOrderPayload,
  // CustomerData,
} from "../../types/types";
import {
  usePOSCategories,
  usePOSProducts,
  useCustomers,
  useAddPOSOrder,
} from "../../hooks/shopOwnerPOS";

import ShopOwnerProductCard from "./ShopOwnerProductCard";
import NoPos from "../../POS/NoPos";
import Loader from "../../Loader/Loader";
import { Input, Select, Button, message } from "antd";
import { toast } from "react-toastify";
import PosAddcustomer from "../../POS/PosAddcustomer";

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

const ShopOwnerPOS = () => {
  // React Query hooks - replaces all manual API calls
  const {
    data: myCategories = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
    error: catError,
  } = usePOSCategories();

  const {
    data: myProducts = [],
    isLoading: productsLoading,
    isError: productsError,
    error: prodError,
    refetch: refetchProducts,
  } = usePOSProducts();

  const {
    data: myCustomers = [],
    isLoading: customersLoading,
    refetch: refetchCustomers,
  } = useCustomers();

  const orderMutation = useAddPOSOrder();

  // Local UI state only
  const [productsByCategory, setProductsByCategory] = useState<
    ShopPurchasedProduct[]
  >([]);
  const [filteredProducts, setFilteredProducts] = useState<
    ShopPurchasedProduct[]
  >([]);
  const [cart, setCart] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
  const [orderStatus, setOrderStatus] = useState<
    "pending" | "confirmed" | "processing" | "ready" | "completed" | "cancelled"
  >("pending");
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "paid" | "partial" | "failed" | "refunded"
  >("pending");
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "card" | "upi" | "bank_transfer" | "credit"
  >("cash");
  const [notes, setNotes] = useState<string>("");
  const [gridTitle, setGridTitle] = useState<string>("");
  const [isVisible, setIsVisible] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);

  const searchInputRef = useRef<any>(null);

  // Update filtered products when data changes
  useEffect(() => {
    setFilteredProducts(myProducts);
  }, [myProducts]);

  // Combined loading and error states
  const isLoading = categoriesLoading || productsLoading || customersLoading;
  const hasError = categoriesError || productsError;
  const errorMessage =
    catError?.message || prodError?.message || "Something went wrong";

  const handleCategoryProducts = (categoryName: string) => {
    const title = myCategories.find((x) => x.category_name === categoryName);
    setGridTitle(title?.category_name || "");

    if (!categoryName) {
      setProductsByCategory([]);
      setFilteredProducts(myProducts);
      setGridTitle("");
    } else {
      const filtered = myProducts.filter(
        (product) => product.category_name === categoryName
      );
      setProductsByCategory(filtered);
      setFilteredProducts(filtered);
    }
  };

  const handleShowAllProducts = () => {
    setProductsByCategory([]);
    setFilteredProducts(myProducts);
    setGridTitle("");
  };

  const handleSearch = (value: string) => {
    const lowerValue = value.toLowerCase();
    let sourceProducts =
      productsByCategory.length > 0 ? productsByCategory : myProducts;

    const filtered = sourceProducts.filter((product) =>
      product.product_name?.toLowerCase().includes(lowerValue)
    );

    setFilteredProducts(filtered);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const addToCart = (product: ShopPurchasedProduct) => {
    if (product.quantity <= 0) {
      toast.warn("Product out of stock");
      return;
    }
    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        if (exists.quantity < product.quantity) {
          return prev.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          toast.warn("Cannot add more, stock limit reached");
          return prev;
        }
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number, stock: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.min(stock, Math.max(1, item.quantity + delta)),
            }
          : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const subtotal = cart.reduce(
    (acc, item) => acc + item.selling_price * item.quantity,
    0
  );

  const grossTotal = subtotal - discount + tax;

  const handleSubmitOrder = async () => {
    if (!selectedCustomer) {
      toast.error("Please select a customer");
      return;
    }

    if (cart.length === 0) {
      message.error("Cart is empty");
      return;
    }

    const payload: POSOrderPayload = {
      customer: selectedCustomer,
      order_items: cart.map((item) => ({
        product: item.product,
        quantity: item.quantity,
      })),
      order_status: orderStatus,
      payment_status: paymentStatus,
      payment_method: paymentMethod,
      tax_amount: tax.toFixed(2),
      discount_amount: discount.toFixed(2),
      notes: notes || "",
    };

    orderMutation.mutate(payload, {
      onSuccess: () => {
        // Reset form
        setCart([]);
        setSelectedCustomer(null);
        setOrderStatus("pending");
        setPaymentStatus("pending");
        setPaymentMethod("cash");
        setTax(0);
        setDiscount(0);
        setNotes("");
      },
    });
  };

  const AddCustomer = () => {
    setIsVisible(true);
  };

  const date = new Date();
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };
  const formatted = date.toLocaleString("en-US", options);

  if (isLoading) {
    return (
      <>
        <PageMeta
          title="POS"
          description="Manage and track your point of sale transactions with Inventa"
        />
        <Loader />
      </>
    );
  }

  if (hasError) {
    return (
      <>
        <PageMeta
          title="POS"
          description="Manage and track your point of sale transactions with Inventa"
        />
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-gray-400 dark:text-gray-600 mb-4">
            Error loading POS: {errorMessage}
          </p>
          <button
            onClick={() => {
              refetchProducts();
              window.location.reload();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </>
    );
  }

  if (myProducts.length === 0) {
    return (
      <>
        <PageMeta
          title="POS"
          description="Manage and track your point of sale transactions with Inventa"
        />
        <NoPos />
      </>
    );
  }


  return (
    <>
      <PageMeta
        title="POS"
        description="Manage and track your point of sale transactions with Inventa"
      />

      {/* Date and Search Section */}
      <div className="mb-5">
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-4">
          <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-3">
            <div className="lg:col-span-4 md:col-span-6 col-span-1">
              <div className="theme-text text-sm">
                Date & Time : {formatted}
              </div>
            </div>
            <div className="lg:col-span-8 md:col-span-6 col-span-1">
              <Search
                ref={searchInputRef}
                placeholder="Search products (Ctrl + K)"
                className="custom-search"
                onSearch={handleSearch}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Section */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <section className="col-span-1 md:col-span-8">
          <PosComponentCard title="Choose Category">
            <div className="flex flex-wrap items-center justify-start gap-6">
              <button
                onClick={handleShowAllProducts}
                className={`px-3 py-1 rounded theme-text-2 border-brand-500 border text-sm ${
                  !gridTitle ? "bg-brand-200 !text-black font-semibold" : ""
                }`}
              >
                All
              </button>
              {myCategories.slice(0, 12).map((category) => (
                <button
                  onClick={() => handleCategoryProducts(category.category_name)}
                  key={category.id}
                  className={`px-3 py-1 rounded theme-text-2 border-brand-500 border text-sm ${
                    gridTitle === category.category_name
                      ? "bg-brand-200 !text-black font-semibold"
                      : ""
                  }`}
                >
                  {category.category_name}
                </button>
              ))}
            </div>

            {/* Products grid */}
            <div className="my-4">
              <h2 className="font-bold mt-6 mb-4 theme-text-2">
                {gridTitle ? gridTitle : "All Products"}
              </h2>

              <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5">
                {gridTitle && productsByCategory.length === 0 ? (
                  <div className="theme-text text-sm">No Products Found</div>
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className="relative cursor-pointer rounded-xl p-2 border dark:border-gray-600 w-auto h-auto break-all"
                    >
                      <ShopOwnerProductCard product={product} />
                    </div>
                  ))
                ) : (
                  <div className="theme-text text-sm">No Products Found</div>
                )}
              </div>
            </div>
          </PosComponentCard>
        </section>

        {/* Bills Section */}
        <section className="col-span-1 md:col-span-4">
          <ComponentCard title="Bills">
            {/* Customer dropdown */}
            <div className="mb-4 grid lg:grid-cols-12 md:grid-cols-6 gap-2">
              <Select
                placeholder="Select Customer"
                style={{ width: "100%" }}
                value={selectedCustomer || undefined}
                onChange={(val) => setSelectedCustomer(val)}
                className="lg:col-span-9 md:col-span-6"
                loading={customersLoading}
              >
                {myCustomers.map((cust) => (
                  <Option key={cust.id} value={cust.id}>
                    {cust.first_name + " " + cust.last_name}
                  </Option>
                ))}
              </Select>
              <Button
                type="primary"
                className="lg:col-span-3 md:col-span-6"
                onClick={AddCustomer}
              >
                + Add
              </Button>
            </div>

            {/* Cart items */}
            {cart.length === 0 ? (
              <p className="theme-text text-center text-sm mt-10">
                Cart is Empty
              </p>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold theme-text">Cart Items</h3>
                  <Button size="small" danger onClick={clearCart} type="link">
                    Clear Cart
                  </Button>
                </div>

                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center border dark:border-gray-700 rounded-xl py-2 px-4"
                  >
                    <div>
                      <p className="font-medium theme-text-2 text-sm mb-1">
                        {item.product_name}
                      </p>
                      <p className="text-xs theme-text">
                        Item Amount: {item.selling_price * item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="small"
                        className="!bg-white/[0.1] text-black dark:!text-white border dark:!border-gray-500"
                        onClick={() =>
                          updateQuantity(item.id, -1, item.quantity)
                        }
                      >
                        -
                      </Button>
                      <span className="theme-text-2">{item.quantity}</span>
                      <Button
                        size="small"
                        className="!bg-white/[0.1] text-black dark:!text-white border dark:!border-gray-500"
                        onClick={() =>
                          updateQuantity(item.id, 1, item.quantity)
                        }
                      >
                        +
                      </Button>
                      <Button
                        size="small"
                        className="!bg-red-500/[0.7] !text-white border dark:!border-gray-500"
                        danger
                        onClick={() => removeItem(item.id)}
                      >
                        x
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Totals */}
                <div className="border-t dark:border-gray-500 pt-3 text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="theme-text-2">Subtotal:</span>
                    <span className="theme-text-2">{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm theme-text">Discount:</label>
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="w-24 border dark:border-gray-600 rounded px-2 py-1 text-sm theme-text"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm theme-text">Tax:</label>
                    <input
                      type="number"
                      value={tax}
                      onChange={(e) => setTax(Number(e.target.value))}
                      className="w-24 border dark:border-gray-600 rounded px-2 py-1 text-sm theme-text"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className="theme-text-2">Gross Total:</span>
                    <span className="theme-text-2">
                      {grossTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="border-t dark:border-gray-500 pt-3">
                  {/* Order Status */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1 theme-text">
                      Order Status
                    </label>
                    <Select
                      style={{ width: "100%" }}
                      value={orderStatus}
                      onChange={(val) => setOrderStatus(val)}
                    >
                      <Option value="pending">Pending</Option>
                      <Option value="confirmed">Confirmed</Option>
                      <Option value="processing">Processing</Option>
                      <Option value="ready">Ready</Option>
                      <Option value="completed">Completed</Option>
                      <Option value="cancelled">Cancelled</Option>
                    </Select>
                  </div>

                  {/* Payment Status */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1 theme-text">
                      Payment Status
                    </label>
                    <Select
                      style={{ width: "100%" }}
                      value={paymentStatus}
                      onChange={(val) => setPaymentStatus(val)}
                    >
                      <Option value="pending">Pending</Option>
                      <Option value="paid">Paid</Option>
                      <Option value="partial">Partial</Option>
                      <Option value="failed">Failed</Option>
                      <Option value="refunded">Refunded</Option>
                    </Select>
                  </div>

                  {/* Payment Method */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1 theme-text">
                      Payment Method
                    </label>
                    <Select
                      style={{ width: "100%" }}
                      value={paymentMethod}
                      onChange={(val) => setPaymentMethod(val)}
                    >
                      <Option value="cash">Cash</Option>
                      <Option value="card">Card</Option>
                      <Option value="upi">UPI</Option>
                      <Option value="bank_transfer">Bank Transfer</Option>
                      <Option value="credit">Credit</Option>
                    </Select>
                  </div>

                  {/* Notes */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 theme-text">
                      Notes
                    </label>
                    <TextArea
                      rows={2}
                      placeholder="Add order notes (optional)"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="!bg-transparent theme-text dark:!border-gray-600"
                    />
                  </div>

                  <Button
                    type="primary"
                    block
                    className="mt-4"
                    onClick={handleSubmitOrder}
                    loading={orderMutation.isPending}
                    disabled={orderMutation.isPending}
                  >
                    Place Order
                  </Button>
                </div>
              </div>
            )}
          </ComponentCard>
        </section>
      </section>

      {isVisible && (
        <PosAddcustomer
          visible={isVisible}
          onCancel={() => setIsVisible(false)}
          fetchCustomers={refetchCustomers}
        />
      )}
    </>
  );
};

export default ShopOwnerPOS;
