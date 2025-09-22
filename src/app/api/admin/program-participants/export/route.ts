import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function GET(req: NextRequest) {
  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Require admin
    const { user } = await payload.auth({ headers: req.headers })
    if (!user || (user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all program participants
    const participants = await payload.find({
      collection: 'program-participants',
      sort: '-createdAt',
      limit: 10000,
    })

    // Create CSV content
    const headers = ['Name', 'Phone Number', 'Registration Date']
    const csvContent = [
      headers.join(','),
      ...participants.docs.map((participant: any) => {
        return [
          `"${participant.name}"`,
          `"${participant.phone}"`,
          `"${new Date(participant.createdAt).toLocaleDateString()}"`
        ].join(',')
      })
    ].join('\n')

    // Set headers for CSV download
    const headersObj = new Headers()
    headersObj.set('Content-Type', 'text/csv')
    headersObj.set('Content-Disposition', 'attachment; filename="program-participants.csv"')

    return new NextResponse(csvContent, {
      status: 200,
      headers: headersObj
    })
  } catch (e: any) {
    console.error('Export participants error:', e)
    return NextResponse.json(
      {
        error: 'Failed to export participants',
        details: e.message,
      },
      { status: 500 }
    )
  }
}