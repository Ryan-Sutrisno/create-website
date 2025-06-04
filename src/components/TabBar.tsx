'use client'

import { FC } from 'react'
import { useTabs } from '@/context/TabsProvider'
import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export const TabBar: FC = () => {
  const router = useRouter()
  const { tabs, activeTab, setActiveTab, removeTab } = useTabs()

  return (
    <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={cn(
            'flex items-center rounded-lg text-sm transition-colors',
            activeTab === tab.id
              ? 'bg-secondary text-secondary-foreground'
              : 'hover:bg-secondary/50 text-muted-foreground'
          )}
        >
          <button 
            onClick={() => { 
              setActiveTab(tab.id)
              router.push(`/chat/${tab.id}`) 
            }} 
            className="px-3 py-1.5"
          >
            {tab.title.length > 15 ? tab.title.slice(0, 15) + '…' : tab.title}
          </button>
          <button 
            onClick={() => removeTab(tab.id)} 
            className="p-1 hover:bg-black/10 rounded-r-lg"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  )
} 