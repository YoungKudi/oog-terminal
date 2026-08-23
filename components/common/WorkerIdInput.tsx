"use client"
import React, { useState, useEffect, useRef } from 'react'
import { getColor } from '@/lib/utils'

interface WorkerIdInputProps {
  value: string
  onChange: (value: string) => void
  onValidChange?: (isValid: boolean) => void
  placeholder?: string
  isDarkMode?: boolean
  required?: boolean
  label?: string
  showValidation?: boolean
}

export default function WorkerIdInput({
  value,
  onChange,
  onValidChange,
  placeholder = "7 digits OR 2 letters+6 digits",
  isDarkMode = false,
  required = true,
  label = "Worker ID",
  showValidation = true
}: WorkerIdInputProps) {
  const [validation, setValidation] = useState<{ valid: boolean; type: 'staff' | 'casual' | 'invalid' }>({
    valid: false,
    type: 'invalid'
  })
  const [touched, setTouched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Validate worker ID
  const validateWorkerId = (id: string): { valid: boolean; type: 'staff' | 'casual' | 'invalid' } => {
    const clean = id.toUpperCase().trim()
    const staffRegex = /^\d{7}$/
    const casualRegex = /^[A-Z]{2}\d{6}$/
    
    if (staffRegex.test(clean)) {
      return { valid: true, type: 'staff' }
    }
    if (casualRegex.test(clean)) {
      return { valid: true, type: 'casual' }
    }
    return { valid: false, type: 'invalid' }
  }

  // Handle input change with masking
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value
    
    // Remove any non-alphanumeric characters
    input = input.replace(/[^a-zA-Z0-9]/g, '')
    
    // Convert to uppercase
    input = input.toUpperCase()
    
    // Enforce max length of 8 characters (2 letters + 6 digits OR 7 digits)
    if (input.length > 8) {
      input = input.slice(0, 8)
    }
    
    // If it starts with a number, it must be 7 digits (staff)
    // If it starts with a letter, it must be 2 letters + 6 digits (casual)
    const firstChar = input.charAt(0)
    if (firstChar && /\d/.test(firstChar)) {
      // Started with number - only allow numbers
      if (!/^\d*$/.test(input)) {
        input = input.replace(/[^0-9]/g, '')
      }
      // Enforce max 7 digits for staff
      if (input.length > 7) {
        input = input.slice(0, 7)
      }
    } else if (firstChar && /[A-Z]/.test(firstChar)) {
      // Started with letter - enforce 2 letters + 6 digits
      const letters = input.replace(/[0-9]/g, '')
      const numbers = input.replace(/[A-Z]/g, '')
      
      if (letters.length > 2) {
        // Only allow 2 letters
        input = letters.slice(0, 2) + numbers
      }
      if (numbers.length > 6) {
        input = letters.slice(0, 2) + numbers.slice(0, 6)
      }
    }
    
    const result = validateWorkerId(input)
    setValidation(result)
    if (onValidChange) {
      onValidChange(result.valid)
    }
    
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
  if (touched && value.length > 0) {
    if (validation.valid) {
      borderColorStyle = '#10b981'
      borderWidth = '2px'
    } else {
      borderColorStyle = '#dc2626'
      borderWidth = '2px'
    }
  }

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
        </label>
      )}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        required={required}
        style={{
          width: '100%',
          padding: '10px 12px',
          border: `${borderWidth} solid ${borderColorStyle}`,
          borderRadius: '8px',
          fontSize: '0.9rem',
          background: inputBg,
          color: inputText,
          outline: 'none',
          transition: 'border-color 0.2s, border-width 0.2s'
        }}
      />
      {showValidation && touched && value.length > 0 && (
        <div style={{ 
          fontSize: '0.6rem', 
          color: validation.valid ? '#10b981' : '#dc2626',
          marginTop: '4px'
        }}>
          {validation.valid ? (
            validation.type === 'staff' ? '✅ Staff ID (7 digits)' : '✅ Casual ID (2 letters + 6 digits)'
          ) : (
            '❌ Invalid format. Use 7 digits or 2 letters + 6 digits'
          )}
        </div>
      )}
      <div style={{ 
        fontSize: '0.55rem', 
        color: mutedColor, 
        marginTop: '4px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '4px'
      }}>
        <span style={{ 
          display: 'inline-block', 
          padding: '1px 8px', 
          borderRadius: '12px', 
          fontSize: '0.5rem', 
          fontWeight: '600',
          background: '#dbeafe',
          color: '#1e40af'
        }}>
          Staff: 7 digits
        </span>
        <span style={{ 
          display: 'inline-block', 
          padding: '1px 8px', 
          borderRadius: '12px', 
          fontSize: '0.5rem', 
          fontWeight: '600',
          background: '#fef3c7',
          color: '#92400e'
        }}>
          Casual: 2 letters + 6 digits
        </span>
      </div>
    </div>
  )
}
