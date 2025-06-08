// pages/api/news/[id]/highlights.ts
import { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../../lib/mongodb'
import News from '../../../../models/News'

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

  await dbConnect()

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

        const updatedNews = await News.findByIdAndUpdate(
          id,
          { 
            highlights: highlights,
            updatedAt: new Date()
          },
          { new: true }
        )

        if (!updatedNews) {
          return res.status(404).json({ error: 'News not found' })
        }

        res.status(200).json({ 
          message: 'Highlights updated successfully',
          highlights: updatedNews.highlights
        })
      } catch (error) {
        console.error('Error updating highlights:', error)
        res.status(500).json({ error: 'Failed to update highlights' })
      }
      break

    case 'GET':
      try {
        const news = await News.findById(id).select('highlights')
        
        if (!news) {
          return res.status(404).json({ error: 'News not found' })
        }

        res.status(200).json({ highlights: news.highlights || [] })
      } catch (error) {
        console.error('Error fetching highlights:', error)
        res.status(500).json({ error: 'Failed to fetch highlights' })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'PUT'])
      res.status(405).json({ error: `Method ${req.method} not allowed` })
  }
}