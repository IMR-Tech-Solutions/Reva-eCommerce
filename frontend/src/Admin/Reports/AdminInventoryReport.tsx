// pages/admin/AdminInventoryReport.tsx
import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { Table } from "antd";
import { ColumnsType } from "antd/es/table";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ButtonComponentCard from "../../Admin/Components/ButtonComponentCard";
import { getadmininventoryreport } from "../../services/reportservices";
import { getallusersservice } from "../../services/newuserservices";
import { handleError } from "../../utils/handleError";
import {
  AdminInventoryReportResponse,
  AdminInventoryReportFilters,
  UserData,
} from "../../types/types";

const AdminInventoryReport = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [inventoryData, setInventoryData] =
    useState<AdminInventoryReportResponse | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [activeUsers, setActiveUsers] = useState<UserData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<
    "day" | "month" | "year"
  >("month");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Currency formatting functions
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

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      setIsUsersLoading(true);
      try {
        const response = await getallusersservice();
        setUsers(response);
      } catch (error) {
        console.error("Error fetching users:", error);
        handleError(error);
      } finally {
        setIsUsersLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter active users from inventory data
  useEffect(() => {
    if (inventoryData?.data?.products_by_status && users.length > 0) {
      const activeUserIds = [
        ...new Set(
          inventoryData.data.products_by_status.flatMap((group) =>
            group.products.map((product) => product.user_id)
          )
        ),
      ];

      const filteredActiveUsers = users.filter((user) =>
        activeUserIds.includes(user.id)
      );
      setActiveUsers(filteredActiveUsers);
    } else {
      setActiveUsers([]);
    }
  }, [inventoryData, users]);

  const fetchInventoryData = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const filters: AdminInventoryReportFilters = {
        filter_type: selectedPeriod,
      };

      if (startDate) filters.start_date = startDate;
      if (endDate) filters.end_date = endDate;
      if (selectedUserId) filters.user_id = selectedUserId;
      if (selectedStatus) filters.status = selectedStatus;

      const response = await getadmininventoryreport(filters);
      setInventoryData(response);
    } catch (error) {
      setIsError(true);
      handleError(error);
      console.error("Error fetching admin inventory report data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, [selectedPeriod, selectedUserId, selectedStatus, startDate, endDate]);

  const handlePeriodChange = (period: "day" | "month" | "year") => {
    setSelectedPeriod(period);
  };

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedUserId(value ? parseInt(value) : null);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value);
  };

  const refetch = () => {
    fetchInventoryData();
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

  // Prepare chart data - using status breakdown for charts
  const prepareChartData = () => {
    if (!inventoryData?.data?.status_breakdown) {
      return {
        statusSeries: [{ name: "Batches", data: [] }],
        valueSeries: [{ name: "Stock Value", data: [] }],
        categories: [],
      };
    }

    const statusBreakdown = inventoryData.data.status_breakdown;
    const categories = statusBreakdown.map((status) => status.status_label);
    const statusCounts = statusBreakdown.map((status) => status.count);

    // Mock stock value data since it's not in status breakdown
    const stockValues = statusBreakdown.map(
      (status) => status.count * inventoryData.data.summary.average_batch_value
    );

    return {
      statusSeries: [{ name: "Batches", data: statusCounts }],
      valueSeries: [{ name: "Stock Value", data: stockValues }],
      categories,
    };
  };

  const { statusSeries, valueSeries, categories } = prepareChartData();

  // Chart options for Batch Count
  const batchesOptions: ApexOptions = {
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

  // Chart options for Stock Value
  const stockValueOptions: ApexOptions = {
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

  // Flatten products from all statuses for table
  const getAllProducts = () => {
    if (!inventoryData?.data?.products_by_status) return [];

    return inventoryData.data.products_by_status.flatMap((group) =>
      group.products.map((product) => ({
        ...product,
        key: product.batch_id,
      }))
    );
  };

  // Table columns for products
  const productColumns: ColumnsType<any> = [
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
      title: "User",
      dataIndex: "user_name",
      key: "user_name",
      className: "truncate text-sm",
      sorter: (a, b) => a.user_name.localeCompare(b.user_name),
    },
    {
      title: "Stock",
      key: "stock",
      render: (_, record) => `${record.quantity}/${record.original_quantity}`,
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
      title: "Selling Price",
      dataIndex: "selling_price",
      key: "selling_price",
      render: (price: number) => formatINR(price),
      sorter: (a, b) => a.selling_price - b.selling_price,
    },
    {
      title: "Vendor",
      dataIndex: "vendor_name",
      key: "vendor_name",
      className: "truncate text-sm",
      sorter: (a, b) => a.vendor_name.localeCompare(b.vendor_name),
    },
    {
      title: "Expiry Date",
      dataIndex: "expiry_date",
      key: "expiry_date",
      render: (date: string) => new Date(date).toLocaleDateString("en-IN"),
      sorter: (a, b) =>
        new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime(),
    },
    {
      title: "Status",
      dataIndex: "batch_status_label",
      key: "batch_status_label",
    },
  ];

  return (
    <div>
      <PageMeta
        title="Admin Inventory Report"
        description="View detailed inventory reports across all users, track stock levels, and analyze batch performance."
      />

      <PageBreadcrumb pageTitle="Admin Inventory Report" />

      <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
        {/* Error indicator - subtle notification */}
        {isError && (
          <div className="mb-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between dark:bg-gray-800/50 dark:border-gray-700">
              <span className="text-gray-400 dark:text-gray-600 text-sm">
                Unable to load admin inventory report data
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
              {selectedPeriod === "day" &&
                "Daily inventory analysis across system"}
              {selectedPeriod === "month" &&
                "Monthly inventory analysis across system"}
              {selectedPeriod === "year" &&
                "Annual inventory trends across system"}
              {inventoryData?.data?.target_user_name &&
                ` - ${inventoryData.data.target_user_name}`}
            </p>

            {/* Summary Statistics */}
            {inventoryData?.data?.summary && !isLoading && (
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="bg-gray-50 rounded-lg p-3 dark:bg-gray-800/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Total Stock Value
                  </p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">
                    {formatINR(inventoryData.data.summary.total_stock_value)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 dark:bg-gray-800/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Total Batches
                  </p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">
                    {inventoryData.data.summary.total_batches.toLocaleString(
                      "en-IN"
                    )}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 dark:bg-gray-800/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Active Batches
                  </p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">
                    {inventoryData.data.summary.active_batches.toLocaleString(
                      "en-IN"
                    )}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 dark:bg-gray-800/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Total Commission
                  </p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">
                    {formatINR(inventoryData.data.summary.total_commission)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 dark:bg-gray-800/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Total Tax
                  </p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">
                    {formatINR(inventoryData.data.summary.total_tax)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 dark:bg-gray-800/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Total With Tax
                  </p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">
                    {formatINR(inventoryData.data.summary.total_with_tax)}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-start w-full gap-3 sm:justify-end">
            {/* Filter Controls */}
            <div className="flex flex-col gap-3 min-w-[350px]">
              {/* User Selection */}
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Filter by User
                </label>
                <select
                  value={selectedUserId || ""}
                  onChange={handleUserChange}
                  disabled={isLoading || isUsersLoading}
                  className="px-2 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white disabled:opacity-50"
                >
                  <option value="">All Users</option>
                  {activeUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.first_name} {user.last_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Selection */}
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Filter by Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={handleStatusChange}
                  disabled={isLoading}
                  className="px-2 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white disabled:opacity-50"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="sold">Sold</option>
                  <option value="not_active">Not Active</option>
                  <option value="damaged">Damaged</option>
                  <option value="expired">Expired</option>
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
                {(selectedUserId || selectedStatus) && (
                  <button
                    onClick={() => {
                      setSelectedUserId(null);
                      setSelectedStatus("");
                    }}
                    disabled={isLoading}
                    className="px-2 py-1 text-xs text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 disabled:opacity-50"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Batch Count Chart */}
          <div className="max-w-full overflow-x-auto custom-scrollbar">
            <div className="min-w-[500px] xl:min-w-full">
              <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4">
                Batch Count by Status
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
                  options={batchesOptions}
                  series={statusSeries}
                  type="bar"
                  height={310}
                  key={`batches-${selectedPeriod}-${selectedUserId}-${selectedStatus}-${startDate}-${endDate}`}
                />
              )}
            </div>
          </div>

          {/* Stock Value Chart */}
          <div className="max-w-full overflow-x-auto custom-scrollbar">
            <div className="min-w-[500px] xl:min-w-full">
              <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4">
                Stock Value by Status
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
                  options={stockValueOptions}
                  series={valueSeries}
                  type="bar"
                  height={310}
                  key={`stock-${selectedPeriod}-${selectedUserId}-${selectedStatus}-${startDate}-${endDate}`}
                />
              )}
            </div>
          </div>
        </div>

        {/* Products Table */}
        <ButtonComponentCard
          title="Admin Inventory Batches"
          buttonlink=""
          buttontitle=""
        >
          <Table
            columns={productColumns}
            dataSource={getAllProducts()}
            loading={isLoading}
            rowKey="batch_id"
            className="custom-orders-table"
            pagination={{
              pageSize: 10,
            }}
            scroll={{ x: 800 }}
            locale={{ emptyText: "No inventory batches found." }}
          />
        </ButtonComponentCard>
      </div>
    </div>
  );
};

export default AdminInventoryReport;
