import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function GET() {
  try {
    const payload = await getPayload({ config: await config })
    const media = await payload.find({ collection: 'media', limit: 1 }).catch((e) => {
      throw new Error(`media table check failed: ${e?.message || e}`)
    })
    const items = await payload.find({ collection: 'items', limit: 1 }).catch((e) => {
      throw new Error(`items table check failed: ${e?.message || e}`)
    })

    return NextResponse.json({
      ok: true,
      mediaTable: true,
      itemsTable: true,
      counts: { media: media.totalDocs, items: items.totalDocs },
    })
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: String(err?.message || err),
      },
      { status: 500 },
    )
  }
}
