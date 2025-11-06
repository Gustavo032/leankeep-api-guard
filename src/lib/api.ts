import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { useSession } from '@/store/useSession';
import { logger } from './logger';

// Create axios instance for Auth API
export const authApi: AxiosInstance = axios.create();

// Create axios instance for Main API
export const mainApi: AxiosInstance = axios.create();

// Request interceptor to inject token and log requests
[authApi, mainApi].forEach(api => {
  api.interceptors.request.use(
    (config) => {
      const { token, authHost, apiHost } = useSession.getState();

      // Set baseURL based on which API instance
      if (api === authApi) {
        config.baseURL = authHost;
      } else {
        config.baseURL = apiHost;
      }

      // Inject token if available
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Log request (with redaction)
      logger.request(
        config.method || 'GET',
        `${config.baseURL}${config.url}`,
        config.headers as Record<string, any>,
        config.data
      );

      return config;
    },
    (error) => {
      logger.error('Request', 'interceptor', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor to log responses
  api.interceptors.response.use(
    (response) => {
      logger.response(
        response.config.method || 'GET',
        `${response.config.baseURL}${response.config.url}`,
        response.status,
        response.data
      );
      return response;
    },
    (error) => {
      if (error.response) {
        logger.error(
          error.config?.method || 'GET',
          `${error.config?.baseURL}${error.config?.url}`,
          error
        );
      }
      return Promise.reject(error);
    }
  );
});

// Helper for form-urlencoded POST (for /v1/auth)
export async function postFormUrlEncoded(url: string, data: Record<string, any>) {
  const formData = new URLSearchParams();
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, String(value));
  });

  return authApi.post(url, formData.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
}

// Helper for JSON POST
export async function postJson(api: AxiosInstance, url: string, data: any, config?: AxiosRequestConfig) {
  return api.post(url, data, {
    ...config,
    headers: {
      'Content-Type': 'application/json',
      ...config?.headers,
    },
  });
}

// Helper for GET
export async function get(api: AxiosInstance, url: string, config?: AxiosRequestConfig) {
  return api.get(url, config);
}

// Helper for PUT
export async function put(api: AxiosInstance, url: string, data: any, config?: AxiosRequestConfig) {
  return api.put(url, data, {
    ...config,
    headers: {
      'Content-Type': 'application/json',
      ...config?.headers,
    },
  });
}
