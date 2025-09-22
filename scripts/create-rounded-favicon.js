import sharp from 'sharp'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function createRoundedFavicon() {
  try {
    const inputPath = path.join(__dirname, '..', 'src', 'app', 'icon.png')
    const outputPath = path.join(__dirname, '..', 'public', 'favicon-round.png')

    // Check if input file exists
    if (!fs.existsSync(inputPath)) {
      console.error('Input icon.png not found at:', inputPath)
      return
    }

    // Standard favicon size
    const faviconSize = 192

    // Create a rounded version
    // First create a circular mask
    const mask = Buffer.from(
      `<svg width="${faviconSize}" height="${faviconSize}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${faviconSize / 2}" cy="${faviconSize / 2}" r="${faviconSize / 2}" fill="white"/>
      </svg>`,
    )

    await sharp({
      create: {
        width: faviconSize,
        height: faviconSize,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([
        {
          input: await sharp(inputPath)
            .resize(faviconSize, faviconSize, { fit: 'cover' })
            .toBuffer(),
          blend: 'over',
        },
        {
          input: mask,
          blend: 'dest-in',
        },
      ])
      .png()
      .toFile(outputPath)

    console.log('Rounded favicon created at:', outputPath)

    // Also create standard favicon sizes
    const sizes = [16, 32, 48, 192]
    for (const size of sizes) {
      const sizePath = path.join(__dirname, '..', 'public', `favicon-${size}x${size}.png`)
      await sharp(inputPath).resize(size, size, { fit: 'cover' }).png().toFile(sizePath)
      console.log(`Favicon ${size}x${size} created at:`, sizePath)
    }
  } catch (error) {
    console.error('Error creating rounded favicon:', error)
  }
}

createRoundedFavicon()
