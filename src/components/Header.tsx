'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Header() {
  const pathname = usePathname()

  return (
    <header className="border-b border-gray-800 bg-black">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold text-white">
            AI Hub
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/create"
              className={`text-sm ${
                pathname === '/create' 
                  ? 'text-white' 
                  : 'text-gray-400 hover:text-white transition-colors'
              }`}
            >
              Create
            </Link>
            <Link
              href="/showcase"
              className={`text-sm ${
                pathname === '/showcase'
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white transition-colors'
              }`}
            >
              Showcase
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-sm bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Sign up
          </Link>
        </div>
      </div>
    </header>
  )
} 