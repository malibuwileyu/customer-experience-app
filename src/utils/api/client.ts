/**
 * @fileoverview API client configuration and utilities
 * @module utils/api/client
 * @description
 * Configures and exports the base API client with interceptors
 * for authentication, error handling, and response transformation.
 */

import axios, { AxiosError, AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios';
import { ApiResponse } from '../../types/common';
import { AuthState, useAuthStore } from '../../stores/auth.store';
import { UIState, useUIStore } from '../../stores/ui.store';

/**
 * Creates an Axios instance with default configuration
 * 
 * @function createAPIClient
 * @returns {AxiosInstance} Configured Axios instance
 */
function createAPIClient(): AxiosInstance {
  const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor for auth headers
  client.interceptors.request.use(
    (config: AxiosRequestConfig) => {
      const token = (useAuthStore.getState() as AuthState).user?.session?.access_token;
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: Error) => Promise.reject(error)
  );

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response: AxiosResponse) => response.data,
    (error: AxiosError) => {
      const { addToast } = useUIStore.getState() as UIState & { addToast: UIState['addToast'] };
      
      // Handle different error scenarios
      if (error.response) {
        // Server responded with error
        const status = error.response.status;
        if (status === 401) {
          useAuthStore.getState().reset();
          addToast({
            type: 'error',
            message: 'Session expired. Please log in again.',
            duration: 5000,
          });
        } else if (status === 403) {
          addToast({
            type: 'error',
            message: 'You do not have permission to perform this action.',
            duration: 5000,
          });
        } else {
          addToast({
            type: 'error',
            message: 'An error occurred. Please try again.',
            duration: 5000,
          });
        }
      } else if (error.request) {
        // Request made but no response
        addToast({
          type: 'error',
          message: 'Network error. Please check your connection.',
          duration: 5000,
        });
      } else {
        // Request setup error
        addToast({
          type: 'error',
          message: 'An error occurred. Please try again.',
          duration: 5000,
        });
      }

      return Promise.reject(error);
    }
  );

  return client;
}

/**
 * API client instance
 * Pre-configured with interceptors for auth and error handling
 */
export const apiClient = createAPIClient();

/**
 * Makes a GET request to the API
 * 
 * @async
 * @function get
 * @template T - Type of the response data
 * @param {string} url - API endpoint URL
 * @param {AxiosRequestConfig} [config] - Additional Axios config
 * @returns {Promise<ApiResponse<T>>} API response
 */
export async function get<T>(url: string, config: AxiosRequestConfig = {}): Promise<ApiResponse<T>> {
  return apiClient.get(url, config);
}

/**
 * Makes a POST request to the API
 * 
 * @async
 * @function post
 * @template T - Type of the response data
 * @param {string} url - API endpoint URL
 * @param {any} data - Request payload
 * @param {AxiosRequestConfig} [config] - Additional Axios config
 * @returns {Promise<ApiResponse<T>>} API response
 */
export async function post<T>(url: string, data: unknown = {}, config: AxiosRequestConfig = {}): Promise<ApiResponse<T>> {
  return apiClient.post(url, data, config);
}

/**
 * Makes a PUT request to the API
 * 
 * @async
 * @function put
 * @template T - Type of the response data
 * @param {string} url - API endpoint URL
 * @param {any} data - Request payload
 * @param {AxiosRequestConfig} [config] - Additional Axios config
 * @returns {Promise<ApiResponse<T>>} API response
 */
export async function put<T>(url: string, data: unknown = {}, config: AxiosRequestConfig = {}): Promise<ApiResponse<T>> {
  return apiClient.put(url, data, config);
}

/**
 * Makes a DELETE request to the API
 * 
 * @async
 * @function del
 * @template T - Type of the response data
 * @param {string} url - API endpoint URL
 * @param {AxiosRequestConfig} [config] - Additional Axios config
 * @returns {Promise<ApiResponse<T>>} API response
 */
export async function del<T>(url: string, config: AxiosRequestConfig = {}): Promise<ApiResponse<T>> {
  return apiClient.delete(url, config);
} 