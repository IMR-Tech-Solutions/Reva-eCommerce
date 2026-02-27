// pages/reports/ManagerProductSalesReport.tsx
import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { Table, Input } from "antd";
import { ColumnsType } from "antd/es/table";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ButtonComponentCard from "../../Admin/Components/ButtonComponentCard";
import { getmanagerproductsalesreport } from "../../services/reportservices";
import { getallusersservice } from "../../services/newuserservices";
import { handleError } from "../../utils/handleError";
import {
  ManagerProductSalesReportResponse,
  ManagerProductSalesReportFilters,
  UserData,
} from "../../types/types";

const { Search } = Input;

const ManagerShopReport = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [shopOwners, setShopOwners] = useState<UserData[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [reportData, setReportData] =
    useState<ManagerProductSalesReportResponse | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<
    "day" | "month" | "year"
  >("month");
  const [selectedShopOwnerId, setSelectedShopOwnerId] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchText, setSearchText] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);

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

  useEffect(() => {
    if (reportData?.data?.shop_owners && users.length > 0) {
      // Extract shop owner IDs who actually have purchase data
      const activeShopOwnerIds = reportData.data.shop_owners.map(
        (owner) => owner.shop_owner_id
      );

      // Filter the full user list to only include active shop owners
      const filteredShopOwners = users.filter((user) =>
        activeShopOwnerIds.includes(user.id)
      );

      setShopOwners(filteredShopOwners);
    } else {
      setShopOwners([]); // Clear if no data
    }
  }, [reportData, users]);

  // Filter products based on search
  useEffect(() => {
    if (reportData?.data?.products) {
      const filtered = reportData.data.products.filter(
        (product) =>
          product.product_name
            .toLowerCase()
            .includes(searchText.toLowerCase()) ||
          product.sales_velocity
            .toLowerCase()
            .includes(searchText.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [reportData, searchText]);

  const fetchReportData = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const filters: ManagerProductSalesReportFilters = {
        filter_type: selectedPeriod,
      };

      if (startDate) filters.start_date = startDate;
      if (endDate) filters.end_date = endDate;
      if (selectedShopOwnerId) filters.shop_owner_id = selectedShopOwnerId;

      const response = await getmanagerproductsalesreport(filters);
      setReportData(response);
    } catch (error) {
      setIsError(true);
      handleError(error);
      console.error("Error fetching Shop Sales Report data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [selectedPeriod, selectedShopOwnerId, startDate, endDate]);

  const handlePeriodChange = (period: "day" | "month" | "year") => {
    setSelectedPeriod(period);
  };

  const handleShopOwnerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedShopOwnerId(e.target.value);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const refetch = () => {
    fetchReportData();
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
    if (!reportData?.data?.trends) {
      return {
        revenueSeries: [{ name: "Revenue Earned", data: [] }],
        quantitySeries: [{ name: "Quantity Sold", data: [] }],
        categories: [],
      };
    }

    const trends = reportData.data.trends;
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

    const revenueDataPoints = trends.map((trend) => trend.revenue_earned);
    const quantityDataPoints = trends.map((trend) => trend.quantity_sold);

    return {
      revenueSeries: [{ name: "Revenue Earned", data: revenueDataPoints }],
      quantitySeries: [{ name: "Quantity Sold", data: quantityDataPoints }],
      categories,
    };
  };

  const { revenueSeries, quantitySeries, categories } = prepareChartData();

  // Chart options for Revenue
  const revenueOptions: ApexOptions = {
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
      sorter: (a, b) => a.product_name.localeCompare(b.product_name),
    },
    {
      title: "Total Quantity",
      dataIndex: "total_quantity_sold",
      key: "total_quantity_sold",
      sorter: (a, b) => a.total_quantity_sold - b.total_quantity_sold,
      render: (quantity: number) => quantity.toLocaleString("en-IN"),
    },
    {
      title: "Total Revenue",
      dataIndex: "total_revenue",
      key: "total_revenue",
      sorter: (a, b) => a.total_revenue - b.total_revenue,
      render: (amount: number) => formatINR(amount),
    },
    {
      title: "Orders",
      dataIndex: "total_orders",
      key: "total_orders",
      sorter: (a, b) => a.total_orders - b.total_orders,
      width: 80,
    },
  ];

  return (
    <div>
      <PageMeta
        title="Shop Sales Report"
        description="View detailed product sales performance, analyze sales velocity, and track revenue metrics."
      />

      <PageBreadcrumb pageTitle="Shop Sales Report" />

      <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
        {/* Error indicator */}
        {isError && (
          <div className="mb-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between dark:bg-gray-800/50 dark:border-gray-700">
              <span className="text-gray-400 dark:text-gray-600 text-sm">
                Unable to load Shop Sales Report data
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
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                  <span className="text-xs">Loading...</span>
                </div>
              )}
            </div>
            <p className="mt-1 text-gray-500 text-theme-base dark:text-gray-400">
              {selectedPeriod === "day" && "Daily product sales performance"}
              {selectedPeriod === "month" &&
                "Monthly product sales performance"}
              {selectedPeriod === "year" && "Annual product sales trends"}
              {reportData?.data?.date_range &&
                ` (${reportData.data.date_range.total_days} days)`}
            </p>

            {/* Enhanced Summary Statistics */}
            {reportData?.data?.summary && !isLoading && (
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="bg-gray-50 rounded-lg p-3 dark:bg-gray-800/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Total Revenue
                  </p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">
                    {formatINR(reportData.data.summary.total_revenue_earned)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 dark:bg-gray-800/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Quantity Sold
                  </p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">
                    {reportData.data.summary.total_quantity_sold.toLocaleString(
                      "en-IN"
                    )}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 dark:bg-gray-800/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Items Sold
                  </p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">
                    {reportData.data.summary.total_items_sold.toLocaleString(
                      "en-IN"
                    )}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 dark:bg-gray-800/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Unique Products
                  </p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">
                    {reportData.data.summary.unique_products_sold}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 dark:bg-gray-800/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Shop Owners
                  </p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">
                    {reportData.data.summary.unique_shop_owners_served}
                  </p>
                </div>
              </div>
            )}

            {/* Top Shop Owners */}
            {reportData?.data?.shop_owners &&
              reportData.data.shop_owners.length > 0 &&
              !selectedShopOwnerId &&
              !isLoading && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Top Shop Owners
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-3 dark:bg-gray-800/50">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {reportData.data.shop_owners
                        .slice(0, 3)
                        .map((owner, index) => (
                          <div
                            key={owner.shop_owner_id}
                            className="text-center"
                          >
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              #{index + 1} {owner.shop_owner_name}
                            </p>
                            <p className="text-sm font-semibold text-gray-800 dark:text-white">
                              {formatINR(owner.total_revenue_generated)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {owner.total_orders} orders •{" "}
                              {owner.unique_products_bought} products
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
          </div>

          <div className="flex items-start w-full gap-3 sm:justify-end">
            <div className="flex flex-col gap-3 min-w-[350px]">
              {/* Shop Owner Selection */}
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Filter by Shop Owner
                </label>
                <select
                  value={selectedShopOwnerId}
                  onChange={handleShopOwnerChange}
                  disabled={isLoading || isUsersLoading}
                  className="px-2 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white disabled:opacity-50"
                >
                  <option value="">All Shop Owners</option>
                  {shopOwners.map((shopOwner) => (
                    <option key={shopOwner.id} value={shopOwner.id.toString()}>
                      {shopOwner.first_name} {shopOwner.last_name}
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
                {selectedShopOwnerId && (
                  <button
                    onClick={() => setSelectedShopOwnerId("")}
                    disabled={isLoading}
                    className="px-2 py-1 text-xs text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 disabled:opacity-50"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Revenue Chart */}
          <div className="max-w-full overflow-x-auto custom-scrollbar">
            <div className="min-w-[500px] xl:min-w-full">
              <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4">
                Revenue Earned
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
                  options={revenueOptions}
                  series={revenueSeries}
                  type="bar"
                  height={310}
                  key={`revenue-${selectedPeriod}-${selectedShopOwnerId}-${startDate}-${endDate}`}
                />
              )}
            </div>
          </div>

          {/* Quantity Chart */}
          <div className="max-w-full overflow-x-auto custom-scrollbar">
            <div className="min-w-[500px] xl:min-w-full">
              <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4">
                Quantity Sold
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
                  key={`quantity-${selectedPeriod}-${selectedShopOwnerId}-${startDate}-${endDate}`}
                />
              )}
            </div>
          </div>
        </div>

        {/* Products Table */}
        <ButtonComponentCard
          title="Products Performance Analysis"
          buttonlink=""
          buttontitle=""
        >
          <div className="mb-4">
            <Search
              placeholder="Search products or sales velocity..."
              onSearch={handleSearch}
              onChange={(e) => handleSearch(e.target.value)}
              className="custom-search"
            />
          </div>
          <Table
            columns={productColumns}
            dataSource={filteredProducts}
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

export default ManagerShopReport;
