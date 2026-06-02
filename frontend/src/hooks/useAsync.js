import { useState } from 'react'

export const useAsync = (asyncFunction) => {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const execute = async (...args) => {
    setLoading(true)
    setError(null)

    try {
      const result = await asyncFunction(...args)
      setData(result)
      return result
    } catch (nextError) {
      setError(nextError)
      throw nextError
    } finally {
      setLoading(false)
    }
  }

  return { data, error, loading, execute, setData }
}
