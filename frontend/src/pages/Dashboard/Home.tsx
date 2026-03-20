import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import PageMeta from "../../components/common/PageMeta";
import EnableNotificationsButton from "../../firebase/enableNotification";
import { useSelector } from "react-redux";
import AllmetricData from "../../Admin/Components/AllmetricData";
import Allusers from "../../Admin/Users/Allusers";

export default function Home() {
  const user = useSelector((state: any) => state.user?.user);
  const permissions = useSelector((state: any) => state.user?.permissions);
  
  const isAdmin = Number(user?.role_id) === 1 || user?.role?.toLowerCase() === "admin";

  const hasPermission = (module: string) => {
    if (permissions === null || !permissions) return false;
    return permissions === "all" || permissions.includes(module);
  };

  if (isAdmin) {
    return (
      <>
        <PageMeta
          title="Inventa | Admin Panel"
          description="Manage all inventa users, customers, orders"
        />
        <div className="space-y-6">
          <AllmetricData />
          <Allusers />
        </div>
      </>
    );
  }

  // Determine visibility for vendor dashboard widgets
  const showMetrics = hasPermission("orders") || hasPermission("customers") || hasPermission("products");
  const showSalesChart = hasPermission("salesreport");
  const showMonthlyTarget = hasPermission("salesreport");
  const showStatistics = hasPermission("salesreport") || hasPermission("inventoryreport");

  return (
    <>
      <PageMeta
        title="Inventa | Smart Inventory & Product Management System"
        description="Inventa is a powerful inventory and product management solution to manage categories, products, orders, and users efficiently."
      />

      {Notification.permission !== "granted" && (
        <div className="mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-5 5-5-5h5V3h0z"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                    Stay Updated with Instant Notifications
                  </h3>
                  <p className="text-sm text-[#FFB700] dark:text-blue-200 mt-1">
                    Get real-time alerts for new orders, inventory updates, and
                    important system notifications directly on your device.
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0 sm:ml-4">
                <EnableNotificationsButton />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conditionally Render Vendor Widgets */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        
        {/* Left Column - Metrics & Sales Chart */}
        {(showMetrics || showSalesChart) && (
          <div className="col-span-12 space-y-6 xl:col-span-7">
            {showMetrics && <EcommerceMetrics />}
            {showSalesChart && <MonthlySalesChart />}
          </div>
        )}

        {/* Right Column - Monthly Target */}
        {showMonthlyTarget && (
          <div className="col-span-12 xl:col-span-5">
            <MonthlyTarget />
          </div>
        )}

        {/* Bottom Full-Width Chart - Statistics */}
        {showStatistics && (
          <div className="col-span-12">
            <StatisticsChart />
          </div>
        )}

      </div>

      {(!showMetrics && !showSalesChart && !showMonthlyTarget && !showStatistics) && (
        <div className="flex items-center justify-center p-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-center">
            You do not have permission to view any dashboard metrics. Please contact your administrator.
          </p>
        </div>
      )}

    </>
  );
}
