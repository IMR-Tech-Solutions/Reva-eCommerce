import { useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import {
  getproductbatcheservice,
  updatestockbatchstatusservice,
  getsinglebatchdetails,
  // deletestockbatchservice,
} from "../../services/stockbatchservices";
import ButtonComponentCard from "../../Admin/Components/ButtonComponentCard";
import { all_routes } from "../../Router/allroutes";
import {
  ProductStockBatchResponse,
  ParticularProductStockBatch,
} from "../../types/types";
import { useEffect, useState } from "react";
import { handleError } from "../../utils/handleError";
import { Select } from "antd";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import EditStockBatch from "./EditStockBatch";

const ProductStock = () => {
  const { productID } = useParams();
  const [productBatchData, setProductBatchData] =
    useState<ProductStockBatchResponse | null>(null);
  // const [loading, setLoading] = useState(false);
  const [selectStockBatch, setSelectedStockBatch] =
    useState<ParticularProductStockBatch | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [otherBatchesCollapsed, setOtherBatchesCollapsed] = useState(true);
  const [expiredBatchesCollapsed, setExpiredBatchesCollapsed] = useState(true);

  let actualProductID: number | null = null;
  if (productID) {
    try {
      actualProductID = parseInt(atob(productID), 10);
    } catch (e) {
      console.error("Invalid product ID in URL", e);
    }
  }

  const ProductBatchesData = async () => {
    if (actualProductID) {
      try {
        const productData = await getproductbatcheservice(actualProductID);
        setProductBatchData(productData);
      } catch (error) {
        handleError(error);
      }
    }
  };

  useEffect(() => {
    ProductBatchesData();
  }, [actualProductID]);

  const activeBatches =
    productBatchData?.stock_batches?.filter(
      (batch) => batch.batch_status === "active" && batch.is_expired === false
    ) || [];

  const otherBatches =
    productBatchData?.stock_batches?.filter(
      (batch) => batch.batch_status !== "active" && batch.is_expired === false
    ) || [];

  const expiredBatches =
    productBatchData?.stock_batches?.filter(
      (batch) => batch.batch_status === "expired" && batch.is_expired === true
    ) || [];

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format("DD-MM-YYYY");
  };

  const BATCH_STATUS_CHOICES = [
    { value: "active", label: "Active" },
    { value: "sold", label: "Sold" },
    { value: "not_active", label: "Not Active" },
    { value: "damaged", label: "Damaged" },
  ];

  const handleStatusChange = async (batchId: number, newStatus: string) => {
    try {
      const formData = new FormData();
      formData.append("batch_status", newStatus);
      await updatestockbatchstatusservice(batchId, formData);
      toast.success("Batch status updated successfully");
      if (actualProductID) {
        const productData = await getproductbatcheservice(actualProductID);
        setProductBatchData(productData);
      }
    } catch (error) {
      handleError(error);
      console.error(error);
    }
  };

  // const handleDelete = async (batchId: number) => {
  //   try {
  //     await deletestockbatchservice(batchId);
  //     toast.success("Batch deleted successfully");
  //     if (actualProductID) {
  //       const productData = await getproductbatcheservice(actualProductID);
  //       setProductBatchData(productData);
  //     }
  //   } catch (error) {
  //     handleError(error);
  //   }
  // };

  const handleEdit = async (batchId: number) => {
    try {
      const stockData = await getsinglebatchdetails(batchId);
      setSelectedStockBatch(stockData);
      setModalVisible(true);
    } catch (error) {
      console.error("Unable Update Batch:", error);
      handleError(error);
    }
  };

  const renderBatchCard = (
    batch: ParticularProductStockBatch,
    isActive: boolean = false,
    isExpired: boolean = false
  ) => (
    <div
      key={batch.id}
      className={`border rounded-lg p-4 dark:bg-white/[0.03] ${
        isActive ? "border-green-500" : isExpired ? "border-red-500" : ""
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          {/* <h4 className="font-semibold theme-text text-lg mb-2">
            Batch Number: {batch.id}
          </h4>  */}
          <p className="theme-text  theme-text text-lg font-bold">
            Vendor: {batch.vendor_name}
          </p>
          <p className="theme-text text-sm theme-text ">
            Purchase Invoice Number: {batch.purchase_invoice_number}
          </p>
          <p className="theme-text text-sm theme-text ">
            Reference Number: {batch.reference_number || "N/A"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={batch.batch_status}
            onChange={(value) => handleStatusChange(batch.id, value)}
            options={BATCH_STATUS_CHOICES}
            size="small"
            style={{ width: 120 }}
          />
          <button
            onClick={() => handleEdit(batch.id)}
            className="p-1 text-blue-600 hover:text-blue-400 rounded"
            title="Edit"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="m18.5 2.5 a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          {/* <Popconfirm
            title="Are you sure you want to delete this batch?"
            onConfirm={() => handleDelete(batch.id)}
            okText="Yes"
            cancelText="No"
            placement="topRight"
          >
            <button
              className="p-1 text-red-600 hover:text-red-400 rounded"
              title="Delete"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="3,6 5,6 21,6" />
                <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </button>
          </Popconfirm> */}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="theme-text">Quantity:</span>
          <span className="ml-1 font-medium theme-text-2">
            {batch.quantity}
          </span>
        </div>
        <div>
          <span className="theme-text">Purchase Price:</span>
          <span className="ml-1 font-medium theme-text-2">
            ₹{batch.purchase_price}
          </span>
        </div>
        <div>
          <span className="theme-text">Selling Price:</span>
          <span className="ml-1 font-medium theme-text-2">
            ₹{batch.selling_price}
          </span>
        </div>
        <div>
          <span className="theme-text">Manufacture Date:</span>
          <span className="ml-1 font-medium theme-text-2">
            {formatDate(batch.manufacture_date)}
          </span>
        </div>
        <div>
          <span className="theme-text">Expiry Date:</span>
          <span className="ml-1 font-medium theme-text-2">
            {formatDate(batch.expiry_date)}
          </span>
        </div>
        <div>
          <span className="theme-text">Created:</span>
          <span className="ml-1 font-medium theme-text-2">
            {formatDate(batch.created_at)}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <PageMeta
        title="Manage Product Stock"
        description="View, update, and track product stock levels in your inventory."
      />

      <ButtonComponentCard
        title={productBatchData?.product_name}
        buttonlink={all_routes.addstock}
        buttontitle="Add Stock"
      >
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold dark:text-white">
              {productBatchData?.total_batches || 0}
            </div>
            <div className="text-sm theme-text">Total Batches</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {productBatchData?.active_batches || 0}
            </div>
            <div className="text-sm theme-text">Active Batches</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold dark:text-white">
              {productBatchData?.total_quantity || 0}
            </div>
            <div className="text-sm theme-text">Total Quantity</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {productBatchData?.total_active_quantity || 0}
            </div>
            <div className="text-sm theme-text">Active Quantity</div>
          </div>
        </div>
      </ButtonComponentCard>

      {/* Active Stock Section */}
      {activeBatches.length > 0 && (
        <div className="mt-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-green-700">
              Active Stock
            </h2>
            <p className="text-sm theme-text">
              Currently available and non-expired stock batches
            </p>
          </div>
          <div className="space-y-4">
            {activeBatches.map((batch) => renderBatchCard(batch, true))}
          </div>
        </div>
      )}

      {/* Other Product Stock Batches Section */}
      {otherBatches.length > 0 && (
        <div className="mt-8">
          <div className="mb-4">
            <button
              onClick={() => setOtherBatchesCollapsed(!otherBatchesCollapsed)}
              className="flex items-center gap-2 text-xl font-semibold theme-text-2 hover:opacity-80 transition-opacity"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`transform transition-transform ${
                  otherBatchesCollapsed ? "rotate-0" : "rotate-90"
                }`}
              >
                <polyline points="9,18 15,12 9,6" />
              </svg>
              Other Stock Batches
            </button>
            <p className="text-sm theme-text ml-7">
              Inactive or sold stock batches
            </p>
          </div>
          {!otherBatchesCollapsed && (
            <div className="space-y-4">
              {otherBatches.map((batch) => renderBatchCard(batch, false))}
            </div>
          )}
        </div>
      )}

      {/* Expired Product Stock Batches Section */}
      {expiredBatches.length > 0 && (
        <div className="mt-8">
          <div className="mb-4">
            <button
              onClick={() =>
                setExpiredBatchesCollapsed(!expiredBatchesCollapsed)
              }
              className="flex items-center gap-2 text-xl font-semibold theme-text-2 hover:opacity-80 transition-opacity"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`transform transition-transform ${
                  expiredBatchesCollapsed ? "rotate-0" : "rotate-90"
                }`}
              >
                <polyline points="9,18 15,12 9,6" />
              </svg>
              Expired Stock Batches
            </button>
            <p className="text-sm theme-text ml-7">Expired stock batches</p>
          </div>
          {!expiredBatchesCollapsed && (
            <div className="space-y-4">
              {expiredBatches.map((batch) =>
                renderBatchCard(batch, false, true)
              )}
            </div>
          )}
        </div>
      )}

      {/* No Batches Available */}
      {(!productBatchData?.stock_batches ||
        productBatchData.stock_batches.length === 0) && (
        <div className="mt-8 text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            No Stock Batches Available
          </h3>
          <p className="text-gray-500 mt-2">
            There are no stock batches for this product yet.
          </p>
        </div>
      )}
      {selectStockBatch && (
        <EditStockBatch
          ProductBatchesData={ProductBatchesData}
          selectedStockBatch={selectStockBatch}
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
        />
      )}
    </div>
  );
};

export default ProductStock;
