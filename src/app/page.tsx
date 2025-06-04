'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTabs } from '@/context/TabsProvider'
import { motion } from 'framer-motion'
import { ConsoleInput } from '@/components/ui/console-input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Youtube, LineChart, Bot, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const QUICK_ACTIONS = [
  { name: 'Clone Youtube', icon: <Youtube className="w-4 h-4" /> },
  { name: 'Mood Tracker', icon: <LineChart className="w-4 h-4" /> },
  { name: 'AI Pan', icon: <Bot className="w-4 h-4" /> },
  { name: 'Surprise Me', icon: <Sparkles className="w-4 h-4" /> }
]

const RECENT_TASKS = [
  { id: 'EMT-1f3a9e', title: 'Make me a working ai cat video website where people can see the cat as a livestream and type to it', status: 'COMPLETED' },
  { id: 'EMT-5ed569', title: 'Can you rebuild app.emergent.sh in typescript', status: 'IN_PROGRESS' },
  { id: 'EMT-b4c5ba', title: 'dsf', status: 'PENDING' },
  { id: 'EMT-ec44ca', title: 'Build me a clone of emergent.sh', status: 'IN_PROGRESS' }
]

const COMMUNITY_PROJECTS = [
  {
    title: 'AI Goal Coach',
    description: 'AI coach that analyzes your objectives, creates personalized step-by-step plans, and provides ongoing guidance.'
  },
  {
    title: 'Solo Pro',
    description: 'SoloPro—an AI-powered platform that helps you transform your strengths and interests into structured business opportunities.'
  },
  {
    title: 'Children Storyboard',
    description: 'Interactive web app that generates personalized children stories with matching AI illustrations.'
  },
  {
    title: 'Research Explorer',
    description: 'An intelligent app that conducts comprehensive research on any topic using AI search capabilities.'
  }
]

export default function Home() {
  const router = useRouter()
  const { addTab } = useTabs()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('Recent Tasks')

  const handleSubmit = async (prompt: string) => {
    setLoading(true)
    try {
      const id = addTab(prompt)
      router.push(`/chat/${id}?q=${encodeURIComponent(prompt)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="w-full max-w-[900px] px-6 pt-32 pb-20">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-normal mb-2">
            Welcome to <span className="text-accent">AI Hub</span>
          </h1>
          <h2 className="text-xl text-muted-foreground">
            Start a conversation with AI to build your next project
          </h2>
          <Button 
            onClick={() => {
              const id = addTab('New Chat')
              router.push(`/chat/${id}`)
            }}
            className="mt-8 bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Start New Chat
          </Button>
        </motion.div>

        {/* Console Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <ConsoleInput onSubmit={handleSubmit} loading={loading} />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2 mt-4 mb-16"
        >
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.name}
              onClick={() => handleSubmit(`Build me a ${action.name.toLowerCase()}`)}
              className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-sm text-secondary-foreground transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/5 flex items-center gap-2 hover-glow"
            >
              {action.icon}
              {action.name}
            </button>
          ))}
        </motion.div>

        {/* Recent Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mb-20"
        >
          <div className="flex items-center justify-center gap-6 mb-6">
            <button 
              onClick={() => setActiveTab('Recent Tasks')}
              className={`text-sm font-medium relative ${
                activeTab === 'Recent Tasks' 
                  ? 'text-foreground after:absolute after:-bottom-2 after:left-0 after:w-full after:h-0.5 after:bg-accent' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Recent Tasks
            </button>
            <button 
              onClick={() => setActiveTab('Deployed Apps')}
              className={`text-sm font-medium ${
                activeTab === 'Deployed Apps' 
                  ? 'text-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Deployed Apps
            </button>
          </div>
          <Card className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-normal text-muted-foreground">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-normal text-muted-foreground">Task</th>
                  <th className="text-left py-3 px-4 text-sm font-normal text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_TASKS.map((task) => (
                  <tr key={task.id} className="border-b border-border">
                    <td className="py-3 px-4 text-sm text-muted-foreground">{task.id}</td>
                    <td className="py-3 px-4 text-sm">{task.title}</td>
                    <td className="py-3 px-4">
                      <Badge 
                        variant={task.status === 'COMPLETED' ? 'success' : task.status === 'IN_PROGRESS' ? 'default' : 'secondary'}
                        className={cn(
                          "hover-float",
                          task.status === 'IN_PROGRESS' && "animate-pulse"
                        )}
                      >
                        {task.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </motion.div>

        {/* Community Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <div className="flex items-center justify-center gap-2 mb-12">
            <span className="w-1 h-1 bg-border rounded-full" />
            <span className="w-1 h-1 bg-border rounded-full" />
            <span className="text-muted-foreground">From the Community</span>
            <span className="w-1 h-1 bg-border rounded-full" />
            <span className="w-1 h-1 bg-border rounded-full" />
          </div>

          <div className="flex justify-center gap-3 mb-12">
            <button className="px-6 py-2 rounded-full bg-foreground text-background text-sm font-medium">
              AI Apps
            </button>
            {['Digital Sidekicks', 'Landing', 'Hack & Play'].map((category) => (
              <button
                key={category}
                className="px-6 py-2 rounded-full bg-secondary text-muted-foreground text-sm hover:text-foreground transition-colors"
              >
                {category}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {COMMUNITY_PROJECTS.map((project) => (
              <Card
                key={project.title}
                className="interactive-card p-6 hover:bg-secondary/50 transition-colors cursor-pointer"
              >
                <div className="card-content">
                  <h3 className="text-lg font-medium mb-2">{project.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {project.description}
                  </p>
                  <div className="card-image aspect-video bg-secondary rounded-lg" />
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  )
}
 