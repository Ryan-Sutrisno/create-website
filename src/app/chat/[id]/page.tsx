'use client'

import { useState } from 'react'
import { ChatInterface } from '@/components/ui/chat-interface'
import { AIService } from '@/lib/ai-service'
import { WebsiteRequirements } from '@/lib/website-analyzer'
import { formatTimestamp } from '@/lib/utils'

type Message = {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  website?: {
    requirements?: WebsiteRequirements
    setup?: {
      envVariables: Record<string, string>
      installCommands: string[]
      setupInstructions: string[]
    }
    code?: {
      contracts?: string | null
      frontend?: string
      backend?: string
      database?: string
      api?: string
      components?: string
      styles?: string
      tests?: string
    }
    preview?: {
      id: string
      url: string
    }
  }
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "What kind of website would you like to build?",
      timestamp: formatTimestamp(new Date())
    }
  ])
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async (message: string) => {
    setIsLoading(true)
    // Add user message
    setMessages(prev => [...prev, {
      role: 'user',
      content: message,
      timestamp: formatTimestamp(new Date())
    }])

    try {
      const aiService = AIService.getInstance()
      const result = await aiService.generateWebsite(message)
      
      // Add AI response with website generation results
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: result.explanation,
        timestamp: formatTimestamp(new Date()),
        website: {
          requirements: result.requirements,
          setup: result.setup,
          code: result.code,
          preview: result.preview,
        }
      }])

      // Add a summary message with next steps
      const setupSteps = result.setup.setupInstructions.join('\n')
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `I've generated all the code and configurations for your website. Here's what you need to do:\n\n${setupSteps}\n\nPreview your website here: ${result.preview.url}\n\nWould you like me to explain any part in more detail?`,
        timestamp: formatTimestamp(new Date())
      }])
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, there was an error generating your website. Please try again.',
        timestamp: formatTimestamp(new Date())
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <ChatInterface
        messages={messages}
        onSend={handleSendMessage}
        isLoading={isLoading}
        className="flex-1"
      />
    </div>
  )
} 