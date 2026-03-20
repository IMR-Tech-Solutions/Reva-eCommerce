import { getToken, getAdminToken } from "../authentication/auth";
import { Navigate, useLocation } from "react-router";
import { Outlet } from "react-router";
import { isAdminRoute } from "../ecommerce-pages/ecommerceRoutes";

const ProtectedRoute = () => {
  const location = useLocation();
  const isAdmin = isAdminRoute(location.pathname);

  // For specifically /admin/* routes, require admin token.
  // For shared routes like /dashboard, accept either token.
  const token = isAdmin ? getAdminToken() : (getToken() || getAdminToken());

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
