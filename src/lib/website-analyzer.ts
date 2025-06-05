export interface WebsiteRequirements {
  type: WebsiteType
  features: string[]
  integrations: Integration[]
  database: DatabaseRequirement
  apis: ApiRequirement[]
  hosting: HostingRequirement
  auth: AuthRequirement
  payments?: PaymentRequirement
  storage?: StorageRequirement
}

export type WebsiteType = 
  | 'e-commerce'
  | 'social-media'
  | 'blog'
  | 'portfolio'
  | 'dashboard'
  | 'marketplace'
  | 'web3'
  | 'saas'
  | 'custom'

interface Integration {
  name: string
  purpose: string
  setupSteps: string[]
  requiredEnvVars: string[]
  pricing?: {
    free?: boolean
    startingPrice?: string
    pricingUrl?: string
  }
}

interface DatabaseRequirement {
  type: 'postgresql' | 'mongodb' | 'mysql' | 'redis' | 'supabase' | 'firebase'
  reason: string
  schema?: string
  setupSteps: string[]
}

interface ApiRequirement {
  name: string
  purpose: string
  provider: string
  apiKeyInstructions: string
  pricing?: {
    hasFreeTeir: boolean
    startingPrice?: string
    pricingUrl?: string
  }
}

interface HostingRequirement {
  provider: 'vercel' | 'netlify' | 'aws' | 'gcp' | 'custom'
  type: 'static' | 'ssr' | 'serverless'
  setupSteps: string[]
  estimatedCost: string
}

interface AuthRequirement {
  type: 'oauth' | 'jwt' | 'web3' | 'custom'
  providers: string[]
  setupSteps: string[]
}

interface PaymentRequirement {
  provider: 'stripe' | 'paypal' | 'web3' | 'custom'
  features: string[]
  setupSteps: string[]
}

interface StorageRequirement {
  type: 's3' | 'cloudinary' | 'firebase' | 'ipfs' | 'custom'
  purpose: string
  setupSteps: string[]
}

export class WebsiteAnalyzer {
  private static instance: WebsiteAnalyzer

  private constructor() {}

  static getInstance(): WebsiteAnalyzer {
    if (!WebsiteAnalyzer.instance) {
      WebsiteAnalyzer.instance = new WebsiteAnalyzer()
    }
    return WebsiteAnalyzer.instance
  }

  async analyzeRequirements(prompt: string): Promise<WebsiteRequirements> {
    const type = this.detectWebsiteType(prompt)
    const features = this.extractFeatures(prompt)
    
    return {
      type,
      features,
      integrations: await this.determineIntegrations(type, features),
      database: await this.determineDatabaseRequirements(type, features),
      apis: await this.determineApiRequirements(type, features),
      hosting: await this.determineHostingRequirements(type, features),
      auth: await this.determineAuthRequirements(type, features),
      ...(await this.determineOptionalRequirements(type, features))
    }
  }

  private detectWebsiteType(prompt: string): WebsiteType {
    prompt = prompt.toLowerCase()
    
    if (prompt.includes('shop') || prompt.includes('store') || prompt.includes('sell')) {
      return 'e-commerce'
    } else if (prompt.includes('social') || prompt.includes('community') || prompt.includes('connect')) {
      return 'social-media'
    } else if (prompt.includes('blog') || prompt.includes('content') || prompt.includes('articles')) {
      return 'blog'
    } else if (prompt.includes('portfolio') || prompt.includes('showcase')) {
      return 'portfolio'
    } else if (prompt.includes('dashboard') || prompt.includes('admin') || prompt.includes('analytics')) {
      return 'dashboard'
    } else if (prompt.includes('marketplace') || prompt.includes('buy and sell')) {
      return 'marketplace'
    } else if (prompt.includes('web3') || prompt.includes('blockchain') || prompt.includes('crypto')) {
      return 'web3'
    } else if (prompt.includes('saas') || prompt.includes('subscription')) {
      return 'saas'
    }
    return 'custom'
  }

  private extractFeatures(prompt: string): string[] {
    const features: string[] = []
    prompt = prompt.toLowerCase()

    // Authentication features
    if (prompt.includes('login') || prompt.includes('auth')) features.push('authentication')
    if (prompt.includes('oauth') || prompt.includes('social login')) features.push('social-auth')
    if (prompt.includes('web3') || prompt.includes('wallet')) features.push('web3-auth')

    // Data features
    if (prompt.includes('database') || prompt.includes('store data')) features.push('database')
    if (prompt.includes('real-time') || prompt.includes('live')) features.push('real-time')
    if (prompt.includes('search')) features.push('search')

    // Content features
    if (prompt.includes('upload') || prompt.includes('file')) features.push('file-upload')
    if (prompt.includes('image') || prompt.includes('photo')) features.push('image-handling')
    if (prompt.includes('video')) features.push('video-handling')

    // Payment features
    if (prompt.includes('payment') || prompt.includes('subscription')) features.push('payments')
    if (prompt.includes('crypto') || prompt.includes('token')) features.push('crypto-payments')

    // Communication features
    if (prompt.includes('email') || prompt.includes('newsletter')) features.push('email')
    if (prompt.includes('chat') || prompt.includes('message')) features.push('messaging')
    if (prompt.includes('notification')) features.push('notifications')

    // Analytics features
    if (prompt.includes('analytics') || prompt.includes('track')) features.push('analytics')
    if (prompt.includes('dashboard')) features.push('dashboard')

    return features
  }

  private async determineIntegrations(type: WebsiteType, features: string[]): Promise<Integration[]> {
    const integrations: Integration[] = []

    // Add common integrations based on type and features
    if (features.includes('analytics')) {
      integrations.push({
        name: 'Google Analytics',
        purpose: 'Track user behavior and website performance',
        setupSteps: [
          'Create Google Analytics account',
          'Get measurement ID',
          'Add tracking code to website'
        ],
        requiredEnvVars: ['NEXT_PUBLIC_GA_MEASUREMENT_ID'],
        pricing: {
          free: true
        }
      })
    }

    if (features.includes('email')) {
      integrations.push({
        name: 'SendGrid',
        purpose: 'Send transactional and marketing emails',
        setupSteps: [
          'Create SendGrid account',
          'Generate API key',
          'Set up sender authentication'
        ],
        requiredEnvVars: ['SENDGRID_API_KEY'],
        pricing: {
          free: true,
          startingPrice: '$14.95/month',
          pricingUrl: 'https://sendgrid.com/pricing'
        }
      })
    }

    // Add more integrations based on specific features...

    return integrations
  }

  private async determineDatabaseRequirements(type: WebsiteType, features: string[]): Promise<DatabaseRequirement> {
    if (features.includes('real-time')) {
      return {
        type: 'supabase',
        reason: 'Real-time capabilities needed for live updates',
        setupSteps: [
          'Create Supabase account',
          'Create new project',
          'Get database credentials',
          'Set up database schema'
        ]
      }
    }

    if (type === 'e-commerce' || type === 'marketplace') {
      return {
        type: 'postgresql',
        reason: 'Relational database needed for complex product relationships and transactions',
        setupSteps: [
          'Set up PostgreSQL database',
          'Configure connection',
          'Run migrations'
        ]
      }
    }

    // Default to MongoDB for flexibility
    return {
      type: 'mongodb',
      reason: 'Flexible document database for rapid development',
      setupSteps: [
        'Create MongoDB Atlas account',
        'Set up cluster',
        'Get connection string'
      ]
    }
  }

  private async determineApiRequirements(type: WebsiteType, features: string[]): Promise<ApiRequirement[]> {
    const apis: ApiRequirement[] = []

    if (features.includes('search')) {
      apis.push({
        name: 'Algolia',
        purpose: 'Powerful search functionality',
        provider: 'Algolia',
        apiKeyInstructions: 'Get API keys from Algolia dashboard',
        pricing: {
          hasFreeTeir: true,
          startingPrice: '$29/month',
          pricingUrl: 'https://www.algolia.com/pricing'
        }
      })
    }

    if (features.includes('image-handling')) {
      apis.push({
        name: 'Cloudinary',
        purpose: 'Image optimization and transformation',
        provider: 'Cloudinary',
        apiKeyInstructions: 'Get API keys from Cloudinary dashboard',
        pricing: {
          hasFreeTeir: true,
          startingPrice: '$49/month',
          pricingUrl: 'https://cloudinary.com/pricing'
        }
      })
    }

    // Add more API requirements based on features...

    return apis
  }

  private async determineHostingRequirements(type: WebsiteType, features: string[]): Promise<HostingRequirement> {
    if (type === 'web3' || features.includes('web3-auth')) {
      return {
        provider: 'vercel',
        type: 'serverless',
        setupSteps: [
          'Connect GitHub repository',
          'Configure environment variables',
          'Deploy to Vercel'
        ],
        estimatedCost: 'Free tier available, $20+/month for pro features'
      }
    }

    // Default to Vercel for Next.js apps
    return {
      provider: 'vercel',
      type: 'ssr',
      setupSteps: [
        'Connect GitHub repository',
        'Configure environment variables',
        'Deploy to Vercel'
      ],
      estimatedCost: 'Free tier available, $20+/month for pro features'
    }
  }

  private async determineAuthRequirements(type: WebsiteType, features: string[]): Promise<AuthRequirement> {
    if (features.includes('web3-auth')) {
      return {
        type: 'web3',
        providers: ['WalletConnect', 'MetaMask', 'Phantom'],
        setupSteps: [
          'Install wallet adapters',
          'Configure supported chains',
          'Set up authentication flow'
        ]
      }
    }

    if (features.includes('social-auth')) {
      return {
        type: 'oauth',
        providers: ['Google', 'GitHub', 'Twitter'],
        setupSteps: [
          'Set up OAuth applications',
          'Configure authentication providers',
          'Implement sign-in flow'
        ]
      }
    }

    return {
      type: 'jwt',
      providers: ['Email/Password'],
      setupSteps: [
        'Set up authentication backend',
        'Configure JWT settings',
        'Implement authentication flow'
      ]
    }
  }

  private async determineOptionalRequirements(type: WebsiteType, features: string[]): Promise<{
    payments?: PaymentRequirement
    storage?: StorageRequirement
  }> {
    const requirements: {
      payments?: PaymentRequirement
      storage?: StorageRequirement
    } = {}

    if (features.includes('payments')) {
      if (features.includes('crypto-payments')) {
        requirements.payments = {
          provider: 'web3',
          features: ['token payments', 'wallet integration'],
          setupSteps: [
            'Set up wallet connection',
            'Configure supported tokens',
            'Implement payment flow'
          ]
        }
      } else {
        requirements.payments = {
          provider: 'stripe',
          features: ['one-time payments', 'subscriptions'],
          setupSteps: [
            'Create Stripe account',
            'Get API keys',
            'Set up webhook endpoints'
          ]
        }
      }
    }

    if (features.includes('file-upload')) {
      if (type === 'web3') {
        requirements.storage = {
          type: 'ipfs',
          purpose: 'Decentralized file storage',
          setupSteps: [
            'Set up IPFS node',
            'Configure pinning service',
            'Implement upload flow'
          ]
        }
      } else {
        requirements.storage = {
          type: 's3',
          purpose: 'File storage and CDN',
          setupSteps: [
            'Create S3 bucket',
            'Configure CORS',
            'Set up CloudFront'
          ]
        }
      }
    }

    return requirements
  }
} 