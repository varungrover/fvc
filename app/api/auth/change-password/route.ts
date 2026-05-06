import { NextResponse, type NextRequest } from 'next/server'
import { changePasswordAction } from '@/app/actions/auth'

export async function POST(request: NextRequest) {
  let body: { password?: string; confirm?: string } = {}
  try {
    body = await request.json()
  } catch {
    // malformed JSON — treat as empty
  }

  const formData = new FormData()
  formData.set('password', body.password ?? '')
  formData.set('confirm', body.confirm ?? '')

  try {
    const result = await changePasswordAction(formData)
    // changePasswordAction redirects on success — if we reach here, there was an error
    return NextResponse.json(result, { status: 400 })
  } catch (e: unknown) {
    // Next.js redirect() throws — treat as success
    if (
      e instanceof Error &&
      (e.message === 'NEXT_REDIRECT' || (e as { digest?: string }).digest?.startsWith('NEXT_REDIRECT'))
    ) {
      return NextResponse.json({ ok: true })
    }
    throw e
  }
}
