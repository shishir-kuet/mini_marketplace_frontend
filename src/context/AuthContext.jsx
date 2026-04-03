import { createContext, useContext, useState, useEffect } from 'react'
import { login as apiLogin, register as apiRegister } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)      // { username, role }
  const [loading, setLoading] = useState(true)

  // Restore session from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    const saved  = localStorage.getItem('user')
    if (token && saved) {
      try { setUser(JSON.parse(saved)) } catch { /* ignore */ }
    }
    setLoading(false)
  }, [])

  /**
   * Login — stores token under key "token" and user info
   */
  async function login(username, password) {
    const res = await apiLogin({ username, password })
    const { token, username: uname, role } = res.data
    localStorage.setItem('token', token)
    const userObj = { username: uname, role }
    localStorage.setItem('user', JSON.stringify(userObj))
    setUser(userObj)
    return userObj
  }

  /**
   * Register — returns data but does NOT log in automatically
   */
  async function register(username, email, password) {
    const res = await apiRegister({ username, email, password })
    return res.data
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const isAdmin = user?.role === 'admin'
  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
