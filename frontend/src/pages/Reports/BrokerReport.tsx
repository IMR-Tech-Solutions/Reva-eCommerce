import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { Table } from "antd";
import { ColumnsType } from "antd/es/table";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ButtonComponentCard from "../../Admin/Components/ButtonComponentCard";
import { getbrokercommissionreport } from "../../services/reportservices";
import { handleError } from "../../utils/handleError";
import {
  BrokerCommissionReportResponse,
  BrokerCommissionReportFilters,
} from "../../types/types2";
import { getmybrokerservice } from "../../services/brokerservices";

const BrokerCommissionReport = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [reportData, setReportData] =
    useState<BrokerCommissionReportResponse | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<
    "day" | "month" | "year"
  >("month");
  const [selectedBrokerId, setSelectedBrokerId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [availableBrokers, setAvailableBrokers] = useState<
    Array<{ id: number; name: string }>
  >([]);

  const formatINR = (value: number): string => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatINRShort = (value: number): string => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(1)}Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(1)}K`;
    }
    return `₹${value.toLocaleString("en-IN")}`;
  };

  useEffect(() => {
    const fetchBrokers = async () => {
      try {
        const response = await getmybrokerservice();
        setAvailableBrokers(
          response.map((broker) => ({
            id: broker.id,
            name: broker.broker_name,
          }))
        );
      } catch (error) {
        console.error("Error fetching brokers:", error);
        handleError(error);
      }
    };

    fetchBrokers();
  }, []);

  const fetchReportData = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const filters: BrokerCommissionReportFilters = {
        filter_type: selectedPeriod,
      };

      if (startDate) filters.start_date = startDate;
      if (endDate) filters.end_date = endDate;
      if (selectedBrokerId) filters.broker_id = selectedBrokerId;

      const response = await getbrokercommissionreport(filters);
      setReportData(response);
    } catch (error) {
      setIsError(true);
      handleError(error);
      console.error("Error fetching broker commission report data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [selectedPeriod, selectedBrokerId, startDate, endDate]);

  const handlePeriodChange = (period: "day" | "month" | "year") => {
    setSelectedPeriod(period);
  };

  const handleBrokerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedBrokerId(value ? parseInt(value) : null);
  };

  const refetch = () => {
    fetchReportData();
  };

  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  const getFirstDayOfMonth = () => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .split("T")[0];
  };

  // Prepare chart data using broker breakdown and trends
  const prepareChartData = () => {
    if (!reportData?.data?.broker_breakdown) {
      return {
        commissionSeries: [{ name: "Commission Earned", data: [] }],
        batchesSeries: [{ name: "Batches Count", data: [] }],
        categories: [],
      };
    }

    const brokerBreakdown = reportData.data.broker_breakdown;
    const categories = brokerBreakdown.map((broker) => broker.broker_name);
    const commissionData = brokerBreakdown.map(
      (broker) => broker.commission_earned
    );
    const batchesData = brokerBreakdown.map((broker) => broker.batches_count);

    return {
      commissionSeries: [{ name: "Commission Earned", data: commissionData }],
      batchesSeries: [{ name: "Batches Count", data: batchesData }],
      categories,
    };
  };

  const { commissionSeries, batchesSeries, categories } = prepareChartData();

  // Chart options for Commission
  const commissionOptions: ApexOptions = {
    colors: ["#3B82F6"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 310,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: "#9CA3AF",
          fontSize: "12px",
        },
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    yaxis: {
      title: {
        text: undefined,
      },
      labels: {
        style: {
          colors: "#9CA3AF",
          fontSize: "12px",
        },
        formatter: (value: number) => formatINRShort(value),
      },
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
      borderColor: "#F3F4F6",
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      x: {
        show: false,
      },
      y: {
        formatter: (val: number) => formatINR(val),
      },
    },
  };

  // Chart options for Batches
  const batchesOptions: ApexOptions = {
    colors: ["#10B981"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 310,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: "#9CA3AF",
          fontSize: "12px",
        },
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    yaxis: {
      title: {
        text: undefined,
      },
      labels: {
        style: {
          colors: "#9CA3AF",
          fontSize: "12px",
        },
      },
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
      borderColor: "#F3F4F6",
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      x: {
        show: false,
      },
      y: {
        formatter: (val: number) => `${val} batches`,
      },
    },
  };

  // Table columns for batch details
  const batchColumns: ColumnsType<any> = [
    {
      title: "S.No",
      key: "index",
      render: (_: any, __: any, index: number) => index + 1,
      width: 60,
    },
    {
      title: "Batch ID",
      dataIndex: "batch_id",
      key: "batch_id",
      sorter: (a, b) => a.batch_id - b.batch_id,
    },
    {
      title: "Product Name",
      dataIndex: "product_name",
      key: "product_name",
      className: "truncate text-sm",
      sorter: (a, b) => a.product_name.localeCompare(b.product_name),
    },
    {
      title: "Broker",
      dataIndex: "broker_name",
      key: "broker_name",
      className: "truncate text-sm",
      sorter: (a, b) => a.broker_name.localeCompare(b.broker_name),
    },
    {
      title: "Vendor",
      dataIndex: "vendor_name",
      key: "vendor_name",
      className: "truncate text-sm",
      sorter: (a, b) => a.vendor_name.localeCompare(b.vendor_name),
    },
    {
      title: "Quantity",
      dataIndex: "original_quantity",
      key: "quantity",
      sorter: (a, b) => a.quantity - b.quantity,
    },
    {
      title: "Purchase Price",
      dataIndex: "purchase_price",
      key: "purchase_price",
      render: (price: number) => formatINR(price),
      sorter: (a, b) => a.purchase_price - b.purchase_price,
    },
    {
      title: "Total Purchase Value",
      dataIndex: "total_purchase_value",
      key: "total_purchase_value",
      render: (value: number) => formatINR(value),
      sorter: (a, b) => a.total_purchase_value - b.total_purchase_value,
    },
    {
      title: "Commission %",
      dataIndex: "commission_percent",
      key: "commission_percent",
      render: (percent: number) => `${percent}%`,
      sorter: (a, b) => a.commission_percent - b.commission_percent,
    },
    {
      title: "Commission Amount",
      dataIndex: "commission_amount",
      key: "commission_amount",
      render: (amount: number) => formatINR(amount),
      sorter: (a, b) => a.commission_amount - b.commission_amount,
    },
  ];

  return (
    <div>
      <PageMeta
        title="Broker Commission Report"
        description="View detailed broker commission reports, track earnings, and analyze broker performance."
      />

      <PageBreadcrumb pageTitle="Broker Commission Report" />

      <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
        {/* Error indicator - subtle notification */}
        {isError && (
          <div className="mb-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between dark:bg-gray-800/50 dark:border-gray-700">
              <span className="text-gray-400 dark:text-gray-600 text-sm">
                Unable to load broker commission report data
              </span>
              <button
                onClick={() => refetch()}
                className="text-gray-400 dark:text-gray-600 underline text-sm hover:text-gray-500"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
          <div className="w-full">
            <div className="flex items-center gap-3">
              {/* Loading indicator in header */}
              {isLoading && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                  <span className="text-xs">Loading...</span>
                </div>
              )}
            </div>
            <p className="mt-1 text-gray-500 text-theme-base dark:text-gray-400">
              {selectedPeriod === "day" && "Daily commission analysis"}
              {selectedPeriod === "month" && "Monthly commission analysis"}
              {selectedPeriod === "year" && "Annual commission trends"}
              {reportData?.data?.target_broker_name &&
                ` - ${reportData.data.target_broker_name}`}
            </p>

            {/* Summary Statistics */}
            {reportData?.data?.summary && !isLoading && (
              <div className="mt-4 grid grid-cols-1 gap-4  md:grid-cols-2">
                <div className="bg-gray-50 rounded-lg p-3 dark:bg-gray-800/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Total Commission
                  </p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">
                    {formatINR(reportData.data.summary.total_commission_earned)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 dark:bg-gray-800/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Total Batches
                  </p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">
                    {reportData.data.summary.total_batches.toLocaleString(
                      "en-IN"
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-start w-full gap-3 sm:justify-end">
            {/* Filter Controls */}
            <div className="flex flex-col gap-3 min-w-[300px]">
              {/* Broker Selection */}
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Filter by Broker
                </label>
                <select
                  value={selectedBrokerId || ""}
                  onChange={handleBrokerChange}
                  disabled={isLoading}
                  className="px-2 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white disabled:opacity-50"
                >
                  <option value="">All Brokers</option>
                  {availableBrokers.map((broker) => (
                    <option key={broker.id} value={broker.id}>
                      {broker.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Period Selection */}
              <div className="flex bg-gray-100 rounded-lg p-1 dark:bg-gray-800">
                {[
                  { key: "day" as const, label: "Daily" },
                  { key: "month" as const, label: "Monthly" },
                  { key: "year" as const, label: "Yearly" },
                ].map((period) => (
                  <button
                    key={period.key}
                    onClick={() => handlePeriodChange(period.key)}
                    disabled={isLoading}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap disabled:opacity-50 ${
                      selectedPeriod === period.key
                        ? "bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400"
                        : "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>

              {/* Date Range Filters */}
              <div className="flex gap-2">
                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    disabled={isLoading}
                    max={getTodayDate()}
                    className="px-2 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white disabled:opacity-50"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={isLoading}
                    min={startDate || undefined}
                    max={getTodayDate()}
                    className="px-2 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white disabled:opacity-50"
                  />
                </div>
                {(startDate || endDate) && (
                  <button
                    onClick={() => {
                      setStartDate("");
                      setEndDate("");
                    }}
                    disabled={isLoading}
                    className="self-end px-2 py-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Quick Date Filters */}
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setStartDate(getTodayDate());
                    setEndDate(getTodayDate());
                  }}
                  disabled={isLoading}
                  className="px-2 py-1 text-xs text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 disabled:opacity-50"
                >
                  Today
                </button>
                <button
                  onClick={() => {
                    setStartDate(getFirstDayOfMonth());
                    setEndDate(getTodayDate());
                  }}
                  disabled={isLoading}
                  className="px-2 py-1 text-xs text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 disabled:opacity-50"
                >
                  This Month
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Commission Chart */}
          <div className="max-w-full overflow-x-auto custom-scrollbar">
            <div className="min-w-[500px] xl:min-w-full">
              <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4">
                Commission Earned by Broker
              </h4>
              {isLoading ? (
                <div className="flex items-center justify-center h-[310px]">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <span className="text-gray-400 dark:text-gray-600 text-sm">
                      Loading chart...
                    </span>
                  </div>
                </div>
              ) : isError ? (
                <div className="flex items-center justify-center h-[310px]">
                  <span className="text-gray-400 dark:text-gray-600 text-sm">
                    Error loading chart data
                  </span>
                </div>
              ) : (
                <Chart
                  options={commissionOptions}
                  series={commissionSeries}
                  type="bar"
                  height={310}
                  key={`commission-${selectedPeriod}-${selectedBrokerId}-${startDate}-${endDate}`}
                />
              )}
            </div>
          </div>

          {/* Batches Chart */}
          <div className="max-w-full overflow-x-auto custom-scrollbar">
            <div className="min-w-[500px] xl:min-w-full">
              <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4">
                Batches Count by Broker
              </h4>
              {isLoading ? (
                <div className="flex items-center justify-center h-[310px]">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <span className="text-gray-400 dark:text-gray-600 text-sm">
                      Loading chart...
                    </span>
                  </div>
                </div>
              ) : isError ? (
                <div className="flex items-center justify-center h-[310px]">
                  <span className="text-gray-400 dark:text-gray-600 text-sm">
                    Error loading chart data
                  </span>
                </div>
              ) : (
                <Chart
                  options={batchesOptions}
                  series={batchesSeries}
                  type="bar"
                  height={310}
                  key={`batches-${selectedPeriod}-${selectedBrokerId}-${startDate}-${endDate}`}
                />
              )}
            </div>
          </div>
        </div>

        {/* Batch Details Table */}
        <ButtonComponentCard
          title="Batch Commission Details"
          buttonlink=""
          buttontitle=""
        >
          <Table
            columns={batchColumns}
            dataSource={reportData?.data?.batch_details || []}
            loading={isLoading}
            rowKey="batch_id"
            className="custom-orders-table"
            pagination={{
              pageSize: 10,
            }}
            scroll={{ x: 800 }}
            locale={{ emptyText: "No batch details found." }}
          />
        </ButtonComponentCard>
      </div>
    </div>
  );
};

export default BrokerCommissionReport;
