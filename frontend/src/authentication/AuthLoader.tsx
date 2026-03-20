import { ReactNode, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser, clearUser, setPermissions } from "../redux/userSlice";
import { getToken, getEcommerceToken } from "../authentication/auth";
import { toast } from "react-toastify";
import api from "../services/baseapi";
import { getusermoduleservice } from "../services/gettingmoduleservice";
import { isEcommerceRoute } from "../ecommerce-pages/ecommerceRoutes";

const AuthLoader = ({ children }: { children: ReactNode }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const rehydrateUser = async () => {
      const currentPath = window.location.pathname;
      const isEcommerce = isEcommerceRoute(currentPath);
      const token = isEcommerce ? getEcommerceToken() : getToken();

      if (!token) {
        dispatch(clearUser());
        return;
      }

      try {
        const res = await api.get("me/");
        dispatch(setUser(res.data));

        // Admin permissions logic
        if (!isEcommerce && res.data.role_id) {
          const perms = await getusermoduleservice(res.data.role_id);
          dispatch(setPermissions(perms));
        } else {
          dispatch(setPermissions(null));
        }
      } catch (err: any) {
        console.error("Token expired or invalid", err);
        toast.error("Session expired. Please login again.");
        dispatch(clearUser());
      }
    };

    // Run initially
    rehydrateUser();

    // Listen to pushState/replaceState/popstate for SPA navigation if needed
    // However, typical hard page reloads between admin/ecommerce will catch it here.
  }, [dispatch]);

  return children;
};

export default AuthLoader;
