import { useState, useEffect } from 'react'

export const useQueries = () => {
  const [queries, setQueries] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchQueries = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/queries')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (Array.isArray(data)) {
        const uniqueQueries = [...new Set(data)].sort()
        setQueries(uniqueQueries)
      } else {
        console.error('API returned non-array data:', data)
        setQueries([])
        setError('Invalid data format received')
      }
    } catch (error) {
      console.error('Error fetching queries:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch queries')
      setQueries([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQueries()
  }, [])

  return { queries, loading, error }
}