import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
 
export async function POST() {
  const chatId = nanoid()
  return NextResponse.json({ id: chatId })
} 