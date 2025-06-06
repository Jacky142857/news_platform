import type { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '../../../lib/mongodb'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const client = await clientPromise
    const db = client.db('research_news')
    const news = db.collection('news')
    if (req.method === 'GET') {
      const { researcher, showRead, showImportant, selectedDate, selectedQuery, page = '1', pageSize='10' } = req.query

      const query: any = {}

      // Researcher filter
      if (researcher && researcher !== 'all') {
        query.researcher = researcher
      }

      // Read filter
      if (showRead === 'false') {
        query.isRead = false  // Show only unread
      } else if (showRead === 'true') {
        query.isRead = true   // Show only read
      }

      // Important filter
      if (showImportant === 'true') {
        query.isImportant = true
      }

      // Date filter
      if (selectedDate && typeof selectedDate === 'string') {
        const start = new Date(`${selectedDate}T00:00:00.000Z`)
        const end = new Date(`${selectedDate}T23:59:59.999Z`)
        query.date = { $gte: start, $lte: end }
      }

      // Query filter - search in title and content
      if (selectedQuery && typeof selectedQuery === 'string' && selectedQuery.trim() !== '') {
        const searchRegex = new RegExp(selectedQuery.trim(), 'i') // Case-insensitive search
        query.$or = [
          { title: { $regex: searchRegex } },
          { content: { $regex: searchRegex } }
        ]
      }

      const pageNum = parseInt(page as string, 10)
      const size = parseInt(pageSize as string, 10)
      const skip = (pageNum - 1) * size

      const totalCount = await news.countDocuments(query)

      const result = await news
        .find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(size)
        .toArray()

      res.status(200).json({
        news: result,
        totalCount,
        totalPages: Math.ceil(totalCount / size),
        currentPage: pageNum
      })
    } else {
      res.setHeader('Allow', ['GET'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to fetch news' })
  }
}