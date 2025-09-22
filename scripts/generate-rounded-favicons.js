import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'
import { promises as fs } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function generateRoundedFavicon() {
  try {
    const inputPath = path.join(__dirname, '..', 'public', 'icon.png')
    const outputPath = path.join(__dirname, '..', 'public', 'favicon-round.png')

    // Check if input file exists
    try {
      await fs.access(inputPath)
    } catch (error) {
      console.error('Input icon.png file not found in public directory')
      return
    }

    // Generate rounded favicon with transparent background
    await sharp(inputPath)
      .resize(192, 192) // Standard size for most favicons
      .composite([
        {
          input: Buffer.from(
            `<svg width="192" height="192" xmlns="http://www.w3.org/2000/svg">
            <circle cx="96" cy="96" r="96" fill="white"/>
          </svg>`,
          ),
          blend: 'dest-in',
        },
      ])
      .png({ compressionLevel: 9 })
      .toFile(outputPath)

    console.log('Rounded favicon generated successfully at:', outputPath)

    // Also generate other standard sizes
    const sizes = [16, 32, 48, 192]
    for (const size of sizes) {
      const sizeOutputPath = path.join(__dirname, '..', 'public', `favicon-${size}x${size}.png`)
      await sharp(inputPath)
        .resize(size, size)
        .composite([
          {
            input: Buffer.from(
              `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
              <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/>
            </svg>`,
            ),
            blend: 'dest-in',
          },
        ])
        .png({ compressionLevel: 9 })
        .toFile(sizeOutputPath)

      console.log(`Generated ${size}x${size} favicon`)
    }
  } catch (error) {
    console.error('Error generating rounded favicon:', error)
  }
}

generateRoundedFavicon()
