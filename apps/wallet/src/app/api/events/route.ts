import { createSSEStream } from '@agelum/backend'
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const organizationId = searchParams.get('organizationId') || 'default-org'

  return createSSEStream(organizationId)
}
