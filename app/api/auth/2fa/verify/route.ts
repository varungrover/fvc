import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { error: '2FA not yet implemented', code: 'COMING_SOON' },
    { status: 501 },
  )
}
