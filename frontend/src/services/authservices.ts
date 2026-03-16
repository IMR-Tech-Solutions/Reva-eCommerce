import api from "./baseapi";

export const loginService = async (credentials: any) => {
  const response = await api.post("login/", credentials);
  return response.data;
};

export const registerService = async (userData: any) => {
  const response = await api.post("register/", userData);
  return response.data;
};
