import React, { useState, useEffect, createContext, useContext } from 'react'

const ThemeContext = createContext()

export const ThemeProvider = ({ children, forcedTheme = null }) => {
  const [currentTheme, setCurrentTheme] = useState('light')

  // Initialize theme on mount
  useEffect(() => {
    if (forcedTheme) {
      setCurrentTheme(forcedTheme)
      document.documentElement.setAttribute('data-theme', forcedTheme)
    } else {
      // Check for saved theme preference or default to light
      const savedTheme = localStorage.getItem('map-theme') || 'light'
      setCurrentTheme(savedTheme)
      
      // Apply the theme
      document.documentElement.setAttribute('data-theme', savedTheme)
    }
  }, [forcedTheme])

  const toggleTheme = () => {
    // Don't allow theme toggle if forced theme is set
    if (forcedTheme) return;
    
    const newTheme = currentTheme === 'light' ? 'dark' : 'light'
    setCurrentTheme(newTheme)
    
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', newTheme)
    
    // Save preference
    localStorage.setItem('map-theme', newTheme)
  }

  return (
    <ThemeContext.Provider value={{ currentTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}