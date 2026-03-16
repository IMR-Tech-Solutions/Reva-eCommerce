export const all_routes = {
  signIn: "/admin/login",
  signUp: "/admin/signup",
  home: "/dashboard",
  orders: "/orders",
  shoporders: "/shop-orders",
  createorders: "/new-order",
  products: "/products",
  categories: "/categories",
  customer: "/customers",
  vendors: "/vendors",
  addproducts: "/add-products",
  addcategories: "/add-categories",
  addcustomer: "/add-customers",
  addvendors: "/add-vendors",
  chat: "/chat",
  addstock: "/add-stock",

  managestock: "/manage-stock",
  manageproductstock: "/manage-stock/product/:productID",
  stockalert: "/stock-alerts",
  purchaseinvoice: "/purchase-inovice",
  salesreport: "/sales-report",
  purchasereport: "/purchase-report",
  inventoryreport: "/inventory-report",
  vendorreport: "/vendor-report",
  shopreport: "/shop-report",
  notifications: "/notifications",
  //reset password
  resetpassword: "/reset-password",

  // Others Page
  profile: "/profile",
  calendar: "/calendar",

  blank: "/blank",

  // Forms
  formElements: "/form-elements",

  // Tables
  basicTables: "/basic-tables",

  // UI Elements
  alerts: "/alerts",
  avatars: "/avatars",
  badge: "/badge",
  buttons: "/buttons",
  images: "/images",
  videos: "/videos",

  // Charts
  lineChart: "/line-chart",
  barChart: "/bar-chart",

  //
  pos: "/pos",

  // Shop access --shop owner
  shop: "/shop",
  shopownerorders: "/shop/orders",
  shopownerorderstatus: "/shop/order/:orderID",

  shopownerproducts: "/shop/products/",
  shopownerproducthistory: "/shop/product/:productID",
  shopownerpos: "/shop/pos",

  // shop Order Request --manager
  shoprequests: "/shop/orders/request",
  managershopreports: "/shop-reports",

  //broker
  addbroker: "/add-broker",
  allbrokers: "/brokers",
  brokercommission: "/broker-commission/:invoiceId",
  brokerreport: "/broker-report",
  taxreport: "/tax-report",
};
