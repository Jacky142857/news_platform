import mongoose, { Schema, Document } from 'mongoose'

interface INews extends Document {
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

const NewsSchema: Schema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  summary: { type: String, required: true },
  link: { type: String, required: true },
  date: { type: Date, required: true },
  researcher: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  isImportant: { type: Boolean, default: false },
  readDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Update the updatedAt field on save
NewsSchema.pre('save', function() {
  this.updatedAt = new Date()
})

export default mongoose.models.News || mongoose.model<INews>('News', NewsSchema)