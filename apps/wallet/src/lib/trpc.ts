import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '@repo/backend'

export const trpc = createTRPCReact<AppRouter>()
