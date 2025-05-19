import React, { useEffect, useState } from 'react'
import { News } from '../lib/types'
import NewsCard from './NewsCard'

interface NewsListProps {
  filters: {
    researcher: string
    showRead: boolean
    showImportant: boolean
  }
}

export default function NewsList({ filters }: NewsListProps) {
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNews()
  }, [filters])

  const fetchNews = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        researcher: filters.researcher,
        showRead: filters.showRead.toString(),
        showImportant: filters.showImportant.toString()
      })
      
      const response = await fetch(`/api/news?${params}`)
      const data = await response.json()
      setNews(data)
    } catch (error) {
      console.error('Error fetching news:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (newsId: string) => {
    try {
      await fetch(`/api/news/${newsId}/read`, {
        method: 'PATCH'
      })
      
      // Remove from list if not showing read news
      if (!filters.showRead) {
        setNews(prev => prev.filter(item => item._id !== newsId))
      } else {
        // Update the news item to show as read
        setNews(prev => prev.map(item => 
          item._id === newsId ? { ...item, isRead: true } : item
        ))
      }
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
        />
      ))}
    </div>
  )
}