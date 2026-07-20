export function formatDate(date: Date | string) { 
  return new Date(date).toLocaleString() 
}

export function validateContainerNumber(str: string) {
  if (!str) return { valid: false, error: 'empty' }
  const clean = str.toUpperCase().trim().replace(/[^A-Z0-9]/g, '')
  const regex = /^[A-Z]{3,4}\d{7}$/
  if (regex.test(clean)) return { valid: true, normalized: clean }
  if (/^[A-Z]{4}\d{1,6}$/.test(clean)) return { valid: false, error: 'digits_short' }
  if (/^[A-Z]{4}$/.test(clean)) return { valid: false, error: 'no_digits' }
  return { valid: false, error: 'invalid_format' }
}

export function parseCargoNumber(str: string) {
  const match = String(str || '').match(/\d+/)
  return match ? parseInt(match[0]) : 0
}

export const getColor = (isDark: boolean, light: string, dark: string) => isDark ? dark : light
