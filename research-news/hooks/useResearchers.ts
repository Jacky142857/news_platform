import { useState, useEffect } from 'react'

export const useResearchers = () => {
  const [researchers, setResearchers] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchResearchers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/researchers')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setResearchers(data)
      } else {
        console.error('API returned non-array data:', data)
        setResearchers([])
        setError('Invalid data format received')
      }
    } catch (error) {
      console.error('Error fetching researchers:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch researchers')
      setResearchers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResearchers()
  }, [])

  return { researchers, loading, error, refetch: fetchResearchers }
}