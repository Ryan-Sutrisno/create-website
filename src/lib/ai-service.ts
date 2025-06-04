import { logger } from './logger'
import { WebsiteRequirements } from './website-analyzer'

export class AIService {
  private static instance: AIService
  private constructor() {}

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  async generateWebsite(prompt: string) {
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate website')
      }

      const data = await response.json()
      return data
    } catch (error) {
      logger.error('Error in AI Service', { error })
      throw new Error('Failed to generate website')
    }
  }
} 