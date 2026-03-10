'use client'
// src/lib/auth-context.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { SIGN_IN, SIGN_UP, GET_ME } from '@/graphql/operations'

interface User {
  id: string
  name: string
  email: string
  image?: string
  role: string
}

interface AuthContextValue {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue>({} as AuthContextValue)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const { refetch } = useQuery(GET_ME, {
    skip: true,
    onCompleted: (data) => { if (data?.me) setUser(data.me) },
  })

  const [signInMutation] = useMutation(SIGN_IN)
  const [signUpMutation] = useMutation(SIGN_UP)

  useEffect(() => {
    const token = localStorage.getItem('pf_token')
    if (token) {
      refetch().then(({ data }) => {
        if (data?.me) setUser(data.me)
        setLoading(false)
      }).catch(() => {
        localStorage.removeItem('pf_token')
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const { data } = await signInMutation({ variables: { input: { email, password } } })
    localStorage.setItem('pf_token', data.signIn.token)
    setUser(data.signIn.user)
  }, [signInMutation])

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const { data } = await signUpMutation({ variables: { input: { name, email, password } } })
    localStorage.setItem('pf_token', data.signUp.token)
    setUser(data.signUp.user)
  }, [signUpMutation])

  const signOut = useCallback(() => {
    localStorage.removeItem('pf_token')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
