import React, { useState } from 'react'
import { motion, PanInfo } from 'framer-motion'
import { format } from 'date-fns'
import { News } from '../lib/types'

interface NewsCardProps {
  news: News
  onSwipeAction: (newsId: string) => void
  onToggleImportant: (newsId: string, isImportant: boolean) => void
}

export default function NewsCard({ news, onSwipeAction, onToggleImportant }: NewsCardProps) {
  const [dragX, setDragX] = useState(0)
  const [isRead, setIsRead] = useState(news.isRead)

  const handleMarkAsRead = () => {
    setIsRead(true)
    setTimeout(() => onSwipeAction(news._id!), 300)
  }

  const handleToggleImportant = () => {
    onToggleImportant(news._id!, !news.isImportant)
  }

  const handleOpenLink = () => {
    window.open(news.link, '_blank', 'noopener,noreferrer')
  }

  return (
    <motion.div
      className={`bg-white rounded-lg shadow-sm border ${news.isImportant ? 'border-yellow-400' : 'border-gray-200'} 
                  ${isRead ? 'opacity-60' : ''}`}
      animate={{ x: dragX }}
      transition={{ type: "spring", damping: 15 }}
    >
      <div className="p-4 relative">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 flex-1 pr-2">
            {news.title}
          </h3>
          <button
            onClick={handleToggleImportant}
            className={`ml-2 p-1 rounded ${
              news.isImportant 
                ? 'text-yellow-500 bg-yellow-50' 
                : 'text-gray-400 hover:text-yellow-500'
            }`}
            aria-label="Toggle important"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
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
    </motion.div>
  )
}
