'use client'

import React, { createContext, useContext, useState } from 'react'
import { nanoid } from 'nanoid'

interface Tab {
  id: string
  title: string
}

interface TabsContextType {
  tabs: Tab[]
  activeTab: string | null
  addTab: (title: string) => string
  removeTab: (id: string) => void
  setActiveTab: (id: string) => void
}

const TabsContext = createContext<TabsContextType | undefined>(undefined)

export function TabsProvider({ children }: { children: React.ReactNode }) {
  const [tabs, setTabs] = useState<Tab[]>([])
  const [activeTab, setActiveTab] = useState<string | null>(null)

  const addTab = (title: string) => {
    const id = nanoid()
    setTabs(prev => [...prev, { id, title }])
    setActiveTab(id)
    return id
  }

  const removeTab = (id: string) => {
    setTabs(prev => prev.filter(tab => tab.id !== id))
    if (activeTab === id) {
      const remainingTabs = tabs.filter(tab => tab.id !== id)
      setActiveTab(remainingTabs[0]?.id || null)
    }
  }

  return (
    <TabsContext.Provider value={{ tabs, activeTab, addTab, removeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  )
}

export function useTabs() {
  const context = useContext(TabsContext)
  if (context === undefined) {
    throw new Error('useTabs must be used within a TabsProvider')
  }
  return context
} 