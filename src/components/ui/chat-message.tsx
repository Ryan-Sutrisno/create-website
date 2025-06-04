'use client'

import { cn } from '@/lib/utils'
import { Markdown } from '@/components/Markdown'
import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  className?: string
}

export function ChatMessage({ role, content, className }: ChatMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex',
        role === 'assistant' ? 'justify-start' : 'justify-end',
        className
      )}
    >
      <Card
        className={cn(
          'px-4 py-2 max-w-[80%]',
          role === 'assistant' 
            ? 'bg-secondary text-secondary-foreground' 
            : 'bg-accent text-accent-foreground'
        )}
      >
        <Markdown content={content} />
      </Card>
    </motion.div>
  )
} 