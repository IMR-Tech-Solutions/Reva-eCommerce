import { getAllPaginatedData } from "./getpaginateddata";
import api from "./baseapi";


// ==============================
// Get all products -- Admin
// ==============================
export const getallproductservice = () => {
  return getAllPaginatedData("admin/all-products/");
};


// ==============================
// Get all products which have stocks
// ==============================
export const stockaddedbyuserservice = () => {
  return getAllPaginatedData("user/stock/products/");
};


// ==============================
// Get particular user's products -- Admin
// ==============================
export const getalluserproductsservice = (userID: number) => {
  return getAllPaginatedData(`admin/user-products/${userID}/`);
};


// ==============================
// Add Product
// ==============================
export const addproductservice = async (productData: FormData) => {
  const response = await api.post("add-product/", productData);
  return response.data;
};


// ==============================
// Get current user's products
// ==============================
export const getmyproductservice = () => {
  return getAllPaginatedData("my-products/");
};


// ==============================
// Get current user's active products
// ==============================
export const getmyactiveproductservice = () => {
  return getAllPaginatedData("active/my-products/");
};


// ==============================
// Delete product
// ==============================
export const deleteproductservice = async (productID: number) => {
  const response = await api.delete(`delete-product/${productID}/`);
  return response.data;
};


// ==============================
// Get single product details
// ==============================
export const getsingleproductservice = async (productID: number) => {
  const response = await api.get(`product/${productID}/`);
  return response.data;
};


// ==============================
// Update product
// ==============================
export const updateproductservice = async (
  productID: number,
  updatedData: FormData
) => {
  const response = await api.put(`update-product/${productID}/`, updatedData);
  return response.data;
};


// ==============================
// Shop Products (for ecommerce pages)
// ==============================
export const getshopproductsservice = () => {
  return getAllPaginatedData("shop/products/");
};

// ==============================
// PUBLIC API (for ecommerce storefront)
// ==============================
export const getpublicproductsservice = () => {
  return getAllPaginatedData("public/products/");
};

export const getpublicproductsbycategoryservice = (slug: string) => {
  return getAllPaginatedData(`public/products/category/${slug}/`);
};