import { useRef, useCallback } from 'react'

export function useToast() {
  const toastStackRef = useRef(null)

  const showToast = useCallback((msg: string) => {
    let container = toastStackRef.current
    if (!container) {
      container = document.createElement('div')
      container.className = 'toast-stack'
      document.body.appendChild(container)
      toastStackRef.current = container
    }
    const toast = document.createElement('div')
    toast.className = 'toast-item'
    toast.textContent = msg
    container.appendChild(toast)
    setTimeout(() => toast.remove(), 3000)
  }, [])

  return { showToast }
}
