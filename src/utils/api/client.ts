/**
 * @fileoverview API client configuration and utilities
 * @module utils/api/client
 * @description
 * Configures and exports the base API client with interceptors
 * for authentication, error handling, and response transformation.
 */

import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse, AxiosRequestConfig } from 'axios';
import { ApiResponse } from '../../types/common';
import { useAuthStore, AuthStore } from '../../stores/auth.store';
import { useUIStore } from '../../stores/ui.store';

interface ErrorResponse {
  message?: string
  [key: string]: unknown
}

/**
 * Creates an API client with authentication and error handling
 * 
 * @returns Axios instance configured with interceptors
 */
export function createAPIClient() {
  const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor for auth headers
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const authStore = useAuthStore.getState() as AuthStore;
      
      if (authStore.session?.access_token) {
        config.headers.Authorization = `Bearer ${authStore.session.access_token}`;
      }
      
      return config;
    },
    (error: AxiosError) => {
      useUIStore.getState().actions.toast({
        title: 'Request Error',
        description: error.message,
        type: 'error'
      });
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError<ErrorResponse>) => {
      const { response } = error;
      
      if (response?.status === 401) {
        const authStore = useAuthStore.getState() as AuthStore;
        authStore.reset(); // Reset auth state on session expiry
        useUIStore.getState().actions.toast({
          title: 'Session Expired',
          description: 'Please sign in again',
          type: 'error'
        });
      } else {
        useUIStore.getState().actions.toast({
          title: 'Error',
          description: response?.data?.message || error.message,
          type: 'error'
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
export async function get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
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
export async function post<T>(url: string, data: unknown = {}, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
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
export async function put<T>(url: string, data: unknown = {}, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
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
export async function del<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
  return apiClient.delete(url, config);
}

export default createAPIClient(); 