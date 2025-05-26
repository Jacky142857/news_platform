import React, { useState } from 'react'
import { format } from 'date-fns'
import { News } from '../lib/types'

interface NewsCardProps {
  news: News
  onUpdateReadStatus: (newsId: string, isRead: boolean) => void
}

export default function NewsCard({ news, onUpdateReadStatus }: NewsCardProps) {
  const [showSummary, setShowSummary] = useState(false)

  const handleMarkAsRead = () => {
    onUpdateReadStatus(news._id, true)
  }

  const handleMarkAsUnread = () => {
    onUpdateReadStatus(news._id, false)
  }

  const handleOpenLink = () => {
    window.open(news.link, '_blank', 'noopener,noreferrer')
  }

  const toggleSummary = () => {
    setShowSummary(!showSummary)
  }

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 
                  ${news.isRead ? 'opacity-60' : ''}`}
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

        <div className="text-xs text-gray-500 mb-3">
          <span>{format(new Date(news.date), 'MMM dd, yyyy')}</span>
        </div>

        <div className="flex gap-2">
          {news.isRead ? (
            <button
              onClick={handleMarkAsUnread}
              className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
            >
              Mark as Unread
            </button>
          ) : (
            <button
              onClick={handleMarkAsRead}
              className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              Mark as Read
            </button>
          )}
          <button
            onClick={toggleSummary}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            Summary
          </button>
          <button
            onClick={handleOpenLink}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            Read Full Article
          </button>
        </div>
      </div>

      {/* Overlay Modal for Summary */}
      {showSummary && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={toggleSummary} // <-- click outside closes
        >
          <div
            className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto"
            onClick={(e) => e.stopPropagation()} // <-- click inside won't close
          >
            <h4 className="text-lg font-semibold mb-4">Summary</h4>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{news.summary}</p>
            <div className="mt-4 text-right">
              <button
                onClick={toggleSummary}
                className="px-4 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}