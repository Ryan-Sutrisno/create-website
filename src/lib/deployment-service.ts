import { Octokit } from '@octokit/rest'
import { logger } from './logger'
import fs from 'fs/promises'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface DeploymentConfig {
  name: string
  description: string
  contracts: string
  frontend: string
  tests: string
}

export class DeploymentService {
  private static instance: DeploymentService
  private octokit: Octokit
  private workspaceDir: string

  private constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    })
    this.workspaceDir = path.join(process.cwd(), 'workspace')
  }

  static getInstance(): DeploymentService {
    if (!DeploymentService.instance) {
      DeploymentService.instance = new DeploymentService()
    }
    return DeploymentService.instance
  }

  async deployDapp(config: DeploymentConfig) {
    try {
      // Create project directory
      const projectDir = path.join(this.workspaceDir, config.name)
      await fs.mkdir(projectDir, { recursive: true })

      // Initialize Git repository
      await this.initializeGitRepo(projectDir)

      // Create project structure
      await this.createProjectStructure(projectDir, config)

      // Create GitHub repository
      const repo = await this.createGithubRepo(config)

      // Push code to GitHub
      await this.pushToGithub(projectDir, repo.html_url)

      // Deploy to Vercel
      const vercelUrl = await this.deployToVercel(projectDir)

      // Deploy contracts to Solana
      const programId = await this.deployToSolana(projectDir)

      return {
        github: repo.html_url,
        frontend: vercelUrl,
        program: programId
      }
    } catch (error) {
      logger.error('Error in deployment', { error })
      throw new Error('Failed to deploy dApp')
    }
  }

  private async initializeGitRepo(dir: string) {
    await execAsync('git init', { cwd: dir })
  }

  private async createProjectStructure(dir: string, config: DeploymentConfig) {
    // Create program directory for Solana contracts
    const programDir = path.join(dir, 'program')
    await fs.mkdir(programDir, { recursive: true })
    
    // Create frontend directory
    const frontendDir = path.join(dir, 'app')
    await fs.mkdir(frontendDir, { recursive: true })

    // Write Anchor.toml
    const anchorConfig = `
[features]
seeds = false

[programs.localnet]
${config.name} = "11111111111111111111111111111111"

[registry]
url = "https://anchor.projectserum.com"

[provider]
cluster = "localnet"
wallet = "~/.config/solana/id.json"

[scripts]
test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"
    `
    await fs.writeFile(path.join(dir, 'Anchor.toml'), anchorConfig)

    // Write package.json
    const packageJson = {
      name: config.name,
      version: '0.1.0',
      scripts: {
        build: 'anchor build',
        test: 'anchor test',
        deploy: 'anchor deploy'
      },
      dependencies: {
        '@project-serum/anchor': '^0.26.0',
        '@solana/web3.js': '^1.87.6'
      },
      devDependencies: {
        '@types/mocha': '^10.0.6',
        'ts-mocha': '^10.0.0',
        typescript: '^5.3.3'
      }
    }
    await fs.writeFile(
      path.join(dir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    )

    // Write smart contracts
    await fs.writeFile(
      path.join(programDir, 'lib.rs'),
      config.contracts
    )

    // Write frontend code
    await fs.writeFile(
      path.join(frontendDir, 'page.tsx'),
      config.frontend
    )

    // Write tests
    await fs.writeFile(
      path.join(dir, 'tests/main.ts'),
      config.tests
    )

    // Write README
    const readme = `
# ${config.name}

${config.description}

## Smart Contracts

The smart contracts are written in Rust using the Anchor framework. They are located in the \`program\` directory.

## Frontend

The frontend is built with Next.js and is located in the \`app\` directory.

## Development

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Build the program:
   \`\`\`bash
   anchor build
   \`\`\`

3. Run tests:
   \`\`\`bash
   anchor test
   \`\`\`

4. Deploy:
   \`\`\`bash
   anchor deploy
   \`\`\`

## License

MIT
    `
    await fs.writeFile(path.join(dir, 'README.md'), readme)
  }

  private async createGithubRepo(config: DeploymentConfig) {
    const { data: repo } = await this.octokit.repos.createForAuthenticatedUser({
      name: config.name,
      description: config.description,
      private: false,
      auto_init: false
    })
    return repo
  }

  private async pushToGithub(dir: string, repoUrl: string) {
    await execAsync('git add .', { cwd: dir })
    await execAsync('git commit -m "Initial commit"', { cwd: dir })
    await execAsync(`git remote add origin ${repoUrl}`, { cwd: dir })
    await execAsync('git push -u origin main', { cwd: dir })
  }

  private async deployToVercel(dir: string) {
    // This would use Vercel API to deploy the frontend
    // For now, return a placeholder URL
    return `https://${dir}.vercel.app`
  }

  private async deployToSolana(dir: string) {
    // This would use Solana CLI to deploy the program
    // For now, return a placeholder program ID
    return '11111111111111111111111111111111'
  }
} 