import React, { useEffect, useState } from 'react'

interface ResearcherFilterProps {
  selectedResearcher: string
  onResearcherChange: (researcher: string) => void
  showRead: boolean
  onShowReadChange: (showRead: boolean) => void
  showImportant: boolean
  onShowImportantChange: (showImportant: boolean) => void
}

export default function ResearcherFilter({
  selectedResearcher,
  onResearcherChange,
  showRead,
  onShowReadChange,
  showImportant,
  onShowImportantChange
}: ResearcherFilterProps) {
  const [researchers, setResearchers] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchResearchers()
  }, [])

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

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <h2 className="text-lg font-semibold mb-4">Filters</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="researcher" className="block text-sm font-medium text-gray-700 mb-1">
            Researcher
          </label>
          <select
            id="researcher"
            value={selectedResearcher}
            onChange={(e) => onResearcherChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            <option value="all">All Researchers</option>
            {loading ? (
              <option disabled>Loading researchers...</option>
            ) : error ? (
              <option disabled>Error loading researchers</option>
            ) : (
              researchers.map((researcher) => (
                <option key={researcher} value={researcher}>
                  {researcher}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="showRead"
            checked={showRead}
            onChange={(e) => onShowReadChange(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="showRead" className="text-sm font-medium text-gray-700">
            Show Read News
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="showImportant"
            checked={showImportant}
            onChange={(e) => onShowImportantChange(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="showImportant" className="text-sm font-medium text-gray-700">
            Important Only
          </label>
        </div>
      </div>
    </div>
  )
}