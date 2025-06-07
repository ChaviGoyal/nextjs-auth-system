// middleware.js
import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'

export function middleware(request) {
  const token = request.cookies.get('token')?.value

  if (!token) {
    console.log('🚫 No token found in cookie')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    verifyToken(token)
    return NextResponse.next()
  } catch (err) {
    console.log('❌ Token verification failed:', err.message)
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: ['/dashboard'],
}
