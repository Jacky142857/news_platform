import type { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '../../lib/mongodb'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const client = await clientPromise 
        const db = client.db('research_news')
        const news = db.collection('news')

        if (req.method === 'GET') {
            
            const researchers = await news.distinct('researcher')
            res.status(200).json(researchers)
        } else {
            res.setHeader('Allow', ['GET'])
            res.status(405).end(`Method ${req.method} Not Allowed`)
        }
    } catch (e) {
        console.error(e)
        res.status(500).json({ error: 'Failed to fetch researchers' })
    }
}