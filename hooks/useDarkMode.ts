import { useState, useEffect } from 'react'

export function useDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const dark = localStorage.getItem('oog_dark_mode') === 'true'
    setIsDarkMode(dark)
    if (dark) document.body.classList.add('dark-mode')
  }, [])

  const toggleDarkMode = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    document.body.classList.toggle('dark-mode', newMode)
    localStorage.setItem('oog_dark_mode', String(newMode))
  }

  return { isDarkMode, toggleDarkMode }
}
