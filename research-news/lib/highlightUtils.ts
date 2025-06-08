// lib/highlightUtils.ts
interface IHighlight {
  id: string
  start: number
  end: number
  text: string
  createdAt?: Date
}

// API call to update highlights
export async function updateNewsHighlights(newsId: string, highlights: IHighlight[]): Promise<void> {
  const response = await fetch(`/api/news/${newsId}/highlights`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ highlights }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update highlights')
  }
}

// API call to fetch highlights
export async function fetchNewsHighlights(newsId: string): Promise<IHighlight[]> {
  const response = await fetch(`/api/news/${newsId}/highlights`)
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch highlights')
  }

  const data = await response.json()
  return data.highlights || []
}

// Debounced update function to avoid too many API calls
let updateTimeout: NodeJS.Timeout | null = null

export function debouncedUpdateHighlights(newsId: string, highlights: IHighlight[], delay: number = 1000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (updateTimeout) {
      clearTimeout(updateTimeout)
    }

    updateTimeout = setTimeout(async () => {
      try {
        await updateNewsHighlights(newsId, highlights)
        resolve()
      } catch (error) {
        reject(error)
      }
    }, delay)
  })
}