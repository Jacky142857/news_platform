export interface News {
  _id?: string
  title: string
  content: string
  summary: string
  link: string
  date: Date
  researcher: string
  isRead: boolean
  isImportant: boolean
  readDate?: Date
  createdAt: Date
  updatedAt: Date
}

export interface NewsFilters {
  researcher?: string
  startDate?: Date
  endDate?: Date
  showRead?: boolean
  showImportant?: boolean
}