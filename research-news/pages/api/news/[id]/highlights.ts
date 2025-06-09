// pages/api/news/[id]/highlights.ts
import { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '../../../../lib/mongodb'
import { ObjectId } from 'mongodb'

interface IHighlight {
  id: string
  start: number
  end: number
  text: string
  createdAt?: Date
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (!id) {
    return res.status(400).json({ error: 'News ID is required' })
  }

  try {
    const client = await clientPromise
    const db = client.db('research_news')
    const news = db.collection('news')

    switch (req.method) {
      case 'PUT':
        try {
          const { highlights }: { highlights: IHighlight[] } = req.body

          // Validate highlights data
          if (!Array.isArray(highlights)) {
            return res.status(400).json({ error: 'Highlights must be an array' })
          }

          // Validate each highlight object
          for (const highlight of highlights) {
            if (!highlight.id || typeof highlight.start !== 'number' || typeof highlight.end !== 'number' || !highlight.text) {
              return res.status(400).json({ error: 'Invalid highlight data structure' })
            }
          }

          const result = await news.updateOne(
            { _id: new ObjectId(id as string) },
            { 
              $set: { 
                highlights: highlights,
                updatedAt: new Date()
              }
            }
          )

          if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'News not found' })
          }

          const updatedNews = await news.findOne({ _id: new ObjectId(id as string) })
          res.status(200).json({ 
            message: 'Highlights updated successfully',
            highlights: updatedNews?.highlights || []
          })
        } catch (error) {
          console.error('Error updating highlights:', error)
          res.status(500).json({ error: 'Failed to update highlights' })
        }
        break

      case 'GET':
        try {
          const newsDoc = await news.findOne(
            { _id: new ObjectId(id as string) },
            { projection: { highlights: 1 } }
          )
          
          if (!newsDoc) {
            return res.status(404).json({ error: 'News not found' })
          }

          res.status(200).json({ highlights: newsDoc.highlights || [] })
        } catch (error) {
          console.error('Error fetching highlights:', error)
          res.status(500).json({ error: 'Failed to fetch highlights' })
        }
        break

      default:
        res.setHeader('Allow', ['GET', 'PUT'])
        res.status(405).json({ error: `Method ${req.method} not allowed` })
    }
  } catch (error) {
    console.error('Database connection error:', error)
    res.status(500).json({ error: 'Failed to connect to database' })
  }
}