import type { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '../../../lib/mongodb'
import { News } from '../../../lib/types'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const client = await clientPromise
    const db = client.db('research_news')
    const news = db.collection('news')

    if (req.method === 'GET') {
      const { researcher, showRead, showImportant } = req.query
      
      let query: any = {}
      
      if (researcher && researcher !== 'all') {
        query.researcher = researcher
      }
      
      if (showRead === 'false') {
        query.isRead = false
      }
      
      if (showImportant === 'true') {
        query.isImportant = true
      }

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