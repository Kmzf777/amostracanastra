import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/session'

export async function middleware(request: NextRequest) {
  // Protege rotas que começam com /admin/dashboard
  if (request.nextUrl.pathname.startsWith('/admin/dashboard')) {
    const cookie = request.cookies.get('session')?.value
    const session = await decrypt(cookie)

    if (!session?.userId) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/dashboard/:path*'],
}