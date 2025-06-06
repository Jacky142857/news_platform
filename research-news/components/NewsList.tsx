import React, { useEffect, useState } from 'react'
import { News } from '../lib/types'
import NewsCard from './NewsCard'

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
  }, [filters])

  useEffect(() => {
    fetchNews()
  }, [filters, page])

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
      await fetch(`/api/news/${newsId}/read`, {
        method: 'PATCH', 
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isRead })
      })
      
      // Simply refetch the data to ensure correct filtering
      fetchNews()
    } catch (error) {
      console.error('Error marking as read:', error)
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