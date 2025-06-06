import { NextResponse } from 'next/server'
import { AIService } from '@/lib/ai-service'
import { logger } from '@/lib/logger'

export async function POST(request: Request) {
  try {
    const { messages } = await request.json()
    const lastMessage = messages[messages.length - 1]

    if (!lastMessage || !lastMessage.content) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      )
    }

    const aiService = AIService.getInstance()
    const result = await aiService.generateWebsite(lastMessage.content)

    return NextResponse.json({
      message: result.explanation,
      website: {
        requirements: result.requirements,
        setup: result.setup,
        code: result.code,
        preview: result.preview
      }
    })
  } catch (error) {
    logger.error('Error in AI chat', { error })
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
} 