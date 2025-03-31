import { useRuntimeConfig } from '#app'

export function useApi() {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase as string

  const getHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      'accept': 'application/json',
      ...(token ? { 'access-token': token } : {})
    }
  }

  const get = async (endpoint: string, options: RequestInit = {}) => {
    try {

      const response = await fetch(`${apiBase}${endpoint}`, {
        ...options,
        method: 'GET',
        headers: {
          ...getHeaders(),
          ...options.headers
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'API request failed')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('API GET Error:', error)
      throw error
    }
  }

  const post = async (endpoint: string, data: any, options: RequestInit = {}) => {
    try {
      const response = await fetch(`${apiBase}${endpoint}`, {
        ...options,
        method: 'POST',
        headers: {
          ...getHeaders(),
          ...options.headers
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'API request failed')
      }

      return await response.json()
    } catch (error) {
      console.error('API POST Error:', error)
      throw error
    }
  }

  const patch = async (endpoint: string, data: any, options: RequestInit = {}) => {
    try {
      const response = await fetch(`${apiBase}${endpoint}`, {
        ...options,
        method: 'PATCH',
        headers: {
          ...getHeaders(),
          ...options.headers
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'API request failed')
      }

      return await response.json()
    } catch (error) {
      console.error('API PATCH Error:', error)
      throw error
    }
  }

  const del = async (endpoint: string, options: RequestInit = {}) => {
    try {
      const response = await fetch(`${apiBase}${endpoint}`, {
        ...options,
        method: 'DELETE',
        headers: {
          ...getHeaders(),
          ...options.headers
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'API request failed')
      }

      return await response.json()
    } catch (error) {
      console.error('API DELETE Error:', error)
      throw error
    }
  }

  return {
    get,
    post,
    patch,
    del,
    getCurrentUser: async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No token found')
      }
      return get('/users/me', {
        headers: {
          'access-token': token
        }
      })
    }
  }
} 