import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ButtonComponentCard from "../../Admin/Components/ButtonComponentCard";
import Label from "../../components/form/Label";
import ButtonLoading from "../../components/common/ButtonLoading";
import { handleError } from "../../utils/handleError";
import { getmyactivevendorservice } from "../../services/vendorservices";
import { getmyactiveproductservice } from "../../services/productservices";
// import { getmyactivebrokerservice } from "../../services/brokerservices";
import { bulkcreatestockbatchservice } from "../../services/stockbatchservices";
import { all_routes } from "../../Router/allroutes";
import {
  StockBatch,
  StockBatchData,
  VendorData,
  ProductData,
  // BrokerDataType,
} from "../../types/types";
import dayjs from "dayjs";

const Addstock = () => {
  const [vendors, setVendors] = useState<VendorData[]>([]);
  const [products, setProducts] = useState<ProductData[]>([]);
  // const [brokers, setBrokers] = useState<BrokerDataType[]>([]);
  const [vendorId, setVendorId] = useState<number | null>(null);
  const [batch, setBatch] = useState<StockBatch>({
    product: 0,
    reference_number: "",
    quantity: 0,
    purchase_price: "",
    selling_price: "",
    manufacture_date: "",
    expiry_date: "",
    broker: undefined,
    broker_commission_percent: "",
    tax_amount: "",
  });
  const [selectedBatches, setSelectedBatches] = useState<StockBatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setIsLoadingProducts(true);
        const vendorRes = await getmyactivevendorservice();
        setVendors(vendorRes);
        const productRes = await getmyactiveproductservice();
        setProducts(productRes);
        // const brokerRes = await getmyactivebrokerservice();
        // setBrokers(brokerRes);
      } catch (error) {
        handleError(error);
      } finally {
        setIsLoadingProducts(false);
      }
    })();
  }, []);

  // const getBrokerName = (brokerId?: number) => {
  //   if (!brokerId) return "No Broker";
  //   const broker = brokers.find((b) => b.id === brokerId);
  //   return broker ? broker.broker_name : "Unknown Broker";
  // };

  // const handleBrokerChange = (brokerId: number) => {
  //   const selectedBroker = brokers.find((b) => b.id === brokerId);
  //   setBatch({
  //     ...batch,
  //     broker: brokerId || undefined,
  //     broker_commission_percent:
  //       selectedBroker?.default_commission_percent?.toString() || "",
  //   });
  // };

  const addBatchToList = () => {
    if (!batch.product) {
      toast.error("Please select a product");
      return;
    }

    // if (!batch.reference_number.trim()) {
    //   toast.error("Batch code is required");
    //   return;
    // }

    if (batch.quantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    if (!batch.purchase_price || parseFloat(batch.purchase_price) <= 0) {
      toast.error("Valid purchase price is required");
      return;
    }

    if (!batch.selling_price || parseFloat(batch.selling_price) <= 0) {
      toast.error("Valid selling price is required");
      return;
    }

    if (parseFloat(batch.selling_price) < parseFloat(batch.purchase_price)) {
      toast.error(
        "Selling price must be greater than or equal to purchase price"
      );
      return;
    }

    if (
      batch.broker &&
      (!batch.broker_commission_percent ||
        parseFloat(batch.broker_commission_percent) <= 0)
    ) {
      toast.error(
        "Valid commission percentage is required when broker is selected"
      );
      return;
    }
    if (
      batch.broker_commission_percent &&
      parseFloat(batch.broker_commission_percent) > 100
    ) {
      toast.error("Commission percentage cannot exceed 100%");
      return;
    }

    if (batch.manufacture_date && batch.expiry_date) {
      const mfgDate = new Date(batch.manufacture_date);
      const expDate = new Date(batch.expiry_date);

      if (expDate <= mfgDate) {
        toast.error("Expiry date must be greater than manufacture date");
        return;
      }
    }

    // const isDuplicateCode = selectedBatches.some(
    //   (b) => b.reference_number === batch.reference_number
    // );
    // if (isDuplicateCode) {
    //   toast.error("Batch code already exists in the list");
    //   return;
    // }
    setSelectedBatches([...selectedBatches, { ...batch }]);
    setBatch({
      product: 0,
      reference_number: "",
      quantity: 0,
      purchase_price: "",
      selling_price: "",
      manufacture_date: "",
      expiry_date: "",
      broker: undefined,
      broker_commission_percent: "",
      tax_amount: "",
    });
    toast.success("Batch added to list!");
  };

  const removeBatchFromList = (index: number) => {
    const updatedBatches = selectedBatches.filter((_, i) => i !== index);
    setSelectedBatches(updatedBatches);
    toast.info("Batch removed from list");
  };

  const getProductName = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    return product ? product.product_name : "Unknown Product";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!vendorId) {
      toast.error("Please select a vendor");
      return;
    }
    if (selectedBatches.length === 0) {
      toast.error("Please add at least one batch to the list");
      return;
    }
    const payload: StockBatchData = {
      vendor_id: vendorId,
      stock_batches: selectedBatches,
    };
    try {
      setIsLoading(true);
      await bulkcreatestockbatchservice(payload);
      toast.success(
        `${selectedBatches.length} stock batch(es) added successfully!`
      );
      setVendorId(null);
      setSelectedBatches([]);
      setBatch({
        product: 0,
        reference_number: "",
        quantity: 0,
        purchase_price: "",
        selling_price: "",
        manufacture_date: "",
        expiry_date: "",
        broker: undefined,
        broker_commission_percent: "",
        tax_amount: "",
      });
    } catch (error) {
      handleError(error);
      console.error("Error adding stock:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format("DD-MM-YYYY");
  };

  return (
    <>
      <PageMeta title="Add Stock" description="Add new stock batches" />
      <PageBreadcrumb pageTitle="Add Stock" />
      <ButtonComponentCard
        title="Stock Details"
        buttonlink={all_routes.managestock}
        buttontitle="View All Stocks"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-3">
            <div>
              <Label>Vendor</Label>
              <select
                value={vendorId ?? ""}
                onChange={(e) => setVendorId(Number(e.target.value))}
                className="input-field"
              >
                <option value="" className="text-black">
                  Select Vendor
                </option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id} className="text-black">
                    {v.vendor_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Product</Label>
              <select
                value={batch.product || ""}
                onChange={(e) =>
                  setBatch({ ...batch, product: Number(e.target.value) })
                }
                className="input-field"
                disabled={isLoadingProducts}
              >
                <option value="" className="text-black">
                  {isLoadingProducts
                    ? "Loading products..."
                    : products.length === 0
                    ? "No products available"
                    : "Select Product"}
                </option>
                {products.map((p) => (
                  <option key={p.id} value={p.id} className="text-black">
                    {p.product_name}
                  </option>
                ))}
              </select>
            </div>

            {/* <div>
              <Label>Broker (Optional)</Label>
              <select
                value={batch.broker || ""}
                onChange={(e) => handleBrokerChange(Number(e.target.value))}
                className="input-field"
              >
                <option value="" className="text-black">
                  No Broker
                </option>
                {brokers.map((broker) => (
                  <option
                    key={broker.id}
                    value={broker.id}
                    className="text-black"
                  >
                    {broker.broker_name} ({broker.default_commission_percent}%)
                  </option>
                ))}
              </select>
            </div> */}

              {/* <div>
                <Label>
                  Commission %{" "}
                  {batch.broker && <span className="text-red-500">*</span>}
                </Label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={batch.broker_commission_percent}
                  onChange={(e) =>
                    setBatch({
                      ...batch,
                      broker_commission_percent: e.target.value,
                    })
                  }
                  className="input-field"
                  placeholder="Enter commission %"
                  disabled={!batch.broker}
                />
              </div> */}

            <div>
              <Label>Refrence Number</Label>
              <input
                type="text"
                value={batch.reference_number}
                onChange={(e) =>
                  setBatch({ ...batch, reference_number: e.target.value })
                }
                className="input-field"
                placeholder="Enter refrence number"
              />
            </div>

            <div>
              <Label>Quantity</Label>
              <input
                type="number"
                value={batch.quantity}
                onChange={(e) =>
                  setBatch({ ...batch, quantity: Number(e.target.value) })
                }
                className="input-field"
              />
            </div>

            <div>
              <Label>Purchase Price (₹)</Label>
              <input
                type="text"
                value={batch.purchase_price}
                onChange={(e) =>
                  setBatch({ ...batch, purchase_price: e.target.value })
                }
                className="input-field"
                placeholder="Enter purchase price"
              />
            </div>

            <div>
              <Label>Selling Price (₹)</Label>
              <input
                type="text"
                value={batch.selling_price}
                onChange={(e) =>
                  setBatch({ ...batch, selling_price: e.target.value })
                }
                className="input-field"
                placeholder="Enter selling price"
              />
            </div>

            <div>
              <Label>Manufacture Date</Label>
              <input
                type="date"
                value={batch.manufacture_date}
                onChange={(e) =>
                  setBatch({ ...batch, manufacture_date: e.target.value })
                }
                className="input-field"
              />
            </div>

            <div>
              <Label>Expiry Date</Label>
              <input
                type="date"
                value={batch.expiry_date}
                onChange={(e) =>
                  setBatch({ ...batch, expiry_date: e.target.value })
                }
                className="input-field"
              />
            </div>
            <div>
              <Label>Tax Amount (₹) - Optional</Label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={batch.tax_amount || ""}
                onChange={(e) =>
                  setBatch({ ...batch, tax_amount: e.target.value })
                }
                className="input-field"
                placeholder="Enter tax amount (optional)"
              />
            </div>
          </div>
          <div className="mb-4">
            <button
              type="button"
              onClick={addBatchToList}
              className="bg-transparent border dark:border-white border-black theme-text-2 px-4 py-3 text-sm rounded-md mt-2"
            >
              Add to List
            </button>
          </div>

          {selectedBatches.length > 0 && (
            <>
              <div className="mt-8 mb-6">
                <h3 className="text-lg font-semibold mb-3 dark:text-gray-300">
                  Selected Batches ({selectedBatches.length})
                </h3>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md max-h-96 overflow-y-auto">
                  {selectedBatches.map((batch, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 mb-2 rounded border"
                    >
                      <div className="flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div>
                            <strong className="theme-text">Product:</strong>{" "}
                            <span className="theme-text-2">
                              {getProductName(batch.product)}
                            </span>
                          </div>

                          <div>
                            <strong className="theme-text">Qty:</strong>{" "}
                            <span className="theme-text-2">
                              {batch.quantity}
                            </span>
                          </div>
                          <div>
                            <strong className="theme-text">Price:</strong>{" "}
                            <span className="theme-text-2">
                              ₹{batch.purchase_price} → ₹{batch.selling_price}
                            </span>
                          </div>
                          <div>
                            <strong className="theme-text">
                              Refrence Number:
                            </strong>{" "}
                            <span className="theme-text-2">
                              {(batch.reference_number &&
                                batch.reference_number) ||
                                "NA"}
                            </span>
                          </div>
                            {/* <div>
                              <strong className="theme-text">Broker:</strong>{" "}
                              <span className="theme-text-2">
                                {getBrokerName(batch.broker)}
                              </span>
                            </div> */}
                          {batch.broker && batch.broker_commission_percent && (
                            <div>
                              <strong className="theme-text">
                                Commission:
                              </strong>{" "}
                              <span className="theme-text-2">
                                {batch.broker_commission_percent}%
                              </span>
                            </div>
                          )}
                          {batch.tax_amount &&
                            parseFloat(batch.tax_amount) > 0 && (
                              <div>
                                <strong className="theme-text">
                                  Tax Amount:
                                </strong>{" "}
                                <span className="theme-text-2">
                                  ₹{parseFloat(batch.tax_amount).toFixed(2)}
                                </span>
                              </div>
                            )}
                        </div>
                        {(batch.manufacture_date || batch.expiry_date) && (
                          <div className="mt-1 text-xs theme-text">
                            {batch.manufacture_date &&
                              `MFG: ${formatDate(batch.manufacture_date)}`}
                            {batch.manufacture_date &&
                              batch.expiry_date &&
                              " | "}
                            {batch.expiry_date &&
                              `EXP: ${formatDate(batch.expiry_date)}`}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeBatchFromList(index)}
                        className="ml-4 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          {selectedBatches.length > 0 && (
            <ButtonLoading
              loading={isLoading}
              state={
                selectedBatches.length > 0
                  ? `Add ${selectedBatches.length} Batch(es)`
                  : "Add Stock"
              }
              loadingstate={"Adding Stock..."}
              className="w-fit"
            />
          )}
        </form>
      </ButtonComponentCard>
    </>
  );
};

export default Addstock;
