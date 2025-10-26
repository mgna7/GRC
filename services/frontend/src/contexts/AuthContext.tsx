import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react'
import { authAPI } from '../services/api'

interface User {
  id: string
  email: string
  full_name?: string
  role?: string
  organization_id?: string
  is_active?: boolean
  is_verified?: boolean
  created_at?: string
  last_login_at?: string
}

interface RegisterPayload {
  email: string
  password: string
  firstName: string
  lastName: string
  organizationName: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const syncAuthState = (accessToken: string, userData: User) => {
    setToken(accessToken)
    setUser(userData)
    localStorage.setItem('token', accessToken)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const clearAuthState = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const login = async (email: string, password: string) => {
    try {
      const { access_token, user: userData } = await authAPI.login(email, password)
      if (!access_token || !userData) {
        throw new Error('Invalid login response')
      }
      syncAuthState(access_token, userData)
    } catch (error) {
      clearAuthState()
      throw error
    }
  }

  const register = async (payload: RegisterPayload) => {
    try {
      await authAPI.register({
        email: payload.email,
        password: payload.password,
        organization_name: payload.organizationName,
        first_name: payload.firstName,
        last_name: payload.lastName,
      })
      await login(payload.email, payload.password)
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    clearAuthState()
  }

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!token,
    isLoading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
