import { ReactNode, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser, clearUser, setPermissions } from "../redux/userSlice";
import { getToken, getAdminToken, getEcommerceToken } from "../authentication/auth";
import { toast } from "react-toastify";
import api from "../services/baseapi";
import { getusermoduleservice } from "../services/gettingmoduleservice";
import { isEcommerceRoute, isAdminRoute } from "../ecommerce-pages/ecommerceRoutes";

const AuthLoader = ({ children }: { children: ReactNode }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const rehydrateUser = async () => {
      const currentPath = window.location.pathname;
      const isEcommerce = isEcommerceRoute(currentPath);
      const isAdmin = isAdminRoute(currentPath) || (currentPath === "/dashboard" && getAdminToken());

      let token: string | undefined;
      if (isEcommerce) {
        token = getEcommerceToken();
      } else if (isAdmin) {
        token = getAdminToken();
      } else {
        token = getToken();
      }

      // Fallback if specific token missing
      if (!token) {
        token = getToken() || getAdminToken() || getEcommerceToken();
      }

      if (!token) {
        dispatch(clearUser());
        return;
      }

      try {
        const res = await api.get("me/");
        dispatch(setUser(res.data));

        if (!isEcommerce && res.data.role_id) {
          const perms = await getusermoduleservice(res.data.role_id);
          dispatch(setPermissions(perms));
        } else {
          dispatch(setPermissions(null));
        }
      } catch (err: any) {
        console.error("Token expired or invalid", err);
        // Only show toast if we aren't already on an unauthenticated route
        if (currentPath !== '/admin/login' && currentPath !== '/account' && currentPath !== '/admin/signup') {
            toast.error("Session expired. Please login again.");
        }
        dispatch(clearUser());
      }
    };

    rehydrateUser();
  }, [dispatch]);

  return children;
};

export default AuthLoader;
