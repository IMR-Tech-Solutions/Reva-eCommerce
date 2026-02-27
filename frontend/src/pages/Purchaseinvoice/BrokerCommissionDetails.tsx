import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Table } from "antd";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ButtonComponentCard from "../../Admin/Components/ButtonComponentCard";
import { getbrokercomissionforinvoice } from "../../services/vendorservices";
import { handleError } from "../../utils/handleError";
import { toast } from "react-toastify";

interface BrokerCommissionBatch {
  batch_id: number;
  product: string;
  percent: number;
  amount: number;
}

interface BrokerCommissionData {
  broker_id: number;
  broker_name: string;
  commission_amount: number;
  batches: BrokerCommissionBatch[];
}

interface ApiResponse {
  invoice_id: number;
  total_broker_commission: number;
  broker_commissions: BrokerCommissionData[];
}

const BrokerCommissionDetails = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [commissionData, setCommissionData] = useState<ApiResponse | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  let actualInvoiceID: number | null = null;
  if (invoiceId) {
    try {
      actualInvoiceID = parseInt(atob(invoiceId), 10);
    } catch (e) {
      console.error("Invalid invoice ID in URL", e);
      toast.error("Invalid invoice ID");
      navigate(-1);
    }
  }

  const fetchBrokerCommission = async () => {
    if (!actualInvoiceID) return;

    try {
      setLoading(true);
      const response = await getbrokercomissionforinvoice(actualInvoiceID);
      setCommissionData(response);
    } catch (e) {
      handleError(e);
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrokerCommission();
  }, [actualInvoiceID]);

  // Main table columns for brokers
  const columns = [
    {
      title: "Sr. No",
      key: "srno",
      render: (_: any, __: BrokerCommissionData, index: number) =>
        (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "Broker Name",
      dataIndex: "broker_name",
      key: "broker_name",
      render: (name: string) => (
        <span className="font-medium text-gray-800 dark:text-white/90">
          {name}
        </span>
      ),
    },
    {
      title: "Total Commission (₹)",
      dataIndex: "commission_amount",
      key: "commission_amount",
      sorter: (a: BrokerCommissionData, b: BrokerCommissionData) =>
        a.commission_amount - b.commission_amount,
      render: (amount: number) => (
        <span className="font-semibold text-green-600">
          ₹{amount.toFixed(2)}
        </span>
      ),
    },
    {
      title: "Total Batches",
      key: "total_batches",
      render: (_: any, record: BrokerCommissionData) => (
        <span className="text-blue-600">{record.batches.length}</span>
      ),
    },
  ];

  // Expandable row render for batch details
  const expandedRowRender = (record: BrokerCommissionData) => {
    const batchColumns = [
      {
        title: "Product Name",
        dataIndex: "product",
        key: "product",
        render: (product: string) => (
          <span className="font-medium text-gray-800 dark:text-white/90">
            {product}
          </span>
        ),
      },
      {
        title: "Commission %",
        dataIndex: "percent",
        key: "percent",
        render: (percent: number) => (
          <span className="text-blue-600">{percent}%</span>
        ),
      },
      {
        title: "Commission Amount (₹)",
        dataIndex: "amount",
        key: "amount",
        render: (amount: number) => (
          <span className="font-semibold text-green-600">
            ₹{amount.toFixed(2)}
          </span>
        ),
      },
    ];

    return (
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h4 className="text-lg font-medium mb-3 text-gray-800 dark:text-white">
          Commission Details for {record.broker_name}
        </h4>
        <Table
          columns={batchColumns}
          dataSource={record.batches}
          pagination={false}
          size="small"
          rowKey="batch_id"
        />
      </div>
    );
  };

  return (
    <div>
      <PageMeta
        title="Broker Commission Details"
        description="View broker commission breakdown for this invoice."
      />
      <PageBreadcrumb pageTitle="Broker Commission Details" />

      <ButtonComponentCard
        title={`Broker Commission`}
        buttonlink=""
        buttontitle=""
      >
        <div className="mb-10">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ₹{commissionData?.total_broker_commission.toFixed(2) || "0.00"}
              </div>
              <div className="text-sm theme-text">Total Broker Commission</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold dark:text-white">
                {commissionData?.broker_commissions.length || 0}
              </div>
              <div className="text-sm theme-text">Total Brokers</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {commissionData?.broker_commissions.reduce(
                  (total, broker) => total + broker.batches.length,
                  0
                ) || 0}
              </div>
              <div className="text-sm theme-text">Total Batches</div>
            </div>
          </div>
        </div>

        {/* Main Table */}
        <Table
          columns={columns}
          dataSource={commissionData?.broker_commissions || []}
          loading={loading}
          rowKey="broker_id"
          className="custom-orders-table"
          expandable={{
            expandedRowRender,
            expandRowByClick: true,
          }}
          pagination={{
            pageSize: pageSize,
            showSizeChanger: false,
          }}
          onChange={(pagination) => {
            setCurrentPage(pagination.current || 1);
          }}
          scroll={{ x: 800 }}
          locale={{
            emptyText: "No broker commissions found for this invoice.",
          }}
        />
      </ButtonComponentCard>
    </div>
  );
};

export default BrokerCommissionDetails;
