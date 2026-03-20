import Cookies from "js-cookie";

export const setTokens = ({
  access,
  refresh,
}: {
  access: string;
  refresh: string;
}) => {
  Cookies.set("access", access, { expires: 1 });
  Cookies.set("refresh", refresh, { expires: 1 });
};

export const setAccessToken = (access: string) => {
  Cookies.set("access", access, { expires: 1 });
};

export const getToken = () => Cookies.get("access");
export const getRefreshToken = () => Cookies.get("refresh");

export const removeTokens = () => {
  Cookies.remove("access");
  Cookies.remove("refresh");
};

// --- ECOMMERCE SPECIFIC TOKENS ---

export const setEcommerceTokens = ({
  access,
  refresh,
}: {
  access: string;
  refresh: string;
}) => {
  Cookies.set("ecommerce_access", access, { expires: 1 });
  Cookies.set("ecommerce_refresh", refresh, { expires: 1 });
};

export const setEcommerceAccessToken = (access: string) => {
  Cookies.set("ecommerce_access", access, { expires: 1 });
};

export const getEcommerceToken = () => Cookies.get("ecommerce_access");
export const getEcommerceRefreshToken = () => Cookies.get("ecommerce_refresh");

export const removeEcommerceTokens = () => {
  Cookies.remove("ecommerce_access");
  Cookies.remove("ecommerce_refresh");
};
