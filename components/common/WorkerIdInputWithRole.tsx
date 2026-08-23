"use client"
import React, { useState, useEffect, useRef } from 'react'
import { getColor } from '@/lib/utils'

interface WorkerIdInputWithRoleProps {
  value: string
  onChange: (value: string) => void
  role: 'staff' | 'casual' | null
  placeholder?: string
  isDarkMode?: boolean
  required?: boolean
  label?: string
  showValidation?: boolean
}

export default function WorkerIdInputWithRole({
  value,
  onChange,
  role,
  placeholder = "Enter Worker ID",
  isDarkMode = false,
  required = true,
  label = "Worker ID",
  showValidation = true
}: WorkerIdInputWithRoleProps) {
  const [validation, setValidation] = useState<{ valid: boolean; message: string }>({
    valid: false,
    message: ''
  })
  const [touched, setTouched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Validate based on role
  const validateWorkerId = (id: string, roleType: 'staff' | 'casual' | null): { valid: boolean; message: string } => {
    const clean = id.toUpperCase().trim()
    
    if (!roleType) {
      return { valid: false, message: 'Please select a worker type first' }
    }
    
    if (!clean) {
      return { valid: false, message: 'Please enter Worker ID' }
    }
    
    if (roleType === 'staff') {
      const staffRegex = /^\d{7}$/
      if (staffRegex.test(clean)) {
        return { valid: true, message: '✅ Valid Staff ID' }
      }
      return { valid: false, message: '❌ Staff ID must be exactly 7 digits' }
    }
    
    if (roleType === 'casual') {
      const casualRegex = /^[A-Z]{2}\d{6}$/
      if (casualRegex.test(clean)) {
        return { valid: true, message: '✅ Valid Casual ID' }
      }
      return { valid: false, message: '❌ Casual ID must be 2 letters + 6 digits' }
    }
    
    return { valid: false, message: 'Invalid worker type' }
  }

  // Handle input change with masking based on role
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value
    
    // Remove any non-alphanumeric characters
    input = input.replace(/[^a-zA-Z0-9]/g, '')
    
    // Convert to uppercase
    input = input.toUpperCase()
    
    // Apply role-specific masking
    if (role === 'staff') {
      // Only allow numbers, max 7 digits
      input = input.replace(/[^0-9]/g, '')
      if (input.length > 7) {
        input = input.slice(0, 7)
      }
    } else if (role === 'casual') {
      // Allow 2 letters + 6 digits
      const letters = input.replace(/[0-9]/g, '')
      const numbers = input.replace(/[A-Z]/g, '')
      
      // Limit letters to 2
      const limitedLetters = letters.slice(0, 2)
      // Limit numbers to 6
      const limitedNumbers = numbers.slice(0, 6)
      
      input = limitedLetters + limitedNumbers
      
      // If we have letters and numbers, they must be in correct order
      // Letters first, then numbers
      if (input.length > 2) {
        const hasLetters = input.slice(0, 2).match(/[A-Z]/)
        const hasNumbers = input.slice(2).match(/[0-9]/)
        if (!hasLetters || !hasNumbers) {
          // Re-order: letters first, then numbers
          const allLetters = input.replace(/[0-9]/g, '').slice(0, 2)
          const allNumbers = input.replace(/[A-Z]/g, '').slice(0, 6)
          input = allLetters + allNumbers
        }
      }
    }
    
    const result = validateWorkerId(input, role)
    setValidation(result)
    onChange(input)
  }

  const handleBlur = () => {
    setTouched(true)
  }

  const handleFocus = () => {
    setTouched(false)
  }

  const textColor = getColor(isDarkMode, '#1e293b', '#e2e8f0')
  const mutedColor = getColor(isDarkMode, '#64748b', '#94a3b8')
  const borderColor = getColor(isDarkMode, '#d1d5db', '#475569')
  const inputBg = getColor(isDarkMode, 'white', '#0a0e17')
  const inputText = getColor(isDarkMode, '#1e293b', '#e2e8f0')

  // Determine border color based on validation
  let borderColorStyle = borderColor
  let borderWidth = '1px'
  if (touched && value.length > 0 && role) {
    if (validation.valid) {
      borderColorStyle = '#10b981'
      borderWidth = '2px'
    } else {
      borderColorStyle = '#dc2626'
      borderWidth = '2px'
    }
  }

  const isDisabled = !role

  return (
    <div style={{ marginBottom: '12px' }}>
      {label && (
        <label style={{ 
          display: 'block', 
          marginBottom: '4px', 
          fontWeight: '500', 
          fontSize: '0.75rem', 
          color: '#4b5563'
        }}>
          {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
          {role && (
            <span style={{ 
              fontSize: '0.55rem', 
              color: mutedColor, 
              marginLeft: '8px',
              fontWeight: '400'
            }}>
              ({role === 'staff' ? '7 digits' : '2 letters + 6 digits'})
            </span>
          )}
        </label>
      )}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={isDisabled ? "Select worker type first" : placeholder}
        required={required}
        disabled={isDisabled}
        style={{
          width: '100%',
          padding: '10px 12px',
          border: `${borderWidth} solid ${borderColorStyle}`,
          borderRadius: '8px',
          fontSize: '0.9rem',
          background: isDisabled ? getColor(isDarkMode, '#f1f5f9', '#1e293b') : inputBg,
          color: isDisabled ? mutedColor : inputText,
          outline: 'none',
          transition: 'border-color 0.2s, border-width 0.2s',
          opacity: isDisabled ? 0.6 : 1,
          cursor: isDisabled ? 'not-allowed' : 'text'
        }}
      />
      {showValidation && touched && value.length > 0 && role && (
        <div style={{ 
          fontSize: '0.65rem', 
          color: validation.valid ? '#10b981' : '#dc2626',
          marginTop: '4px'
        }}>
          {validation.message}
        </div>
      )}
      {role && (
        <div style={{ 
          fontSize: '0.5rem', 
          color: mutedColor, 
          marginTop: '4px',
          display: 'flex',
          gap: '4px',
          flexWrap: 'wrap'
        }}>
          <span>Format: {role === 'staff' ? '1234567' : 'AB123456'}</span>
          <span>•</span>
          <span>Length: {role === 'staff' ? '7 digits' : '2 letters + 6 digits'}</span>
        </div>
      )}
    </div>
  )
}
