import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { Table, Input, Button, Space } from "antd";
import ButtonComponentCard from "../../Admin/Components/ButtonComponentCard";
import { getmyactivebatcheservice } from "../../services/stockbatchservices";
import { AppstoreOutlined } from "@ant-design/icons";
import { ProductStockBatch } from "../../types/types";
import { handleError } from "../../utils/handleError";
import { all_routes } from "../../Router/allroutes";
import { useNavigate } from "react-router";
import dayjs from "dayjs";

const { Search } = Input;

const Managestock = () => {
  const navigate = useNavigate();
  const [ProductstockBatches, setProductStockBatches] = useState<
    ProductStockBatch[]
  >([]);
  const [filteredProductstockBatches, setfilteredProductstockBatches] =
    useState<ProductStockBatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchProductStockBatches = async () => {
    setLoading(true);
    try {
      const data = await getmyactivebatcheservice();
      setProductStockBatches(data);
      setfilteredProductstockBatches(data);
    } catch (err) {
      console.error("Error fetching products stock batches:", err);
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductStockBatches();
  }, []);

  const handleSearch = (value: string) => {
    const searchTerm = value.toLowerCase();
    const filtered = ProductstockBatches.filter((productBatch) =>
      productBatch.product_name?.toLowerCase().includes(searchTerm)
    );
    setfilteredProductstockBatches(filtered);
    setCurrentPage(1);
  };

  const columns = [
    {
      title: "Sr. No",
      key: "srno",
      render: (_: any, __: ProductStockBatch, index: number) =>
        (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "Product Name",
      dataIndex: "product_name",
      key: "product_name",
      sorter: (a: ProductStockBatch, b: ProductStockBatch) =>
        (a.product_name || "").localeCompare(b.product_name || ""),
      render: (name: string) => (
        <span className="truncate text-gray-800 dark:text-white/90">
          {name || "N/A"}
        </span>
      ),
    },
    {
      title: "Purchased Quantity",
      key: "original_quantity",
      render: (_: any, record: ProductStockBatch) =>
        record.active_batches[0]?.original_quantity ?? "N/A",
    },
    {
      title: "Remaining Quantity",
      key: "quantity",
      render: (_: any, record: ProductStockBatch) =>
        record.active_batches[0]?.quantity ?? "N/A",
    },
    {
      title: "Expiry Date",
      key: "expiry_date",
      render: (_: any, record: ProductStockBatch) => {
        const expiryDate = record.active_batches[0]?.expiry_date;
        if (!expiryDate) return "N/A";

        const today = dayjs().startOf("day");
        const expiry = dayjs(expiryDate).startOf("day");
        const diffDays = expiry.diff(today, "day");

        let colorClass = "text-gray-800 dark:text-white/90"; // default

        if (diffDays < 0) {
          colorClass = "text-gray-400 line-through";
        } else if (diffDays <= 1) {
          colorClass = "text-red-500 font-semibold";
        } else if (diffDays <= 7) {
          colorClass = "text-orange-500 font-semibold";
        }

        return (
          <span className={`truncate ${colorClass}`}>
            {expiry.format("DD-MM-YYYY")}
          </span>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: ProductStockBatch) => (
        <Space size="small">
          <Button
            id="table-manage-btn"
            size="small"
            icon={<AppstoreOutlined />}
            loading={loading}
            onClick={() => handleEdit(record.product_id)}
          />
        </Space>
      ),
    },
  ];

  const handleEdit = async (productID: number) => {
    const encodedID = btoa(productID.toString());
    navigate(`/manage-stock/product/${encodedID}`);
  };

  return (
    <div>
      <PageMeta
        title="Manage Stock"
        description="Manage and View products Stock on inventa"
      />
      <PageBreadcrumb pageTitle="Manage Stock" />
      <ButtonComponentCard
        title="View All Stocks"
        buttonlink={all_routes.addstock}
        buttontitle="Add Stocks"
      >
        <div className="mb-4">
          <Search
            placeholder="Search products..."
            onSearch={handleSearch}
            onChange={(e) => handleSearch(e.target.value)}
            className="custom-search"
          />
        </div>
        <Table
          columns={columns}
          dataSource={filteredProductstockBatches}
          loading={loading}
          rowKey="product_id"
          className="custom-orders-table"
          pagination={{
            pageSize: 10,
          }}
          onChange={(pagination) => {
            setCurrentPage(pagination.current || 1);
          }}
          scroll={{ x: 800 }}
          locale={{ emptyText: "No products stock batches available." }}
        />
      </ButtonComponentCard>
    </div>
  );
};

export default Managestock;
