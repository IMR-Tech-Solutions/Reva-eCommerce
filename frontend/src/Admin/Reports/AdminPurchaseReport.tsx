// pages/admin/AdminPurchaseReport.tsx
import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { Table } from "antd";
import { ColumnsType } from "antd/es/table";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ButtonComponentCard from "../../Admin/Components/ButtonComponentCard";
import { getadminpurchasereport } from "../../services/reportservices";
import { getallvendorservice } from "../../services/vendorservices";
import { getallusersservice } from "../../services/newuserservices";
import { handleError } from "../../utils/handleError";
import {
  AdminPurchaseReportResponse,
  AdminPurchaseReportFilters,
  VendorData,
  UserData,
} from "../../types/types";

const AdminPurchaseReport = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isVendorsLoading, setIsVendorsLoading] = useState(false);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [purchaseData, setPurchaseData] =
    useState<AdminPurchaseReportResponse | null>(null);
  const [vendors, setVendors] = useState<VendorData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<
    "day" | "month" | "year"
  >("month");
  const [selectedVendorId, setSelectedVendorId] = useState<number | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Period options array
  const periods = [
    { key: "day" as const, label: "Daily" },
    { key: "month" as const, label: "Monthly" },
    { key: "year" as const, label: "Yearly" },
  ];

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

  // Fetch vendors and users on component mount
  useEffect(() => {
    const fetchVendors = async () => {
      setIsVendorsLoading(true);
      try {
        const response = await getallvendorservice();
        setVendors(response);
      } catch (error) {
        console.error("Error fetching vendors:", error);
        handleError(error);
      } finally {
        setIsVendorsLoading(false);
      }
    };

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

    fetchVendors();
    fetchUsers();
  }, []);

  const fetchPurchaseData = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const filters: AdminPurchaseReportFilters = {
        filter_type: selectedPeriod,
      };

      if (startDate) filters.start_date = startDate;
      if (endDate) filters.end_date = endDate;
      if (selectedVendorId) filters.vendor_id = selectedVendorId;
      if (selectedUserId) filters.user_id = selectedUserId;

      const response = await getadminpurchasereport(filters);
      setPurchaseData(response);
    } catch (error) {
      setIsError(true);
      handleError(error);
      console.error("Error fetching admin purchase report data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseData();
  }, [selectedPeriod, selectedVendorId, selectedUserId, startDate, endDate]);

  const handlePeriodChange = (period: "day" | "month" | "year") => {
    setSelectedPeriod(period);
  };

  const handleVendorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedVendorId(value ? parseInt(value) : null);
  };

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedUserId(value ? parseInt(value) : null);
  };

  const refetch = () => {
    fetchPurchaseData();
  };

  const getTodayDate = (): string => {
    return new Date().toISOString().split("T")[0];
  };

  const getFirstDayOfMonth = (): string => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .split("T")[0];
  };

  // Prepare chart data
  const prepareChartData = () => {
    if (!purchaseData?.data?.trends) {
      return {
        amountSeries: [{ name: "Amount Spent", data: [] }],
        quantitySeries: [{ name: "Quantity Purchased", data: [] }],
        categories: [],
      };
    }

    const trends = purchaseData.data.trends;
    const categories = trends.map((trend) => {
      const date = new Date(trend.period);
      if (selectedPeriod === "day") {
        return date.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        });
      } else if (selectedPeriod === "month") {
        return date.toLocaleDateString("en-IN", {
          month: "short",
          year: "numeric",
        });
      } else {
        return date.getFullYear().toString();
      }
    });

    const amountDataPoints = trends.map((trend) => trend.amount_spent);
    const quantityDataPoints = trends.map((trend) => trend.quantity_purchased);

    return {
      amountSeries: [{ name: "Amount Spent", data: amountDataPoints }],
      quantitySeries: [
        { name: "Quantity Purchased", data: quantityDataPoints },
      ],
      categories,
    };
  };

  const { amountSeries, quantitySeries, categories } = prepareChartData();

  // Chart options for Amount Spent
  const amountOptions: ApexOptions = {
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

  const quantityOptions: ApexOptions = {
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
        formatter: (val: number) => `${val.toLocaleString("en-IN")} units`,
      },
    },
  };

  // Define table columns for products
  const productColumns: ColumnsType<any> = [
    {
      title: "S.No",
      key: "index",
      render: (_: any, __: any, index: number) => index + 1,
      width: 60,
    },
    {
      title: "Product Name",
      dataIndex: "product_name",
      key: "product_name",
      className: "truncate text-sm",
      sorter: (a, b) => a.product_name.localeCompare(b.product_name),
    },
    {
      title: "Vendor Name",
      dataIndex: "vendor_name",
      key: "vendor_name",
      className: "truncate text-sm",
      sorter: (a, b) => a.vendor_name.localeCompare(b.vendor_name),
    },
    {
      title: "Vendor Owner Name",
      dataIndex: "vendor_owner_name",
      key: "vendor_owner_name",
      className: "truncate text-sm",
      sorter: (a, b) => a.vendor_owner_name.localeCompare(b.vendor_owner_name),
    },
    {
      title: "Total Quantity",
      dataIndex: "total_quantity",
      key: "total_quantity",
      sorter: (a, b) => a.total_quantity - b.total_quantity,
      render: (quantity: number) => quantity.toLocaleString("en-IN"),
    },
    {
      title: "Total Amount",
      dataIndex: "total_amount",
      key: "total_amount",
      sorter: (a, b) => a.total_amount - b.total_amount,
      render: (amount: number) => formatINR(amount),
    },
  ];

  return (
    <div>
      <PageMeta
        title="Admin Purchase Report"
        description="View detailed purchase reports across all managers and vendors, track spending, and analyze performance."
      />

      <PageBreadcrumb pageTitle="Admin Purchase Report" />

      <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
        {/* Error indicator */}
        {isError && (
          <div className="mb-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between dark:bg-gray-800/50 dark:border-gray-700">
              <span className="text-gray-400 dark:text-gray-600 text-sm">
                Unable to load admin purchase report data
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
              {isLoading && (
                <div className="flex items-center gap-2 text-base text-gray-500">
                  <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                  <span className="text-xs">Loading...</span>
                </div>
              )}
            </div>
            <p className="mt-1 text-gray-500 text-theme-base dark:text-gray-400">
              {selectedPeriod === "day" &&
                "Daily purchase analysis across system"}
              {selectedPeriod === "month" &&
                "Monthly purchase analysis across system"}
              {selectedPeriod === "year" &&
                "Annual purchase trends across system"}
            </p>

            {/* System Summary Statistics */}
            {purchaseData?.data?.system_summary && !isLoading && (
              <div className="mt-4 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                <div className="bg-gray-50 rounded-lg p-3 dark:bg-gray-800/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Total Spent
                  </p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">
                    {formatINR(
                      purchaseData.data.system_summary.total_amount_spent
                    )}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 dark:bg-gray-800/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Total Quantity
                  </p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">
                    {purchaseData.data.system_summary.total_quantity_purchased.toLocaleString(
                      "en-IN"
                    )}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 dark:bg-gray-800/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Total Batches
                  </p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">
                    {purchaseData.data.system_summary.total_batches.toLocaleString(
                      "en-IN"
                    )}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 dark:bg-gray-800/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Active Users
                  </p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">
                    {purchaseData.data.system_summary.active_managers}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 dark:bg-gray-800/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Active Vendors
                  </p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">
                    {purchaseData.data.system_summary.active_vendors}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-start w-full gap-3 sm:justify-end">
            <div className="flex flex-col gap-3 min-w-[350px]">
              {/* Manager Selection */}
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Filter by Users
                </label>
                <select
                  value={selectedUserId || ""}
                  onChange={handleUserChange}
                  disabled={isLoading || isUsersLoading}
                  className="px-2 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white disabled:opacity-50"
                >
                  <option value="">All Users</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.first_name} {user.last_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Vendor Selection */}
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Filter by Vendor
                </label>
                <select
                  value={selectedVendorId || ""}
                  onChange={handleVendorChange}
                  disabled={isLoading || isVendorsLoading}
                  className="px-2 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white disabled:opacity-50"
                >
                  <option value="">All Vendors</option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.vendor_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Period Selection */}
              <div className="flex bg-gray-100 rounded-lg p-1 dark:bg-gray-800">
                {periods.map((period) => (
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
                {(selectedVendorId || selectedUserId) && (
                  <button
                    onClick={() => {
                      setSelectedVendorId(null);
                      setSelectedUserId(null);
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
          {/* Amount Spent Chart */}
          <div className="max-w-full overflow-x-auto custom-scrollbar">
            <div className="min-w-[500px] xl:min-w-full">
              <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4">
                Amount Spent
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
                  options={amountOptions}
                  series={amountSeries}
                  type="bar"
                  height={310}
                  key={`amount-${selectedPeriod}-${selectedVendorId}-${selectedUserId}-${startDate}-${endDate}`}
                />
              )}
            </div>
          </div>

          {/* Quantity Purchased Chart */}
          <div className="max-w-full overflow-x-auto custom-scrollbar">
            <div className="min-w-[500px] xl:min-w-full">
              <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4">
                Quantity Purchased
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
                  options={quantityOptions}
                  series={quantitySeries}
                  type="bar"
                  height={310}
                  key={`quantity-${selectedPeriod}-${selectedVendorId}-${selectedUserId}-${startDate}-${endDate}`}
                />
              )}
            </div>
          </div>
        </div>

        {/* Products Table */}
        <ButtonComponentCard
          title="Products Breakdown"
          buttonlink=""
          buttontitle=""
        >
          <Table
            columns={productColumns}
            dataSource={purchaseData?.data?.products || []}
            loading={isLoading}
            rowKey="product_id"
            className="custom-orders-table"
            pagination={{
              pageSize: 10,
            }}
            scroll={{ x: 800 }}
            locale={{ emptyText: "No products found." }}
          />
        </ButtonComponentCard>
      </div>
    </div>
  );
};

export default AdminPurchaseReport;
