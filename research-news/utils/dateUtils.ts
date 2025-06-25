export const getPastFiveDays = () => {
  return Array.from({ length: 5 }).map((_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    return date.toISOString().slice(0, 10)
  })
}

export const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setUTCDate(yesterday.getUTCDate() - 1)
  
  const todayUTC = today.toISOString().slice(0, 10)
  const yesterdayUTC = yesterday.toISOString().slice(0, 10)
  
  if (dateString === todayUTC) return 'Today'
  if (dateString === yesterdayUTC) return 'Yesterday'
  
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}