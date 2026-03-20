export const ecommerceLinks = {
  ecommerceHome: "/",
  category: "/category",
  layoutcategory: "/category/:slug",
  EcommerceAboutPage: "/about",
  EcommerceShop: "/e-commerceshop",
  ProductDetail: "/e-commerceshop/:id",
  EcommerceContact: "/contact",
  EcomerceBlog: "/blogs",
  EcommerecSingleBlogPage: "/blog/:blogId",
  PrivacyPolicy: "/privacy",
  TermsAndConditions: "/terms",
  Shipping: "/shipping",
  Account: "/account",
  AccountOrder: "/account-orders",
  Cart: "/cart",
  Checkout: "/checkout",
  UserProfile: "/user-shop-profile",
};

// Helper function to check if a route belongs to the ecommerce side
export const isEcommerceRoute = (pathname: string): boolean => {
  // Check exact matches against defined ecommerce paths
  const routes = Object.values(ecommerceLinks);
  if (routes.includes(pathname)) return true;
  
  // Check dynamic or sub-routes common to ecommerce
  if (pathname.startsWith("/category/") || 
      pathname.startsWith("/e-commerceshop/") || 
      pathname.startsWith("/blog/") ||
      pathname === "/") {
    return true;
  }
  
  return false;
};

// Helper function to check if a route belongs to the admin side
export const isAdminRoute = (pathname: string): boolean => {
  return pathname.startsWith("/admin");
};
