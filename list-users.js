import { getPayload } from 'payload'
import config from './src/payload.config.ts'

async function listUsers() {
  try {
    const payload = await getPayload({ config: await config })

    const users = await payload.find({
      collection: 'users',
      limit: 10,
    })

    console.log('Users in database:')
    users.docs.forEach((user) => {
      console.log(`- ${user.email} (${user.firstName} ${user.lastName})`)
    })
  } catch (error) {
    console.error('Error listing users:', error)
  }
}

listUsers()
