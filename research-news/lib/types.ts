export interface News {
  _id?: string
  title: string
  content: string
  summary: string
  link: string
  query: string
  date: Date
  researcher: string
  isRead: boolean
  isImportant: boolean
  readDate?: Date
  createdAt: Date
  updatedAt: Date
  highlights: IHighlight[]  // add this field
}

export interface IHighlight {
  id: string
  start: number
  end: number
  text: string
  createdAt: Date
}

export interface NewsFilters {
  researcher?: string
  startDate?: Date
  endDate?: Date
  showRead?: boolean
  showImportant?: boolean
}