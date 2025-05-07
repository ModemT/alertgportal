import { ref } from 'vue'
import { useRuntimeConfig } from '#app'

interface User {
  id: string
  partner_id: string
  username: string
  email: string
  is_active: boolean
  is_admin: boolean
  created_at?: string
  updated_at?: string
}

export const useAuth = () => {
  const user = ref<User | null>(null)
  const partnerId = ref<string | null>(null)
  const isAuthenticated = ref(false)
  const isSessionExpired = ref(false)

  const setUser = (userData: User) => {
    user.value = userData
    partnerId.value = userData.partner_id
    isAuthenticated.value = true
    isSessionExpired.value = false
  }

  const clearUser = () => {
    user.value = null
    partnerId.value = null
    isAuthenticated.value = false
  }

  const login = async (username: string, password: string) => {
    const config = useRuntimeConfig()
    try {
      const response = await fetch(`${config.public.apiBase}/users/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.detail || 'Invalid credentials')
      }

      if (!data.access_token) {
        throw new Error('No access token received')
      }

      localStorage.setItem('token', data.access_token)
      setUser(data)
      return data
    } catch (err) {
      clearUser()
      localStorage.removeItem('token')
      throw err
    }
  }

  const register = async (username: string, email: string, password: string, partner_id: string) => {
    const config = useRuntimeConfig()
    try {
      const response = await fetch(`${config.public.apiBase}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-partner-id': partner_id,
        },
        body: JSON.stringify({ username, email, password }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.detail || 'Registration failed')
      }

      if (!data.access_token) {
        throw new Error('No access token received')
      }

      localStorage.setItem('token', data.access_token)
      setUser(data)
      return data
    } catch (err) {
      clearUser()
      localStorage.removeItem('token')
      throw err
    }
  }

  const logout = () => {
    clearUser()
    localStorage.removeItem('token')
  }

  const checkAuth = async () => {
    if (!process.client) return false
    
    const token = localStorage.getItem('token')
    if (!token) {
      clearUser()
      return false
    }

    try {
      const config = useRuntimeConfig()
      const response = await fetch(`${config.public.apiBase}/users/me`, {
        headers: {
          'access-token': token
        },
      })

      if (!response.ok) {
        if (isAuthenticated.value) {
          isSessionExpired.value = true
        }
        throw new Error('Not authenticated')
      }

      const data = await response.json()
      setUser(data)
      return true
    } catch (error) {
      clearUser()
      localStorage.removeItem('token')
      return false
    }
  }

  const initializeAuth = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      clearUser()
      return false
    }

    try {
      const config = useRuntimeConfig()
      const response = await fetch(`${config.public.apiBase}/users/me`, {
        headers: {
          'access-token': `${token}`,
        },
      })

      if (!response.ok) {
        if (isAuthenticated.value) {
          isSessionExpired.value = true
        }
        clearUser()
        localStorage.removeItem('token')
        return false
      }

      const data = await response.json()
      setUser(data)
      return true
    } catch (error) {
      console.error('Auth initialization error:', error)
      clearUser()
      localStorage.removeItem('token')
      return false
    }
  }

  const updateUser = async (userData: Partial<User>) => {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Not authenticated')
    }

    try {
      const config = useRuntimeConfig()
      const response = await fetch(`${config.public.apiBase}/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'access-token': token
        },
        body: JSON.stringify(userData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || 'Failed to update user')
      }

      const data = await response.json()
      setUser(data)
      return data
    } catch (error) {
      throw error
    }
  }

  return {
    user,
    partnerId,
    isAuthenticated,
    isSessionExpired,
    login,
    register,
    logout,
    checkAuth,
    initializeAuth,
    updateUser,
  }
} 