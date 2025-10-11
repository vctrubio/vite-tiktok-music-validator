import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const ThemeContext = createContext(null)

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('app-theme') || 'default'
    } catch {
      return 'default'
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('app-theme', theme)
    } catch {}
  }, [theme])

  const toggleTheme = () => {
    setTheme((t) => (t === 'default' ? 'violet' : 'default'))
  }

  const choose = useMemo(() => {
    return (primaryClass, altClass) => (theme === 'default' ? primaryClass : altClass)
  }, [theme])

  const value = useMemo(() => ({ theme, toggleTheme, choose }), [theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
