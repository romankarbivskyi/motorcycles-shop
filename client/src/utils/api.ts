import axios from "axios";

export const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use(
  (config) => {
    const authData = JSON.parse(localStorage.getItem("authData") || "{}");

    const token = authData?.token;

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("authData");

      window.location.href = "/auth/login";
    }

    return Promise.reject(error);
  },
);
