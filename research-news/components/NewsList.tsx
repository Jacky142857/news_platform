import React, { useEffect, useState } from 'react'
import { News } from '../lib/types'
import NewsCard from './NewsCard'
import { updateNewsHighlights, debouncedUpdateHighlights } from '../lib/highlightUtils'

// Define the Highlight interface to match what NewsCard expects
interface Highlight {
  id: string
  start: number
  end: number
  text: string
  createdAt?: Date
}

interface NewsListProps {
  filters: {
    researcher: string
    showRead: boolean
    showImportant: boolean
    selectedDate: string
    selectedQuery: string
  }
}

export default function NewsList({ filters }: NewsListProps) {
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(50)
  const [totalPages, setTotalPages] = useState(1)
  const [hasResults, setHasResults] = useState(true)
    
  useEffect(() => {
    setPage(1)
    fetchNews()
  }, [filters.researcher,
      filters.showRead,
      filters.showImportant,
      filters.selectedDate,
      filters.selectedQuery])
 
  useEffect(() => {
    fetchNews()
  }, [page])
 
  const fetchNews = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        researcher: filters.researcher,
        showRead: filters.showRead.toString(),
        showImportant: filters.showImportant.toString(),
        page: page.toString(),
        pageSize: pageSize.toString()
      })
 
      if (filters.selectedDate) {
        params.append('selectedDate', filters.selectedDate)
      }
 
      if (filters.selectedQuery) {
        params.append('selectedQuery', filters.selectedQuery)
      }
             
      const response = await fetch(`/api/news?${params}`)
      const data = await response.json()
      setNews(data.news)
      setTotalPages(data.totalPages)
      setHasResults(data.totalPages > 0)
    } catch (error) {
      console.error('Error fetching news:', error)
    } finally {
      setLoading(false)
    }
  }
 
  const handleUpdateReadStatus = async (newsId: string, isRead: boolean) => {
    // Use a ref to track if the operation is in progress
    const operationId = Date.now().toString()
    
    try {
      // Update state functionally to avoid stale closures
      setNews(prevNews => {
        const updatedNews = prevNews.map(item =>
          item._id === newsId ? { ...item, isRead } : item
        )
        
        // Apply filtering logic
        return updatedNews.filter(item => {
          if (!filters.showRead && item.isRead) return false
          if (filters.showImportant && !item.isImportant) return false
          return true
        })
      })

      // Make API call
      const response = await fetch(`/api/news/${newsId}/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isRead })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
    } catch (error) {
      console.error('Error marking as read:', error)
      
      // On error, refetch the entire list to ensure consistency
      // This is safer than trying to revert complex state changes
      fetchNews()
      
      // Optionally show error message
      // toast.error('Failed to update read status')
    }
  }

 
  const handleToggleImportant = async (newsId: string, isImportant: boolean) => {
    try {
      await fetch(`/api/news/${newsId}/important`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isImportant })
      })
             
      // Update the item in place since importance filtering doesn't need immediate re-filtering
      setNews(prev => prev.map(item =>
        item._id === newsId ? { ...item, isImportant } : item
      ))
    } catch (error) {
      console.error('Error toggling importance:', error)
    }
  }

  // Handle highlight updates with debouncing to avoid too many API calls
  const handleUpdateHighlights = async (newsId: string, highlights: Highlight[]) => {
    try {
      // Convert highlights to the format expected by the API (ensure createdAt is present)
      const apiHighlights = highlights.map(h => ({
        ...h,
        createdAt: h.createdAt || new Date()
      }))
      
      // Use debounced update to avoid excessive API calls during rapid highlighting
      await debouncedUpdateHighlights(newsId, apiHighlights, 800)
      console.log('Highlights updated successfully for news:', newsId)
      
      // Update the local state to reflect the changes immediately in the UI
      setNews(prev => prev.map(item =>
        item._id === newsId ? { ...item, highlights: apiHighlights } : item
      ))
    } catch (error) {
      console.error('Failed to update highlights:', error)
      // You could show a toast notification here
      // toast.error('Failed to save highlights')
    }
  }

  // Alternative: Immediate update (use this if you prefer instant persistence)
  const handleImmediateUpdateHighlights = async (newsId: string, highlights: Highlight[]) => {
    try {
      // Convert highlights to the format expected by the API (ensure createdAt is present)
      const apiHighlights = highlights.map(h => ({
        ...h,
        createdAt: h.createdAt || new Date()
      }))
      
      await updateNewsHighlights(newsId, apiHighlights)
      console.log('Highlights updated immediately for news:', newsId)
      
      // Update the local state to reflect the changes immediately in the UI
      setNews(prev => prev.map(item =>
        item._id === newsId ? { ...item, highlights: apiHighlights } : item
      ))
    } catch (error) {
      console.error('Failed to update highlights:', error)
    }
  }
 
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
 
  if (!hasResults) {
    return (
      <div className="text-center text-gray-500 mt-8">
        <p>No news found matching your filters.</p>
      </div>
    )
  }
 
  return (
    <div className="space-y-4">
      {/* Show news items if available on current page */}
      {news.length > 0 ? (
        news.map((item) => (
          <NewsCard
            key={item._id}
            news={item}
            onUpdateReadStatus={handleUpdateReadStatus}
            onMarkImportant={handleToggleImportant}
            onUpdateHighlights={handleUpdateHighlights}
          />
        ))
      ) : (
        /* Show message when current page is empty but other pages have results */
        <div className="text-center text-gray-500 mt-8 mb-8">
          <p>No news items on this page. Try navigating to other pages.</p>
        </div>
      )}

      {/* Always show pagination if there are results across any pages */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
          {/* Previous button */}
          {page > 1 && (
            <button
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 border rounded bg-white text-blue-600 hover:bg-blue-700 hover:text-white transition-colors"
            >
              &lt;
            </button>
          )}

          {/* Individual page numbers for pages 1-10 */}
          {Array.from({ length: Math.min(10, totalPages) }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 border rounded ${
                page === i + 1 ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'
              } hover:bg-blue-700 hover:text-white transition-colors`}
            >
              {i + 1}
            </button>
          ))}

          {/* Show ">" button for pages 11+ */}
          {totalPages > 10 && (
            <>
              {/* Show ellipsis if current page is beyond page 10 */}
              {page > 10 && (
                <span className="px-2 text-gray-500">...</span>
              )}
              
              {/* Show current page number if it's beyond page 10 */}
              {page > 10 && (
                <button
                  className="px-3 py-1 border rounded bg-blue-600 text-white"
                >
                  {page}
                </button>
              )}

              {/* Next button (>) */}
              {page < totalPages && (
                <button
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1 border rounded bg-white text-blue-600 hover:bg-blue-700 hover:text-white transition-colors"
                >
                  &gt;
                </button>
              )}
            </>
          )}

          {/* Next button for when total pages <= 10 */}
          {totalPages <= 10 && page < totalPages && (
            <button
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 border rounded bg-white text-blue-600 hover:bg-blue-700 hover:text-white transition-colors"
            >
              &gt;
            </button>
          )}
        </div>
      )}
    </div>
  )
}