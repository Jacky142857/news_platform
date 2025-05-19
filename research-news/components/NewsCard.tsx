import React, { useState } from 'react'
import { format } from 'date-fns'
import { News } from '../lib/types'

interface NewsCardProps {
  news: News
}

export default function NewsCard({ news }: NewsCardProps) {
  const [isRead, setIsRead] = useState(news.isRead)

  const handleMarkAsRead = () => {
    setIsRead(true)
  }

  const handleOpenLink = () => {
    window.open(news.link, '_blank', 'noopener,noreferrer')
  }

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 
                  ${isRead ? 'opacity-60' : ''}`}
    >
      <div className="p-4 relative">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 flex-1 pr-2">
            {news.title}
          </h3>
        </div>

        <p className="text-sm text-gray-600 mb-2">
          Researcher: <span className="font-medium">{news.researcher}</span>
        </p>

        <p className="text-gray-700 text-sm mb-3 line-clamp-3">
          {news.summary}
        </p>

        <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
          <span>{format(new Date(news.date), 'MMM dd, yyyy')}</span>
          <button
            onClick={handleOpenLink}
            className="text-blue-600 hover:text-blue-800 underline"
            aria-label="Read full article"
          >
            Read Full Article
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleMarkAsRead}
            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
          >
            Mark as Read
          </button>
        </div>
      </div>
    </div>
  )
}
