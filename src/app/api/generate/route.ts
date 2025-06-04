import { NextResponse } from 'next/server'
import { Anthropic, MessageParam } from '@anthropic-ai/sdk'
import { WebsiteAnalyzer } from '@/lib/website-analyzer'
import { previewStore } from '@/lib/preview-store'
import { nanoid } from 'nanoid'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

const websiteAnalyzer = WebsiteAnalyzer.getInstance()

// Helper function to add delay between API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Constants for token limits
const INITIAL_MAX_TOKENS = 400
const CODE_MAX_TOKENS = 800
const REQUEST_DELAY_MS = 15000 // 15-second delay to spread token usage across a minute
const PREVIEW_MAX_TOKENS = 800

interface AnthropicRequestParams {
  model: string;
  max_tokens: number;
  temperature: number;
  system: string;
  messages: MessageParam[];
}

// Helper function to handle rate limits
async function makeAnthropicRequest(params: AnthropicRequestParams, retries = 3) {
  try {
    return await anthropic.messages.create(params)
  } catch (error: Error) {
    if ('status' in error && error.status === 429 && retries > 0) {
      const headers = 'headers' in error ? error.headers : {};
      const retryAfter = parseInt(headers?.['retry-after'] || '60')
      await delay(retryAfter * 1000)
      return makeAnthropicRequest(params, retries - 1)
    }
    throw error
  }
}

interface ContentBlock {
  type: string;
  text?: string;
}

// Helper to safely extract text from Anthropic content blocks
function extractText(content: ContentBlock[]): string {
  const textBlock = content.find(block => block.type === 'text')
  return textBlock?.text || ''
}

interface Requirements {
  type: string;
  features: string[];
  integrations: { name: string }[];
  database?: { type: string };
  auth?: { type: string };
}

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()
    
    // Analyze requirements
    const requirements = await websiteAnalyzer.analyzeRequirements(prompt)
    
    const systemPrompt = `You are an expert full-stack developer. Generate a complete ${requirements.type} website with modern UI, secure backend, and proper database design.
Features: ${requirements.features.join(', ')}
Integrations: ${requirements.integrations.map(i => i.name).join(', ')}`

    // Initial response with high-level architecture
    const response = await makeAnthropicRequest({
      model: 'claude-3-opus-20240229',
      max_tokens: INITIAL_MAX_TOKENS,
      temperature: 0.7,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    })

    // Generate code components sequentially to avoid rate limits
    const codeComponents = ['frontend', 'backend', 'database', 'api']
    const codeResponse = []
    
    for (const type of codeComponents) {
      const result = await makeAnthropicRequest({
        model: 'claude-3-opus-20240229',
        max_tokens: CODE_MAX_TOKENS,
        temperature: 0.5,
        system: `Generate production-ready ${type} code for a ${requirements.type} website. Respond with concise, well-commented code only.`,
        messages: [{ role: 'user', content: `Generate ${type} code for: ${prompt}` }],
      })
      codeResponse.push(extractText(result.content))
      await delay(REQUEST_DELAY_MS)
    }

    // Add contracts generation only for web3 projects
    let contracts = null
    if (requirements.type === 'web3') {
      const contractsResponse = await makeAnthropicRequest({
        model: 'claude-3-opus-20240229',
        max_tokens: CODE_MAX_TOKENS,
        temperature: 0.5,
        system: 'Generate production-ready smart contracts. Respond with concise, well-commented Solidity code only.',
        messages: [{ role: 'user', content: `Generate smart contracts for: ${prompt}` }],
      })
      contracts = extractText(contractsResponse.content)
    }

    // Generate lightweight preview HTML
    const previewId = nanoid()
    let previewHtml = '<html><body><h1>Preview unavailable</h1></body></html>'
    try {
      const previewResponse = await makeAnthropicRequest({
        model: 'claude-3-opus-20240229',
        max_tokens: PREVIEW_MAX_TOKENS,
        temperature: 0.3,
        system: 'Generate a single self-contained HTML file (inline CSS/JS) that showcases the landing page for the website described below. No external resources. Use TailwindCDN is NOT allowed; use inline styles only.',
        messages: [{ role: 'user', content: `Generate preview HTML for: ${prompt}` }],
      })
      previewHtml = extractText(previewResponse.content)
    } catch (e) {
      console.error('Failed to generate preview HTML', e)
    }

    // Persist preview HTML in memory store
    previewStore.set(previewId, previewHtml)

    const previewUrl = `/preview/${previewId}`

    return NextResponse.json({
      explanation: extractText(response.content),
      requirements,
      setup: {
        envVariables: generateEnvVariables(requirements),
        installCommands: generateInstallCommands(requirements),
        setupInstructions: generateSetupInstructions(requirements),
      },
      code: {
        frontend: codeResponse[0],
        backend: codeResponse[1],
        database: codeResponse[2],
        api: codeResponse[3],
        contracts,
      },
      preview: {
        id: previewId,
        url: previewUrl,
      },
    })
  } catch (error) {
    console.error('Error in AI generation:', error)
    return NextResponse.json(
      { error: 'Failed to generate website' },
      { status: 500 }
    )
  }
}

function generateEnvVariables(requirements: Requirements) {
  const envVars: Record<string, string> = {
    NODE_ENV: 'development',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  }

  if (requirements.database?.type === 'postgresql') {
    envVars.DATABASE_URL = 'postgresql://user:password@localhost:5432/dbname'
  }

  if (requirements.auth?.type === 'oauth') {
    envVars.GOOGLE_CLIENT_ID = 'your-client-id'
    envVars.GOOGLE_CLIENT_SECRET = 'your-client-secret'
  }

  return envVars
}

function generateInstallCommands(requirements: Requirements) {
  const commands = [
    'npm install next@latest react@latest react-dom@latest',
    'npm install tailwindcss postcss autoprefixer',
    'npm install @radix-ui/react-* shadcn-ui',
  ]

  if (requirements.database?.type === 'postgresql') {
    commands.push('npm install @prisma/client')
  }

  return commands
}

function generateSetupInstructions(requirements: Requirements) {
  return [
    '1. Clone the repository',
    '2. Install dependencies: `npm install`',
    '3. Copy `.env.example` to `.env` and fill in the values',
    '4. Run the development server: `npm run dev`',
  ]
} 