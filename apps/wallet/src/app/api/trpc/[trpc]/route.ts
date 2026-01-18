import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '@repo/backend'

const handler = (req: Request) => {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => ({
      // Add context like user authentication here
      userId: 'default-user', // TODO: Get from session/auth
    }),
  })
}

export { handler as GET, handler as POST }
