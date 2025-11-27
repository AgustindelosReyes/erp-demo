'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
  id: number
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  fetchUser: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('auth_token')
      const storedUser = localStorage.getItem('auth_user')

      if (storedToken && storedUser) {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
        // Verify token by fetching user
        try {
          const response = await fetch('http://localhost:8000/api/me', {
            headers: {
              'Authorization': `Bearer ${storedToken}`,
              'Accept': 'application/json',
            },
          })
          if (response.ok) {
            const userData = await response.json()
            setUser(userData)
            localStorage.setItem('auth_user', JSON.stringify(userData))
          } else {
            throw new Error()
          }
        } catch {
          // If fetch fails, logout
          setUser(null)
          setToken(null)
          localStorage.removeItem('auth_token')
          localStorage.removeItem('auth_user')
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    const response = await fetch('http://localhost:8000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Login failed')
    }

    const data = await response.json()
    setUser(data.user)
    setToken(data.token)

    localStorage.setItem('auth_token', data.token)
    localStorage.setItem('auth_user', JSON.stringify(data.user))
  }

  const fetchUser = async () => {
    if (!token) return

    const response = await fetch('http://localhost:8000/api/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    })

    if (response.ok) {
      const userData = await response.json()
      setUser(userData)
      localStorage.setItem('auth_user', JSON.stringify(userData))
    } else {
      // Token invalid, logout
      logout()
    }
  }

  const logout = async () => {
    if (token) {
      await fetch('http://localhost:8000/api/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
    }

    setUser(null)
    setToken(null)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, fetchUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}