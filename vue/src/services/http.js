import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

/**
 * Axios instance
 */
const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

/**
 * Automatically inject token on every request
 */
http.interceptors.request.use((config) => {
  const authStore = useAuthStore()

  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }

  return config
})

/**
 * Unified API request wrapper
 *
 * @param {Object} options
 * @param {'get'|'post'|'put'|'patch'|'delete'} options.method
 * @param {string} options.url
 * @param {Object|null} options.data
 * @param {Object|null} options.params
 */
export async function apiRequest({
  method,
  url,
  data = null,
  params = null,
}) {
  try {
    const response = await http.request({
      method,
      url,
      data,
      params,
    })

    // Laravel apiResponse payload
    const payload = response.data
    
    return {
      ok: payload.ok,
      data: payload.data,
      message: payload.message,
      errors: payload.errors,
      status: response.status,
    }

  } catch (error) {
    // Axios error with response
    if (error.response) {
      return {
        ok: false,
        data: null,
        message: error.response.data?.message ?? 'Request failed',
        errors: error.response.data?.errors ?? null,
        status: error.response.status,
      }
    }

    // Network / timeout / unknown error
    return {
      ok: false,
      data: null,
      message: 'Network error',
      errors: null,
      status: 0,
    }
  }
}

export default http