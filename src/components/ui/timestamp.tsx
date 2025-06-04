'use client'

import { useEffect, useState } from 'react'

interface TimestampProps {
  isoString: string
  className?: string
}

export function Timestamp({ isoString, className }: TimestampProps) {
  const [formattedTime, setFormattedTime] = useState('')

  useEffect(() => {
    const date = new Date(isoString)
    setFormattedTime(date.toLocaleTimeString())
  }, [isoString])

  return <span className={className}>{formattedTime}</span>
} 