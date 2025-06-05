import { NextApiRequest, NextApiResponse } from 'next'
import { previewStore } from '@/lib/preview-store'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query
  const html = previewStore.get(id as string)

  if (!html) {
    return res.status(404).json({ error: 'Preview not found' })
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.status(200).send(html)
} 