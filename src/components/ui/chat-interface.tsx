import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { Textarea } from './textarea'
import { Send, Loader2, X, Code2, Copy, Check, Rocket, Terminal, FileCode, Database, Server, Brush, TestTube } from 'lucide-react'
import { motion } from 'framer-motion'
import { Markdown } from '@/components/Markdown'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './dialog'
import { Input } from './input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'
import { WebsiteRequirements } from '@/lib/website-analyzer'
import { Timestamp } from './timestamp'

interface ChatInterfaceProps {
  messages: {
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
    }
  }[]
  onSend: (message: string) => void
  onDeploy?: (name: string, description: string) => Promise<void>
  onLocalTest?: (name: string) => Promise<void>
  onClose?: () => void
  isLoading?: boolean
  isTestingLocally?: boolean
  className?: string
}

export function ChatInterface({
  messages,
  onSend,
  onDeploy,
  onLocalTest,
  onClose,
  isLoading,
  isTestingLocally,
  className
}: ChatInterfaceProps) {
  const [input, setInput] = React.useState('')
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null)
  const [showDeployDialog, setShowDeployDialog] = React.useState(false)
  const [deploymentName, setDeploymentName] = React.useState('')
  const [deploymentDescription, setDeploymentDescription] = React.useState('')
  const [isDeploying, setIsDeploying] = React.useState(false)
  const [showTestDialog, setShowTestDialog] = React.useState(false)
  const [testName, setTestName] = React.useState('')
  const [selectedTab, setSelectedTab] = React.useState('frontend')
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      onSend(input)
      setInput('')
    }
  }

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleDeploy = async (message: any) => {
    if (!onDeploy) return
    setIsDeploying(true)
    try {
      await onDeploy(deploymentName, deploymentDescription)
      setShowDeployDialog(false)
    } finally {
      setIsDeploying(false)
    }
  }

  const handleLocalTest = async () => {
    if (!onLocalTest) return
    setIsTestingLocally(true)
    try {
      await onLocalTest(testName)
      setShowTestDialog(false)
    } finally {
      setIsTestingLocally(false)
    }
  }

  const renderCodeSection = (message: typeof messages[0]) => {
    if (!message.website?.code) return null

    const codeFiles = {
      frontend: {
        title: 'Frontend',
        icon: <FileCode className="w-4 h-4" />,
        code: message.website.code.frontend,
        language: 'typescript'
      },
      backend: {
        title: 'Backend',
        icon: <Server className="w-4 h-4" />,
        code: message.website.code.backend,
        language: 'typescript'
      },
      database: {
        title: 'Database',
        icon: <Database className="w-4 h-4" />,
        code: message.website.code.database,
        language: 'sql'
      },
      api: {
        title: 'API',
        icon: <Server className="w-4 h-4" />,
        code: message.website.code.api,
        language: 'typescript'
      },
      components: {
        title: 'Components',
        icon: <FileCode className="w-4 h-4" />,
        code: message.website.code.components,
        language: 'typescript'
      },
      styles: {
        title: 'Styles',
        icon: <Brush className="w-4 h-4" />,
        code: message.website.code.styles,
        language: 'css'
      },
      tests: {
        title: 'Tests',
        icon: <TestTube className="w-4 h-4" />,
        code: message.website.code.tests,
        language: 'typescript'
      }
    }

    if (message.website.code.contracts) {
      codeFiles['contracts'] = {
        title: 'Smart Contracts',
        icon: <FileCode className="w-4 h-4" />,
        code: message.website.code.contracts,
        language: 'rust'
      }
    }

    return (
      <div className="mt-4">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid grid-cols-4 lg:grid-cols-8 gap-2">
            {Object.entries(codeFiles).map(([key, { title, icon }]) => (
              <TabsTrigger
                key={key}
                value={key}
                className="flex items-center gap-2"
              >
                {icon}
                <span className="hidden lg:inline">{title}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          {Object.entries(codeFiles).map(([key, { code, language }]) => (
            <TabsContent key={key} value={key}>
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-[#60A5FA]">{codeFiles[key].title}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => handleCopyCode(code)}
                  >
                    {copiedCode === code ? (
                      <Check className="h-3 w-3 mr-1" />
                    ) : (
                      <Copy className="h-3 w-3 mr-1" />
                    )}
                    {copiedCode === code ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <div className="bg-[#0A0A0A] rounded-lg p-4 overflow-x-auto">
                  <Markdown content={`\`\`\`${language}\n${code}\n\`\`\``} />
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    )
  }

  const renderSetupSection = (message: typeof messages[0]) => {
    if (!message.website?.setup) return null

    return (
      <div className="mt-4 space-y-4">
        <div className="bg-[#141414] rounded-lg p-4 border border-[#1F1F1F]">
          <h3 className="text-sm font-medium text-[#E0E0E0] mb-2">Environment Variables</h3>
          <div className="bg-[#0A0A0A] rounded-lg p-4 overflow-x-auto">
            <pre className="text-xs text-[#E0E0E0]">
              {Object.entries(message.website.setup.envVariables)
                .map(([key, value]) => `${key}=${value}`)
                .join('\n')}
            </pre>
          </div>
        </div>

        <div className="bg-[#141414] rounded-lg p-4 border border-[#1F1F1F]">
          <h3 className="text-sm font-medium text-[#E0E0E0] mb-2">Installation Commands</h3>
          <div className="space-y-2">
            {message.website.setup.installCommands.map((command, index) => (
              <div key={index} className="bg-[#0A0A0A] rounded-lg p-2 overflow-x-auto">
                <code className="text-xs text-[#E0E0E0]">{command}</code>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#141414] rounded-lg p-4 border border-[#1F1F1F]">
          <h3 className="text-sm font-medium text-[#E0E0E0] mb-2">Setup Instructions</h3>
          <div className="space-y-2">
            {message.website.setup.setupInstructions.map((instruction, index) => (
              <p key={index} className="text-sm text-[#E0E0E0]">{instruction}</p>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col h-full bg-[#0A0A0A]', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#1F1F1F]">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-[#60A5FA]" />
          <span className="text-sm font-medium text-[#E0E0E0]">Website Generator</span>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[#666666] hover:text-[#E0E0E0]"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
              'flex flex-col rounded-lg p-4',
              message.role === 'assistant'
                ? 'bg-[#141414] border border-[#1F1F1F]'
                : 'bg-[#1A1A1A]'
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className={cn(
                  'text-xs font-medium',
                  message.role === 'assistant' ? 'text-[#60A5FA]' : 'text-[#4ADE80]'
                )}
              >
                {message.role === 'assistant' ? 'AI' : 'You'}
              </div>
              <Timestamp 
                isoString={message.timestamp}
                className="text-xs text-[#666666]"
              />
            </div>
            <div className="text-sm text-[#E0E0E0] whitespace-pre-wrap">
              <Markdown content={message.content} />
            </div>

            {message.website && (
              <>
                {renderCodeSection(message)}
                {renderSetupSection(message)}
              </>
            )}
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-[#1F1F1F]">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe the website you want to build..."
            className="min-h-[44px] max-h-[200px] bg-[#141414] border-[#1F1F1F] text-[#E0E0E0] placeholder:text-[#666666] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
            className={cn(
              'h-11 w-11 bg-[#2563EB] hover:bg-[#1D4ED8] text-white',
              (!input.trim() || isLoading) && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </form>

      {/* Test Dialog */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test dApp Locally</DialogTitle>
            <DialogDescription>
              This will set up a local Solana test validator and deploy your dApp for testing.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#E0E0E0]">Project Name</label>
              <Input
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                placeholder="my-test-dapp"
                className="bg-[#141414] border-[#1F1F1F] text-[#E0E0E0]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setShowTestDialog(false)}
              className="text-[#666666] hover:text-[#E0E0E0]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleLocalTest}
              className="bg-[#1A1A2F] hover:bg-[#2A2A4A] text-[#60A5FA]"
              disabled={!testName || isTestingLocally}
            >
              {isTestingLocally ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  <Terminal className="w-4 h-4 mr-2" />
                  Start Testing
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Deploy Dialog */}
      <Dialog open={showDeployDialog} onOpenChange={setShowDeployDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deploy Your dApp</DialogTitle>
            <DialogDescription>
              Enter a name and description for your dApp. This will be used to create the repository and deployment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#E0E0E0]">Project Name</label>
              <Input
                value={deploymentName}
                onChange={(e) => setDeploymentName(e.target.value)}
                placeholder="my-solana-dapp"
                className="bg-[#141414] border-[#1F1F1F] text-[#E0E0E0]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#E0E0E0]">Description</label>
              <Textarea
                value={deploymentDescription}
                onChange={(e) => setDeploymentDescription(e.target.value)}
                placeholder="A brief description of your dApp..."
                className="bg-[#141414] border-[#1F1F1F] text-[#E0E0E0]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setShowDeployDialog(false)}
              className="text-[#666666] hover:text-[#E0E0E0]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeploy}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
              disabled={!deploymentName || !deploymentDescription || isDeploying}
            >
              {isDeploying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deploying...
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4 mr-2" />
                  Deploy
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 