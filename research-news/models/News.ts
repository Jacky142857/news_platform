import mongoose, { Schema, Document } from 'mongoose'

interface IHighlight {
  id: string
  start: number
  end: number
  text: string
  createdAt: Date
}

interface INews extends Document {
  title: string
  content: string
  summary: string
  link: string
  date: Date
  researcher: string
  query?: string
  isRead: boolean
  isImportant: boolean
  readDate?: Date
  highlights: IHighlight[]
  createdAt: Date
  updatedAt: Date
}

const HighlightSchema: Schema = new Schema({
  id: { type: String, required: true },
  start: { type: Number, required: true },
  end: { type: Number, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
})

const NewsSchema: Schema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  summary: { type: String, required: true },
  link: { type: String, required: true },
  date: { type: Date, required: true },
  researcher: { type: String, required: true },
  query: { type: String, required: false },
  isRead: { type: Boolean, default: false },
  isImportant: { type: Boolean, default: false },
  readDate: { type: Date },
  highlights: { type: [HighlightSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Update the updatedAt field on save
NewsSchema.pre('save', function() {
  this.updatedAt = new Date()
})

export default mongoose.models.News || mongoose.model<INews>('News', NewsSchema)
export type { INews, IHighlight }