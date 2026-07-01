import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/api/auth/signin',
  },
})

export const config = {
  matcher: ['/faq', '/cuenta', '/mi-cuenta', '/salidas-pdf'],
}
