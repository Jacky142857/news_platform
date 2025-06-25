import React, { useEffect, useState, useRef } from 'react'

import { useResearchers } from '@/hooks/useResearchers'
import { useQueries } from '@/hooks/useQueries'
import { getPastFiveDays, formatDate } from '@/utils/dateUtils'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  FilterIcon,
  UserIcon,
  SearchIcon,
  XIcon,
  CalendarIcon,
  EyeIcon,
  StarIcon
} from '@/components/ui/Icons'
interface ResearcherFilterProps {
  selectedResearcher: string
  onResearcherChange: (researcher: string) => void
  showRead: boolean
  onShowReadChange: (showRead: boolean) => void
  showImportant: boolean
  onShowImportantChange: (showImportant: boolean) => void
  selectedDate: string 
  onSelectedDateChange: (date: string) => void
  selectedQuery: string
  onQueryChange: (query: string) => void
}

export default function ResearcherFilter({
  selectedResearcher,
  onResearcherChange,
  showRead,
  onShowReadChange,
  showImportant,
  onShowImportantChange,
  selectedDate,
  onSelectedDateChange,
  selectedQuery,
  onQueryChange
}: ResearcherFilterProps) {
  const { researchers, loading: researchersLoading, error: researchersError } = useResearchers()
  const { queries, loading: queriesLoading, error: queriesError } = useQueries()
  const [isHidden, setIsHidden] = useState(false)
  const [showQueryDropdown, setShowQueryDropdown] = useState(false)
  const [filteredQueries, setFilteredQueries] = useState<string[]>([])
  const queryInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [queryInputValue, setQueryInputValue] = useState(selectedQuery)


  useEffect(() => {
    setQueryInputValue(selectedQuery)
  }, [selectedQuery])

  useEffect(() => {
    // Filter queries based on input
    if (selectedQuery.trim() === '') {
      setFilteredQueries(queries)
    } else {
      const filtered = queries.filter(query =>
        query.toLowerCase().includes(queryInputValue.toLowerCase())
      )
      setFilteredQueries(filtered)
    }
  }, [queryInputValue, queries])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        queryInputRef.current &&
        !queryInputRef.current.contains(event.target as Node)
      ) {
        setShowQueryDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    console.log('Filtering queries:', {
      queryInputValue,
      queriesLength: queries.length,
      filteredLength: filteredQueries.length
    })
    
    if (queryInputValue.trim() === '') {
      setFilteredQueries(queries)
    } else {
      const filtered = queries.filter(query =>
        query.toLowerCase().includes(queryInputValue.toLowerCase())
      )
      setFilteredQueries(filtered)
    }
  }, [queryInputValue, queries])

  const handleQueryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQueryInputValue(value)
    setShowQueryDropdown(true)
  }

  const handleQuerySelect = (query: string) => {
    setQueryInputValue(query)
    onQueryChange(query)
    setShowQueryDropdown(false)
    queryInputRef.current?.blur()
  }

  const handleQueryInputFocus = () => {
    setShowQueryDropdown(true)
  }

  const clearQuery = () => {
    setQueryInputValue('')
    onQueryChange('')
    queryInputRef.current?.focus()
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (selectedResearcher !== 'all') count++
    if (selectedQuery) count++
    if (selectedDate) count++
    if (showRead) count++
    if (showImportant) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()



  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
      {/* Header with hide/show button - only visible on large screens */}
      <div className="hidden lg:flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          {isHidden ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-2 py-1 bg-gray-100 rounded-full">
                <div className="text-gray-600"><FilterIcon /></div>
                <span className="text-sm font-medium text-gray-700">
                  {activeFiltersCount} active {activeFiltersCount === 1 ? 'filter' : 'filters'}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <UserIcon />
                <span className="font-medium text-sm">
                  {selectedResearcher === 'all' ? 'All Analysts' : selectedResearcher}
                </span>
                {selectedQuery && (
                  <>
                    <span className="text-gray-400">•</span>
                    <SearchIcon />
                    <span className="font-medium text-sm">"{selectedQuery}"</span>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="text-gray-600">
                <FilterIcon />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              {activeFiltersCount > 0 && (
                <div className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  {activeFiltersCount}
                </div>
              )}
            </div>
          )}
        </div>
        <button
          onClick={() => setIsHidden(!isHidden)}
          className="flex items-center space-x-2 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
        >
          {isHidden ? (
            <>
              <ChevronDownIcon />
              <span>Show Filters</span>
            </>
          ) : (
            <>
              <ChevronUpIcon />
              <span>Hide Filters</span>
            </>
          )}
        </button>
      </div>

      {/* Mobile header - always visible on small screens */}
      <div className="lg:hidden p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="text-gray-600">
              <FilterIcon />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            {activeFiltersCount > 0 && (
              <div className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                {activeFiltersCount}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Filter content - hidden on large screens when isHidden is true, always visible on mobile */}
      <div className={`${isHidden ? 'hidden lg:hidden' : 'block'} p-4`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Researcher Filter */}
          <div className="flex items-center border border-gray-200 rounded overflow-hidden bg-white hover:border-gray-300 transition-colors">
            <div className="text-gray-600 flex-shrink-0 px-3 py-2 border-r border-gray-200 bg-gray-50">
              <UserIcon />
            </div>
            <div className="flex-1 relative">
              <select
                id="researcher"
                value={selectedResearcher}
                onChange={(e) => onResearcherChange(e.target.value)}
                className="w-full px-3 py-2 pr-8 bg-white border-0 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-50 transition-colors appearance-none"
                disabled={researchersLoading}
              >
                <option value="all">All Analysts</option>
                {researchersLoading ? (
                  <option disabled>Loading researchers...</option>
                ) : researchersError ? (
                  <option disabled>Error loading researchers</option>
                ) : (
                  researchers.map((researcher) => (
                    <option key={researcher} value={researcher}>
                      {researcher}
                    </option>
                  ))
                )}
              </select>
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                <ChevronDownIcon />
              </div>
            </div>
          </div>

          {/* Query Filter - Fixed Version */}
          <div className="flex items-center border border-gray-200 rounded overflow-hidden bg-white hover:border-gray-300 transition-colors relative">
            <div className="text-gray-600 flex-shrink-0 px-3 py-2 border-r border-gray-200 bg-gray-50">
              <SearchIcon />
            </div>
            <div className="flex-1 relative">
              <input
                ref={queryInputRef}
                type="text"
                id="query"
                value={queryInputValue}
                onChange={handleQueryInputChange}
                onFocus={handleQueryInputFocus}
                placeholder="Type or select a query..."
                autoComplete="off"
                className="w-full px-3 py-2 pr-8 bg-white border-0 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-50 transition-colors"
                disabled={queriesLoading}
              />
              {selectedQuery ? (
                <button
                  onClick={clearQuery}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  type="button"
                >
                  <XIcon />
                </button>
              ) : (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                  <SearchIcon />
                </div>
              )}
            </div>
            
            {queriesLoading && (
              <div className="absolute -bottom-6 left-0 text-xs text-gray-500 flex items-center space-x-1">
                <div className="w-3 h-3 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <span>Loading queries...</span>
              </div>
            )}
            
            {queriesError && (
              <div className="absolute -bottom-6 left-0 text-xs text-red-500">Error loading queries</div>
            )}
            
            {/* Fixed Dropdown - moved outside and positioned properly */}
          </div>

          {/* Dropdown positioned outside the input container */}
          {showQueryDropdown && !queriesLoading && !queriesError && (
            <div
              ref={dropdownRef}
              className="absolute bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto min-w-0"
              style={{
                zIndex: 9999,
                top: queryInputRef.current ? queryInputRef.current.getBoundingClientRect().bottom + window.scrollY + 4 : '100%',
                left: queryInputRef.current ? queryInputRef.current.getBoundingClientRect().left + window.scrollX : 0,
                width: queryInputRef.current ? queryInputRef.current.getBoundingClientRect().width : '100%',
                position: 'absolute'
              }}
            >
              {filteredQueries.length > 0 ? (
                filteredQueries.map((query, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleQuerySelect(query)
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100 last:border-b-0 text-gray-700 text-sm font-medium transition-colors block"
                    type="button"
                  >
                    {query}
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-gray-500 text-sm">
                  {queryInputValue.trim() ? 'No matching queries found' : 'No queries available'}
                </div>
              )}
            </div>
          )}

          {/* Date Filter */}
          <div className="flex items-center border border-gray-200 rounded overflow-hidden bg-white hover:border-gray-300 transition-colors">
            <div className="text-gray-600 flex-shrink-0 px-3 py-2 border-r border-gray-200 bg-gray-50">
              <CalendarIcon />
            </div>
            <div className="flex-1 relative">
              <select
                id="date"
                value={selectedDate}
                onChange={(e) => onSelectedDateChange(e.target.value)}
                className="w-full px-3 py-2 pr-8 bg-white border-0 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-50 transition-colors appearance-none"
              >
                <option value="">All Dates</option>
                {getPastFiveDays().map(date => (
                  <option key={date} value={date}>
                    {formatDate(date)}
                  </option>
                ))}
              </select>
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                <ChevronDownIcon />
              </div>
            </div>
          </div>

          {/* Show Read Toggle */}
          <div className={`flex items-center border rounded overflow-hidden transition-colors ${
            showRead
              ? 'border-blue-600 bg-blue-600'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}>
            <div className={`flex-shrink-0 px-3 py-2 border-r transition-colors ${
              showRead
                ? 'text-white border-blue-700 bg-blue-700'
                : 'text-gray-600 border-gray-200 bg-gray-50'
            }`}>
              <EyeIcon />
            </div>
            <button
              onClick={() => onShowReadChange(!showRead)}
              className={`flex-1 px-3 py-2 text-sm font-medium border-0 transition-colors ${
                showRead
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Show Read
            </button>
          </div>

          {/* Important Only Toggle */}
          <div className={`flex items-center border rounded overflow-hidden transition-colors ${
            showImportant
              ? 'border-blue-600 bg-blue-600'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}>
            <div className={`flex-shrink-0 px-3 py-2 border-r transition-colors ${
              showImportant
                ? 'text-white border-blue-700 bg-blue-700'
                : 'text-gray-600 border-gray-200 bg-gray-50'
            }`}>
              <StarIcon />
            </div>
            <button
              onClick={() => onShowImportantChange(!showImportant)}
              className={`flex-1 px-3 py-2 text-sm font-medium border-0 transition-colors ${
                showImportant
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Important Only
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}