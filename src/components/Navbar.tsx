'use client'

import { FC } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { TabBar } from '@/components/TabBar'

const WalletMultiButtonDynamic = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((m) => m.WalletMultiButton),
  { ssr: false }
)

export const Navbar: FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A] border-b border-[#1F2937] backdrop-blur-sm">
      <div className="max-w-[900px] mx-auto px-6 h-16 flex items-center gap-4">
        <Link href="/" className="text-xl font-semibold text-white hover:text-[#00FF9D] transition-colors mr-4 shrink-0">
          AI Hub
        </Link>
        <TabBar />
        <div className="shrink-0 ml-auto">
          <WalletMultiButtonDynamic />
        </div>
      </div>
    </nav>
  )
} 