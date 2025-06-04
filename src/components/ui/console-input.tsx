'use client'

import * as React from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ArrowUp, Mic, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConsoleInputProps extends React.ComponentPropsWithoutRef<'div'> {
  onSubmit: (value: string) => void
  placeholder?: string
  defaultValue?: string
  loading?: boolean
}

export function ConsoleInput({
  onSubmit,
  placeholder = "Build me a beautiful landing page for...",
  defaultValue = "",
  loading = false,
  className,
  ...props
}: ConsoleInputProps) {
  const [value, setValue] = React.useState(defaultValue)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!value.trim() || loading) return
    onSubmit(value.trim())
    setValue("")
  }

  return (
    <div className={cn("bg-[#0A0A0A] rounded-xl overflow-hidden border border-[#1a1a1a]", className)} {...props}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <Mic className="w-4 h-4 text-[#666]" />
        </div>
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="border-0 bg-transparent pl-11 pr-20 py-5 text-[15px] placeholder:text-[#666] focus-visible:ring-0 text-white"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            type="button"
            className="h-8 w-8 hover:bg-[#1a1a1a] text-[#666]"
          >
            <Settings className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-1 px-2 py-1.5 rounded bg-[#1a1a1a] text-[#666] text-sm">
            E-1
            <ArrowUp className="w-3 h-3" />
          </div>
        </div>
      </form>
      <div className="px-4 py-2 flex items-center gap-3 border-t border-[#1a1a1a]">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00FF9D]" />
          <span className="text-[#00FF9D] text-xs">Connected</span>
        </div>
        <div className="h-3 w-px bg-[#1a1a1a]" />
        <Button
          size="icon"
          variant="ghost"
          className="ml-auto h-7 w-7 hover:bg-[#1a1a1a] text-white"
          onClick={handleSubmit}
          disabled={loading}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
} 