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
      const { researcher, showRead, showImportant, selectedDate } = req.query

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
      } else {
        query.isImportant = false
      }

      // Date filter
      if (selectedDate && typeof selectedDate === 'string') {
        // Parse the selected date string (e.g. '2024-05-25')
        const selected = new Date(selectedDate)

        // Set time to start of day (local)
        const start = new Date(`${selectedDate}T00:00:00.000Z`)

        start.setHours(0, 0, 0, 0)

        // Set time to end of day
        const end = new Date(`${selectedDate}T23:59:59.999Z`)
        end.setHours(23, 59, 59, 999)

        console.log('Filtering between:', start.toISOString(), 'and', end.toISOString())

        query.date = {
          $gte: start,
          $lte: end
        }
      }

      console.log('API Query Params:', req.query)
      console.log('MongoDB Query Object:', query)
      const result = await news
        .find(query)
        .sort({ date: -1 })
        .toArray()

      res.status(200).json(result)
    } else {
      res.setHeader('Allow', ['GET'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to fetch news' })
  }
}
