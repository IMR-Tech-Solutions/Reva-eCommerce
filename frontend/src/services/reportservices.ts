import api from "./baseapi";
import {
  ReportFilters,
  AdminReportFilters,
  PurchaseReportFilters,
  AdminPurchaseReportFilters,
  ShopPurchaseReportFilters,
  AdminShopPurchaseReportFilters,
  ManagerProductSalesReportFilters,
  InventoryReportFilters,
  AdminInventoryReportFilters,
} from "../types/types";
import {
  BrokerCommissionReportFilters,
  TaxReportFilters,
  AdminTaxReportFilters,
} from "../types/types2";

// Normal USers sales Report
export const getsalesreport = async (filters: ReportFilters = {}) => {
  const params = new URLSearchParams();

  if (filters.start_date) {
    params.append("start_date", filters.start_date);
  }
  if (filters.end_date) {
    params.append("end_date", filters.end_date);
  }
  if (filters.filter_type) {
    params.append("filter_type", filters.filter_type);
  }

  const response = await api.get(`reports/sales/?${params.toString()}`);
  return response.data;
};

// Admin Sales REport
export const getadminsalesreport = async (filters: AdminReportFilters = {}) => {
  const params = new URLSearchParams();

  if (filters.start_date) {
    params.append("start_date", filters.start_date);
  }
  if (filters.end_date) {
    params.append("end_date", filters.end_date);
  }
  if (filters.filter_type) {
    params.append("filter_type", filters.filter_type);
  }
  if (filters.user_id) {
    params.append("user_id", filters.user_id.toString());
  }

  const response = await api.get(`admin/reports/sales/?${params.toString()}`);
  return response.data;
};

//purchase report
export const getpurchasereport = async (
  filters: PurchaseReportFilters = {}
) => {
  const params = new URLSearchParams();

  if (filters.start_date) {
    params.append("start_date", filters.start_date);
  }
  if (filters.end_date) {
    params.append("end_date", filters.end_date);
  }
  if (filters.filter_type) {
    params.append("filter_type", filters.filter_type);
  }
  if (filters.vendor_id) {
    params.append("vendor_id", filters.vendor_id.toString());
  }

  const response = await api.get(
    `reports/purchase-report/?${params.toString()}`
  );
  return response.data;
};

//admin purchase report
export const getadminpurchasereport = async (
  filters: AdminPurchaseReportFilters = {}
) => {
  const params = new URLSearchParams();

  if (filters.start_date) {
    params.append("start_date", filters.start_date);
  }
  if (filters.end_date) {
    params.append("end_date", filters.end_date);
  }
  if (filters.filter_type) {
    params.append("filter_type", filters.filter_type);
  }
  if (filters.vendor_id) {
    params.append("vendor_id", filters.vendor_id.toString());
  }
  if (filters.user_id) {
    params.append("user_id", filters.user_id.toString());
  }

  const response = await api.get(
    `admin/reports/purchase-report/?${params.toString()}`
  );
  return response.data;
};

//shop pruchase report
export const getshoppurchasereport = async (
  filters: ShopPurchaseReportFilters = {}
) => {
  const params = new URLSearchParams();

  if (filters.start_date) {
    params.append("start_date", filters.start_date);
  }
  if (filters.end_date) {
    params.append("end_date", filters.end_date);
  }
  if (filters.filter_type) {
    params.append("filter_type", filters.filter_type);
  }
  if (filters.manager_id) {
    params.append("manager_id", filters.manager_id.toString());
  }

  const response = await api.get(`reports/shop-purchase/?${params.toString()}`);
  return response.data;
};

//admin shop purchase report
export const getadminshoppurchasereport = async (
  filters: AdminShopPurchaseReportFilters = {}
) => {
  const params = new URLSearchParams();

  if (filters.start_date) {
    params.append("start_date", filters.start_date);
  }
  if (filters.end_date) {
    params.append("end_date", filters.end_date);
  }
  if (filters.filter_type) {
    params.append("filter_type", filters.filter_type);
  }
  if (filters.shop_owner_id) {
    params.append("shop_owner_id", filters.shop_owner_id.toString());
  }
  if (filters.manager_id) {
    params.append("manager_id", filters.manager_id.toString());
  }

  const response = await api.get(
    `admin/reports/shop-purchase/?${params.toString()}`
  );
  return response.data;
};

//manager shop report
export const getmanagerproductsalesreport = async (
  filters: ManagerProductSalesReportFilters = {}
) => {
  const params = new URLSearchParams();

  if (filters.start_date) {
    params.append("start_date", filters.start_date);
  }
  if (filters.end_date) {
    params.append("end_date", filters.end_date);
  }
  if (filters.filter_type) {
    params.append("filter_type", filters.filter_type);
  }
  if (filters.shop_owner_id) {
    params.append("shop_owner_id", filters.shop_owner_id);
  }

  const response = await api.get(
    `reports/manager-product-sales/?${params.toString()}`
  );
  return response.data;
};

//inventory report
export const getinventoryreport = async (
  filters: InventoryReportFilters = {}
) => {
  const params = new URLSearchParams();

  if (filters.start_date) {
    params.append("start_date", filters.start_date);
  }
  if (filters.end_date) {
    params.append("end_date", filters.end_date);
  }
  if (filters.status) {
    params.append("status", filters.status);
  }
  if (filters.filter_type) {
    params.append("filter_type", filters.filter_type);
  }

  const response = await api.get(
    `reports/inventory-report/?${params.toString()}`
  );
  return response.data;
};

//admin iventory report
export const getadmininventoryreport = async (
  filters: AdminInventoryReportFilters = {}
) => {
  const params = new URLSearchParams();

  if (filters.user_id) {
    params.append("user_id", filters.user_id.toString());
  }
  if (filters.start_date) {
    params.append("start_date", filters.start_date);
  }
  if (filters.end_date) {
    params.append("end_date", filters.end_date);
  }
  if (filters.status) {
    params.append("status", filters.status);
  }
  if (filters.filter_type) {
    params.append("filter_type", filters.filter_type);
  }

  const response = await api.get(
    `admin/reports/inventory-report/?${params.toString()}`
  );
  return response.data;
};

//broker commission report
export const getbrokercommissionreport = async (
  filters: BrokerCommissionReportFilters = {}
) => {
  const params = new URLSearchParams();

  if (filters.broker_id) {
    params.append("broker_id", filters.broker_id.toString());
  }
  if (filters.start_date) {
    params.append("start_date", filters.start_date);
  }
  if (filters.end_date) {
    params.append("end_date", filters.end_date);
  }
  if (filters.filter_type) {
    params.append("filter_type", filters.filter_type);
  }

  const response = await api.get(
    `reports/broker-commission/?${params.toString()}`
  );
  return response.data;
};

//admin broker commission report
export const getadminbrokercommissionreport = async (
  filters: BrokerCommissionReportFilters = {}
) => {
  const params = new URLSearchParams();

  if (filters.broker_id) {
    params.append("broker_id", filters.broker_id.toString());
  }
  if (filters.start_date) {
    params.append("start_date", filters.start_date);
  }
  if (filters.end_date) {
    params.append("end_date", filters.end_date);
  }
  if (filters.filter_type) {
    params.append("filter_type", filters.filter_type);
  }

  const response = await api.get(
    `admin/reports/broker-commission/?${params.toString()}`
  );
  return response.data;
};

//tax report
export const gettaxreport = async (filters: TaxReportFilters = {}) => {
  const params = new URLSearchParams();

  if (filters.start_date) {
    params.append("start_date", filters.start_date);
  }
  if (filters.end_date) {
    params.append("end_date", filters.end_date);
  }
  if (filters.filter_type) {
    params.append("filter_type", filters.filter_type);
  }

  const response = await api.get(`reports/tax-report/?${params.toString()}`);
  return response.data;
};

//admin tax report
export const getadmintaxreport = async (
  filters: AdminTaxReportFilters = {}
) => {
  const params = new URLSearchParams();

  if (filters.user_id) {
    params.append("user_id", filters.user_id.toString());
  }
  if (filters.start_date) {
    params.append("start_date", filters.start_date);
  }
  if (filters.end_date) {
    params.append("end_date", filters.end_date);
  }
  if (filters.filter_type) {
    params.append("filter_type", filters.filter_type);
  }

  const response = await api.get(
    `admin/reports/tax-report/?${params.toString()}`
  );
  return response.data;
};
