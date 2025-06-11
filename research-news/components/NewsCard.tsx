import React, { useState, useRef, useCallback, useEffect } from 'react'
import { format } from 'date-fns'
import { News } from '../lib/types'

interface NewsCardProps {
  news: News
  onUpdateReadStatus: (newsId: string, isRead: boolean) => void
  onMarkImportant: (newsId: string, isImportant: boolean) => void
  onUpdateHighlights?: (newsId: string, highlights: Highlight[]) => void
}

interface Highlight {
  id: string
  start: number
  end: number
  text: string
  createdAt?: Date
}

function formatSummary(summary: string | null): string {
  if (!summary) return "<i>No summary available yet.</i>"

  let formatted = summary.replace(/\*\*(.*?)\*\*/g, '<span style="color: darkgreen;">$1</span>')
  formatted = formatted.replace(/\*(.*?)\*/g, '<span style="color: darkred;">$1</span>')
  return formatted
}


// Function to merge overlapping highlights
function mergeHighlights(highlights: Highlight[]): Highlight[] {
  if (highlights.length <= 1) return highlights

  const sorted = [...highlights].sort((a, b) => a.start - b.start)
  const merged: Highlight[] = []
  let current = sorted[0]

  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i]
    
    if (current.end >= next.start) {
      // Overlapping or adjacent - merge them
      current = {
        ...current,
        end: Math.max(current.end, next.end),
        text: current.text // Keep the first highlight's text for simplicity
      }
    } else {
      // No overlap - add current to merged and move to next
      merged.push(current)
      current = next
    }
  }
  
  merged.push(current)
  return merged
}

// Function to apply highlights to text - optimized version
function applyHighlights(text: string, highlights: Highlight[]): string {
  if (highlights.length === 0) return text

  const mergedHighlights = mergeHighlights(highlights)
  
  // Use array for better performance than string concatenation
  const parts: string[] = []
  let lastIndex = 0

  mergedHighlights.forEach(highlight => {
    // Add text before highlight
    if (highlight.start > lastIndex) {
      parts.push(text.slice(lastIndex, highlight.start))
    }
    // Add highlighted text
    parts.push(`<mark style="background-color: #fef08a; font-weight: bold;">${text.slice(highlight.start, highlight.end)}</mark>`)
    lastIndex = highlight.end
  })

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.join('')
}

export default function NewsCard({ news, onUpdateReadStatus, onMarkImportant, onUpdateHighlights }: NewsCardProps) {
  const [showSummaryPopup, setShowSummaryPopup] = useState(false)
  const [highlightMode, setHighlightMode] = useState(false)
  const [highlights, setHighlights] = useState<Highlight[]>([])
  const [selectedText, setSelectedText] = useState<{text: string, start: number, end: number} | null>(null)
  const summaryRef = useRef<HTMLDivElement>(null)

  // Initialize highlights from news data
  useEffect(() => {
    if (news.highlights && Array.isArray(news.highlights)) {
      setHighlights(news.highlights)
    }
  }, [news.highlights])

  useEffect(() => {
    if (showSummaryPopup) {
      // Store original overflow value
      const originalStyle = window.getComputedStyle(document.body).overflow
      // Prevent scrolling
      document.body.style.overflow = 'hidden'
      
      // Cleanup function to restore scrolling
      return () => {
        document.body.style.overflow = originalStyle
      }
    }
  }, [showSummaryPopup])

  // Keyboard event handler for Shift + H and Shift
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showSummaryPopup) return

      // Check if Shift + H is pressed to toggle highlight mode
      if (e.shiftKey && e.key.toLowerCase() === 'h') {
        e.preventDefault()
        toggleHighlightMode()
      }
      
      // Check if Shift + Enter is pressed to confirm highlight
      if (e.shiftKey && highlightMode && selectedText) {
        e.preventDefault()
        confirmHighlight()
      }
    }

    // Add event listener when popup is open
    if (showSummaryPopup) {
      document.addEventListener('keydown', handleKeyDown)
    }

    // Cleanup event listener
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showSummaryPopup, highlightMode, selectedText]) // Dependencies include selectedText for the confirm function

  // Persist highlights to database
  const persistHighlights = useCallback(async (newHighlights: Highlight[]) => {
    if (onUpdateHighlights && news._id) {
      try {
        await onUpdateHighlights(news._id, newHighlights)
      } catch (error) {
        console.error('Failed to persist highlights:', error)
        // Optionally show user feedback about the error
      }
    }
  }, [news._id, onUpdateHighlights])

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // We only care about Shift
    if (!e.shiftKey) return;

    /*  Allow normal Shift-drag selection **only** when:
        • the summary popup is visible   AND
        • the user has clicked “Highlight Text”
    */
    if (showSummaryPopup && highlightMode) return;

    // In every other situation, kill the native behaviour
    e.preventDefault();
    window.getSelection()?.removeAllRanges();
  };



  // Handle Shift+Click to open summary popup
  const handleCardClick = (e: React.MouseEvent) => {
    if (e.shiftKey) {
      e.preventDefault()
      setShowSummaryPopup(true)
    }
  }
  
  // Handle Shift+Press (light tap without clicking) using pointer events
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.shiftKey) {
      const force = (e as any).force ?? 0;

      // Detect light press (force < 0.5) or normal press
      if (force <= 0.5 || force === 0) {
        e.preventDefault();
        setShowSummaryPopup(true);
      }
    }
  };


  const handleMarkAsRead = () => {
    if (news._id) {
      onUpdateReadStatus(news._id, true)
    }
  }

  const handleMarkAsUnread = () => {
    if (news._id) {
      onUpdateReadStatus(news._id, false)
    }
  }

  const handleMarkAsImportant = () => {
    if (news._id) {
      onMarkImportant(news._id, !news.isImportant)
    }
  }

  const handleOpenLink = () => {
    window.open(news.link, '_blank', 'noopener,noreferrer')
  }

  const toggleSummaryPopup = () => {
    setShowSummaryPopup(!showSummaryPopup)
    // Reset highlight mode when closing popup
    if (showSummaryPopup) {
      setHighlightMode(false)
      setSelectedText(null)
    }
  }

  const toggleHighlightMode = () => {
    setHighlightMode(!highlightMode)
    setSelectedText(null)
    
    // Clear any existing selection
    if (window.getSelection) {
      window.getSelection()?.removeAllRanges()
    }
  }

  const handleTextSelection = useCallback(() => {
    if (!highlightMode || !summaryRef.current) return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const selectedText = selection.toString().trim()
    
    if (selectedText.length === 0) return

    // Optimized position calculation
    const textContent = summaryRef.current.textContent || ''
    
    // Use a more efficient method to find start position
    const preCaretRange = range.cloneRange()
    preCaretRange.selectNodeContents(summaryRef.current)
    preCaretRange.setEnd(range.startContainer, range.startOffset)
    const start = preCaretRange.toString().length

    setSelectedText({
      text: selectedText,
      start: start,
      end: start + selectedText.length
    })
  }, [highlightMode])

  // Handle touch selection for mobile devices
  const handleTouchEnd = useCallback(() => {
    // Reduced delay and use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
      handleTextSelection()
    })
  }, [handleTextSelection])

  const confirmHighlight = () => {
    if (!selectedText) return

    const newHighlight: Highlight = {
      id: Date.now().toString(),
      start: selectedText.start,
      end: selectedText.end,
      text: selectedText.text,
      createdAt: new Date()
    }

    const updatedHighlights = mergeHighlights([...highlights, newHighlight])
    setHighlights(updatedHighlights)
    persistHighlights(updatedHighlights)
    setSelectedText(null)
    
    // Clear selection
    if (window.getSelection) {
      window.getSelection()?.removeAllRanges()
    }

    // Automatically mark as important when adding the FIRST highlight
    if (highlights.length === 0 && !news.isImportant && news._id) {
      onMarkImportant(news._id, true)
    }
  }

  const clearAllHighlights = () => {
    setHighlights([])
    persistHighlights([])
  }

  const cancelSelection = () => {
    setSelectedText(null)
    if (window.getSelection) {
      window.getSelection()?.removeAllRanges()
    }
  }

  // Get the text content for highlighting (plain text without HTML formatting)
  const getPlainTextSummary = (summary: string): string => {
    // Remove markdown formatting for plain text processing
    return summary.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1')
  }

  // Get formatted summary with highlights applied - memoized for performance
  const getFormattedSummaryWithHighlights = useCallback((): string => {
    const plainText = getPlainTextSummary(news.summary)
    const highlightedText = applyHighlights(plainText, highlights)
    
    // Apply original formatting on top of highlights
    let formatted = highlightedText.replace(/\*\*(.*?)\*\*/g, '<span style="color: darkgreen;">$1</span>')
    formatted = formatted.replace(/\*(.*?)\*/g, '<span style="color: darkred;">$1</span>')
    return formatted
  }, [news.summary, highlights])

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 cursor-pointer md:hover:shadow-2xl md:hover:border-2 md:hover:border-gray-400 transition-all duration-200"
      onMouseDown={handleMouseDown}
      onClick={handleCardClick}
      title="Shift+Click to open summary"
    >
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
              Analyst: <span className="font-medium">{news.researcher}</span>
            </p>

            <div className="text-xs text-gray-500 mb-3">
              <span>{news.query}</span>
            </div>

            <div className="flex gap-2 flex-wrap lg:mt-auto">
              {news.isRead ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleMarkAsUnread()
                  }}
                  className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                >
                  Mark as Unread
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleMarkAsRead()
                  }}
                  className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                >
                  Mark as Read
                </button>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleMarkAsImportant()
                }}
                className={`px-3 py-1 text-xs rounded ${
                  news.isImportant
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {news.isImportant ? 'Unmark Important' : 'Mark as Important'}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleSummaryPopup()
                }}
                className="lg:hidden px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                Summary
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleOpenLink()
                }}
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
                onClick={(e) => {
                  e.stopPropagation()
                  toggleSummaryPopup()
                }}
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
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Full Summary</h4>
              <div className="flex gap-2">
                <button
                  onClick={toggleHighlightMode}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    highlightMode
                      ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                      : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  }`}
                  title="Keyboard shortcut: Shift + H (desktop only)"
                >
                  {highlightMode ? 'Exit Highlight' : 'Highlight Text'}
                </button>
              </div>
            </div>

            {highlightMode && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 mb-2">
                  <span className="hidden sm:inline">Highlight mode is active. Select text to highlight it. Press Shift + H to toggle, Shift + Enter to confirm selection.</span>
                  <span className="sm:hidden">Highlight mode is active. Tap and hold to select text, then use the confirm button below.</span>
                </p>
                {selectedText && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="text-xs text-gray-600 mb-2 sm:mb-0 sm:mr-4 flex-1">
                      Selected: "{selectedText.text.length > 50 ? selectedText.text.substring(0, 50) + '...' : selectedText.text}"
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={confirmHighlight}
                        className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 flex-1 sm:flex-none"
                        title="Keyboard shortcut: Shift + Enter (desktop only)"
                      >
                        Confirm Highlight
                      </button>
                      <button
                        onClick={cancelSelection}
                        className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex-1 sm:flex-none"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div
              ref={summaryRef}
              className={`text-sm text-gray-700 whitespace-pre-wrap leading-relaxed mb-4 ${
                highlightMode ? 'select-text cursor-text' : ''
              }`}
              style={{
                WebkitUserSelect: highlightMode ? 'text' : 'auto',
                userSelect: highlightMode ? 'text' : 'auto',
                WebkitTouchCallout: highlightMode ? 'default' : 'none',
                // Optimize rendering performance
                willChange: highlightMode ? 'contents' : 'auto',
                transform: 'translateZ(0)' // Force hardware acceleration
              }}
              dangerouslySetInnerHTML={{ 
                __html: highlights.length > 0 
                  ? getFormattedSummaryWithHighlights()
                  : formatSummary(news.summary)
              }}
              onMouseUp={handleTextSelection}
              onTouchEnd={handleTouchEnd}
            ></div>

            {highlights.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h5 className="text-sm font-medium text-blue-800 mb-2">
                  Highlights ({highlights.length})
                </h5>
                <button
                  onClick={clearAllHighlights}
                  className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Clear All Highlights
                </button>
              </div>
            )}

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