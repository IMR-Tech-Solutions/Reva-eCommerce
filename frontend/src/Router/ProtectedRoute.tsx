import { getToken } from "../authentication/auth";
import { Navigate } from "react-router";
import { Outlet } from "react-router";

const ProtectedRoute = () => {
  const token = getToken();
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
