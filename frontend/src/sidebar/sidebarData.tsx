import {
  BoxCubeIcon,
  GridIcon,
  ListIcon,
  GroupIcon,
  TaskIcon,
  // ChatIcon,
  DocsIcon,
  PlusIcon,
  // PlugInIcon,
  PieChartIcon,
} from "../icons";
import { NavItem } from "../types/types";
import { all_modules } from "../modules/modules";
import { all_routes } from "../Router/allroutes";

export const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/",
    module: all_modules.home,
  },
  {
    icon: <BoxCubeIcon />,
    name: "Shop",
    subItems: [
      {
        name: "Shop Orders",
        path: all_routes.shopownerorders,
        module: all_modules.shop,
      },
      {
        name: "Shop Products",
        path: all_routes.shopownerproducts,
        module: all_modules.shop,
      },
    ],
  },
  {
    icon: <BoxCubeIcon />,
    name: "Orders",
    subItems: [
      {
        name: "Order Request",
        path: all_routes.shoprequests,
        module: all_modules.shoprequests,
      },
      { name: "POS Orders", path: "/orders", module: all_modules.orders },
      {
        name: "Shop Orders",
        path: all_routes.shoporders,
        module: all_modules.shoprequests,
      },
    ],
  },
  {
    icon: <GroupIcon />,
    name: "CRM",
    subItems: [
      { name: "Products", path: "/products", module: all_modules.products },
      {
        name: "Categories",
        path: "/categories",
        module: all_modules.categories,
      },
      { name: "Customers", path: "/customers", module: all_modules.customers },
    ],
  },
];

export const management: NavItem[] = [
  {
    icon: <TaskIcon />,
    name: "Add Products",
    path: "/add-products",
    module: all_modules.addproducts,
  },
  {
    icon: <TaskIcon />,
    name: "Add Categories",
    path: "/add-categories",
    module: all_modules.addcategories,
  },
  {
    icon: <TaskIcon />,
    name: "Add Vendors",
    path: "/add-vendors",
    module: all_modules.addvendors,
  },
  {
    icon: <TaskIcon />,
    name: "Add Broker",
    path: all_routes.addbroker,
    module: all_modules.brokermanagement,
  },
];

export const othersItems: NavItem[] = [
  // {
  //   icon: <ChatIcon />,
  //   name: "Chat",
  //   path: "/chat",
  //   module: all_modules.chat,
  // },
];

export const stockItems: NavItem[] = [
  {
    icon: <PlusIcon />,
    name: "Add Stock",
    path: "/add-stock",
    module: all_modules.addstock,
  },
  {
    icon: <ListIcon />,
    name: "Manage Stock",
    path: "/manage-stock",
    module: all_modules.managestock,
  },
  // {
  //   icon: <PlugInIcon />,
  //   name: "Stock Alerts",
  //   path: "/stock-alerts",
  //   module: all_modules.stockalert,
  // },
  {
    icon: <DocsIcon />,
    name: "Purchase Invoice",
    path: "/purchase-inovice",
    module: all_modules.purchaseinvoice,
  },
];

export const reportItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Reports",
    subItems: [
      {
        name: "Sales Report",
        path: "/sales-report",
        module: all_modules.salesreport,
      },
      {
        name: "Purchase Report",
        path: "/purchase-report",
        module: all_modules.managerpurchasereport,
      },
      {
        name: "Inventory Report",
        path: "/inventory-report",
        module: all_modules.inventoryreport,
      },
      {
        name: "Shop Purchase Report",
        path: all_routes.shopreport,
        module: all_modules.shop,
      },
      {
        name: "Shop Report",
        path: all_routes.managershopreports,
        module: all_modules.shoprequests,
      },
      {
        name: "Tax Report",
        path: all_routes.taxreport,
        module: all_modules.taxreport,
      },
      {
        name: "Broker Report",
        path: all_routes.brokerreport,
        module: all_modules.brokerreport,
      },
    ],
  },
];

export const allSidebarSections = {
  navItems,
  management,
  stockItems,
  reportItems,
  othersItems,
};
