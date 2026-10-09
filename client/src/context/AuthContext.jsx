import { createContext, useContext, useState } from 'react'
import { getCurrentUser, login, logout, register, getMe } from '../api/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getCurrentUser())

  async function signIn(identifier, password) {
    const result = await login(identifier, password)

    if (result.ok) {
      setUser(result.user)
    }

    return result
  }

  async function createAccount(data) {
    const result = await register(data)

    if (result.ok) {
      setUser(result.user)
    }

    return result
  }

  function signOut() {
    logout()
    setUser(null)
  }

  async function refreshUser() {
    try {
      const nextUser = await getMe()
      setUser(nextUser)
      return nextUser
    } catch {
      signOut()
      return null
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn,
        register: createAccount,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
