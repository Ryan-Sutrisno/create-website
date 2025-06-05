import { logger } from './logger'
import { WebsiteRequirements } from './website-analyzer'

interface GenerateResponse {
  explanation: string;
  requirements: WebsiteRequirements;
  setup: {
    envVariables: Record<string, string>;
    installCommands: string[];
    setupInstructions: string[];
  };
  code: {
    frontend?: string;
    backend?: string;
    database?: string;
    api?: string;
    contracts?: string | null;
  };
  preview: {
    id: string;
    url: string;
  };
}

export class AIService {
  private static instance: AIService
  private constructor() {}

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  async generateWebsite(prompt: string): Promise<GenerateResponse> {
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