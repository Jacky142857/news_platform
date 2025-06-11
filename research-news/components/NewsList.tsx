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
    } catch (error) {
      console.error('Error fetching news:', error)
    } finally {
      setLoading(false)
    }
  }
 
  const handleUpdateReadStatus = async (newsId: string, isRead: boolean) => {
    try {
      // Update local state immediately for instant UI feedback
      setNews(prev => prev.map(item =>
        item._id === newsId ? { ...item, isRead } : item
      ))

      // Make API call in background
      await fetch(`/api/news/${newsId}/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isRead })
      })

      // Only refetch if the current filters would hide this item
      // For example, if showRead is false and we just marked as read
      if (!filters.showRead && isRead) {
        // Item should be hidden, so refetch to remove it from view
        fetchNews()
      }
      // If showRead is true or we marked as unread, no need to refetch
      // since the item should remain visible with updated status
      
    } catch (error) {
      console.error('Error marking as read:', error)
      
      // Revert the local state change on error
      setNews(prev => prev.map(item =>
        item._id === newsId ? { ...item, isRead: !isRead } : item
      ))
      
      // Optionally show error message to user
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
 
  if (news.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-8">
        <p>No news found matching your filters.</p>
      </div>
    )
  }
 
  return (
    <div className="space-y-4">
      {news.map((item) => (
        <NewsCard
          key={item._id}
          news={item}
          onUpdateReadStatus={handleUpdateReadStatus}
          onMarkImportant={handleToggleImportant}
          onUpdateHighlights={handleUpdateHighlights} // Use debounced version
          // onUpdateHighlights={handleImmediateUpdateHighlights} // Or use immediate version
        />
      ))}
      <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
        {Array.from({ length: totalPages }, (_, i) => (
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
      </div>
    </div>
       
  )
}