export function measurePerformance(name: string, fn: Function) {
  const start = performance.now()
  const result = fn()
  const duration = performance.now() - start
  
  if (duration > 1000) {
    console.warn(`⚠️ Slow operation: ${name} took ${duration.toFixed(2)}ms`)
  }
  
  return result
}

export async function measureAsyncPerformance(name: string, fn: Function) {
  const start = performance.now()
  const result = await fn()
  const duration = performance.now() - start
  
  if (duration > 1000) {
    console.warn(`⚠️ Slow async operation: ${name} took ${duration.toFixed(2)}ms`)
  }
  
  return result
}
