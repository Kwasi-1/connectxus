import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { toast } from "sonner";
import { variables } from "@/utils/env";

const API_URL = import.meta.env.VITE_API_URL;

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData && config.headers) {
      delete config.headers["Content-Type"];
    }

    if (
      config.url &&
      (config.url.includes("/admin") || config.url.includes("/analytics"))
    ) {
      const spaceId = localStorage.getItem("admin-current-space-id");

      if (spaceId && spaceId !== "all" && spaceId !== "null" && config.url) {
        const url = new URL(config.url, API_URL);

        const hasSpaceIdInUrl = url.searchParams.has("space_id");
        const hasSpaceIdInParams = config.params && "space_id" in config.params;

        if (!hasSpaceIdInUrl && !hasSpaceIdInParams) {
          if (!config.params) {
            config.params = {};
          }
          config.params.space_id = spaceId;
        }
      }
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/users/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token } = response.data.data;

          setAccessToken(access_token);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
          }
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        clearTokens();
        window.location.href = "/auth/signin";
        toast.error("Session expired. Please log in again.");
        return Promise.reject(refreshError);
      }
    }

    handleApiError(error);
    return Promise.reject(error);
  },
);

const handleApiError = (error: AxiosError<any>) => {
  if (!error.response) {
    toast.error("Network error. Please check your connection.");
    return;
  }

  const status = error.response.status;
  const errorData = error.response.data;
  const url = error.config?.url || "";

  if (
    url.includes("/my-application") ||
    url.includes("/my-services") ||
    url.includes("/applications/check")
  ) {
    return;
  }

  let message =
    errorData?.error?.message || errorData?.message || errorData?.error || "";

  if (errorData?.error?.details) {
    message = `${message}: ${errorData.error.details}`;
  }

  switch (status) {
    case 400:
      toast.error(message || "Invalid request. Please check your input.");
      break;
    case 401:
      if (!error.config?.url?.includes("/users/refresh")) {
        toast.error(message || "Unauthorized. Please log in.");
      }
      break;
    case 403:
      toast.error(message || "Something went wrong");
      break;
    case 404:
      toast.error(message || "Resource not found.");
      break;
    case 409:
      toast.error(message || "Conflict. This action cannot be completed.");
      break;
    case 429:
      toast.error("Too many requests. Please try again later.");
      break;
    case 500:
    case 502:
    case 503:
      toast.error("Server error. Please try again later.");
      break;
    default:
      toast.error(message || "An error occurred. Please try again.");
  }
};

export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setAccessToken = (token: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const setRefreshToken = (token: string): void => {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

export const clearTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem("auth-user");
};

export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

export { apiClient, API_URL };
export default apiClient;
