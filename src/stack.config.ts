import { StackClientApp, StackServerApp } from '@stackframe/stack'

const projectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID
const publishableClientKey = process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY
const serverSecret = process.env.STACK_SECRET_SERVER_KEY

const missingClientValues: string[] = []
if (!projectId) missingClientValues.push('NEXT_PUBLIC_STACK_PROJECT_ID')
if (!publishableClientKey) missingClientValues.push('NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY')

if (missingClientValues.length > 0) {
  throw new Error(
    `Stack Auth is missing required client env vars: ${missingClientValues.join(
      ', ',
    )}. Please add them to your .env.local file.`,
  )
}

export const stackClientApp = new StackClientApp({
  projectId,
  publishableClientKey,
  tokenStore: 'nextjs-cookie',
})

let serverApp: StackServerApp | undefined

if (typeof window === 'undefined') {
  if (!serverSecret) {
    throw new Error(
      'Stack Auth is missing STACK_SECRET_SERVER_KEY. Copy it from the Stack dashboard and set it in your environment.',
    )
  }

  serverApp = new StackServerApp({
    projectId,
    secretServerKey: serverSecret,
    tokenStore: 'nextjs-cookie',
  })
}

export const stackServerApp = serverApp
