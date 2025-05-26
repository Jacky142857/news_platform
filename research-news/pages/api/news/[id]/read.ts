import type { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '../../../../lib/mongodb'
import { ObjectId } from 'mongodb'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query

  if (req.method !== 'PATCH') {
    res.setHeader('Allow', ['PATCH'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const { isRead = true } = req.body  // Default to true if not provided

  try {
    const client = await clientPromise
    const db = client.db('research_news')
    const news = db.collection('news')

    const updateDoc: any = {
      isRead,
      updatedAt: new Date()
    }

    if (isRead === true) {
      updateDoc.readDate = new Date()
    } else {
      updateDoc.readDate = null
    }

    const result = await news.updateOne(
      { _id: new ObjectId(id as string) },
      { $set: updateDoc }
    )

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: 'News not found or no change' })
    }

    res.status(200).json({ success: true })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to update read status' })
  }
}
