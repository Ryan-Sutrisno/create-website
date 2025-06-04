import { previewStore } from '@/lib/preview-store'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const html = previewStore.get(params.id)
  if (!html) {
    return new Response('Preview not found', { status: 404 })
  }
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8'
    }
  })
} 