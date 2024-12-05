import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdmin = token?.role === 'admin'
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')

    // If trying to access admin route without admin role
    if (isAdminRoute && !isAdmin) {
      // Redirect to home page or show unauthorized message
      return NextResponse.redirect(new URL('/', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      // Return true if user is authenticated
      authorized: ({ token }) => !!token
    },
  }
)

// Protect these routes
export const config = {
  matcher: [
    // Protected routes that require authentication
    '/admin/:path*',
    '/profile/:path*',
  ]
}
