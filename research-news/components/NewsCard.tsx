import React, { useState } from 'react'
import { format } from 'date-fns'
import { News } from '../lib/types'

interface NewsCardProps {
  news: News
  onUpdateReadStatus: (newsId: string, isRead: boolean) => void
  onMarkImportant: (newsId: string, isImportant: boolean) => void
}

function formatSummary(summary: string): string {
  let formatted = summary.replace(/\*\*(.*?)\*\*/g, '<span style="color: darkgreen;">$1</span>')
  formatted = formatted.replace(/\*(.*?)\*/g, '<span style="color: darkred;">$1</span>')
  return formatted
}

export default function NewsCard({ news, onUpdateReadStatus, onMarkImportant }: NewsCardProps) {
  const [showSummaryPopup, setShowSummaryPopup] = useState(false)

  const handleMarkAsRead = () => {
    onUpdateReadStatus(news._id, true)
  }

  const handleMarkAsUnread = () => {
    onUpdateReadStatus(news._id, false)
  }

  const handleMarkAsImportant = () => {
    onMarkImportant(news._id, !news.isImportant)
  }

  const handleOpenLink = () => {
    window.open(news.link, '_blank', 'noopener,noreferrer')
  }

  const toggleSummaryPopup = () => {
    setShowSummaryPopup(!showSummaryPopup)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 relative">
        {/* Main content layout - always flex on large screens */}
        <div className="lg:flex lg:gap-4 lg:h-full">
          {/* Left side content (news info) - takes 2/5 on large screens */}
          <div className="lg:w-2/5 lg:flex lg:flex-col">
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

            <div className="flex gap-2 flex-wrap lg:mt-auto">
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
                onClick={handleMarkAsImportant}
                className={`px-3 py-1 text-xs rounded ${
                  news.isImportant
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {news.isImportant ? 'Unmark Important' : 'Mark as Important'}
              </button>

              <button
                onClick={toggleSummaryPopup}
                className="lg:hidden px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
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

          {/* Right side summary - always visible on large screens, takes 3/5 */}
          <div className="hidden lg:flex lg:flex-col lg:w-3/5 bg-gray-50 rounded-lg p-4 mt-4 lg:mt-0">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-lg font-semibold text-gray-900">Summary</h4>
              <button
                onClick={toggleSummaryPopup}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                Show More
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <div
                className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed line-clamp-6"
                dangerouslySetInnerHTML={{ __html: formatSummary(news.summary) }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Popup modal for both small screens and "Show More" on large screens */}
      {showSummaryPopup && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={toggleSummaryPopup}
        >
          <div
            className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-lg font-semibold mb-4 text-gray-900">Full Summary</h4>
            <div
              className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed mb-4"
              dangerouslySetInnerHTML={{ __html: formatSummary(news.summary) }}
            ></div>
            <div className="text-right">
              <button
                onClick={toggleSummaryPopup}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
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