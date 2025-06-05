import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'
import { logger } from './logger'

const execAsync = promisify(exec)

interface LocalTestConfig {
  name: string
  contracts: string
  frontend: string
  tests: string
}

interface TestError extends Error {
  stdout?: string
  stderr?: string
}

export class LocalTestService {
  private static instance: LocalTestService
  private workspaceDir: string
  private isTestNetRunning: boolean = false

  private constructor() {
    this.workspaceDir = path.join(process.cwd(), 'workspace')
  }

  static getInstance(): LocalTestService {
    if (!LocalTestService.instance) {
      LocalTestService.instance = new LocalTestService()
    }
    return LocalTestService.instance
  }

  async setupLocalEnvironment(config: LocalTestConfig) {
    try {
      // Create temporary project directory
      const projectDir = path.join(this.workspaceDir, `${config.name}-test`)
      await fs.mkdir(projectDir, { recursive: true })

      // Create project structure
      await this.createProjectStructure(projectDir, config)

      // Start local Solana test validator
      await this.startTestValidator()

      // Build and deploy program
      const programId = await this.buildAndDeployProgram(projectDir)

      // Start local frontend
      const frontendUrl = await this.startLocalFrontend(projectDir)

      return {
        programId,
        frontendUrl,
        projectDir
      }
    } catch (error) {
      logger.error('Error setting up local environment', { error })
      throw new Error('Failed to setup local test environment')
    }
  }

  private async createProjectStructure(dir: string, config: LocalTestConfig) {
    // Create directories
    await fs.mkdir(path.join(dir, 'program'), { recursive: true })
    await fs.mkdir(path.join(dir, 'app'), { recursive: true })
    await fs.mkdir(path.join(dir, 'tests'), { recursive: true })

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
        'local-validator': 'solana-test-validator',
        build: 'anchor build',
        test: 'anchor test',
        'dev-frontend': 'cd app && next dev',
        'test-local': 'anchor test --provider.cluster localnet'
      },
      dependencies: {
        '@project-serum/anchor': '^0.26.0',
        '@solana/web3.js': '^1.87.6',
        next: '^13.4.0',
        react: '^18.2.0',
        'react-dom': '^18.2.0'
      },
      devDependencies: {
        '@types/mocha': '^10.0.6',
        '@types/react': '^18.2.0',
        'ts-mocha': '^10.0.0',
        typescript: '^5.3.3'
      }
    }
    await fs.writeFile(
      path.join(dir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    )

    // Write program files
    await fs.writeFile(
      path.join(dir, 'program/lib.rs'),
      config.contracts
    )

    // Write frontend files
    await fs.writeFile(
      path.join(dir, 'app/page.tsx'),
      config.frontend
    )

    // Write test files
    await fs.writeFile(
      path.join(dir, 'tests/main.ts'),
      config.tests
    )

    // Install dependencies
    await execAsync('npm install', { cwd: dir })
  }

  private async startTestValidator() {
    if (this.isTestNetRunning) return

    try {
      // Kill any existing test validator
      await execAsync('pkill -f solana-test-validator')
    } catch {
      // Ignore error if no process was running
    }

    // Start new test validator
    exec('solana-test-validator', {
      stdio: 'inherit'
    })

    // Wait for validator to start
    await new Promise(resolve => setTimeout(resolve, 2000))
    this.isTestNetRunning = true

    // Handle cleanup
    process.on('SIGINT', async () => {
      await this.cleanup()
      process.exit()
    })
  }

  private async buildAndDeployProgram(projectDir: string) {
    // Build program
    await execAsync('anchor build', { cwd: projectDir })

    // Get program ID
    const { stdout: programId } = await execAsync('anchor deploy', { cwd: projectDir })
    return programId.trim()
  }

  private async startLocalFrontend(dir: string) {
    // Start Next.js development server
    exec('npm run dev-frontend', { cwd: dir })
    return 'http://localhost:3000'
  }

  async runTests(dir: string) {
    try {
      const { stdout, stderr } = await execAsync('npm run test-local', { cwd: dir })
      return {
        success: true,
        output: stdout,
        errors: stderr
      }
    } catch (error) {
      const testError = error as TestError
      return {
        success: false,
        output: testError.stdout || '',
        errors: testError.stderr || ''
      }
    }
  }

  async cleanup() {
    if (this.isTestNetRunning) {
      try {
        await execAsync('pkill -f solana-test-validator')
        this.isTestNetRunning = false
      } catch (error) {
        logger.error('Error cleaning up test validator', { error })
      }
    }
  }
} 