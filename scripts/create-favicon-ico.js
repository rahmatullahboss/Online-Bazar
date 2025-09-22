import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function createFaviconIco() {
  try {
    const inputPath = path.join(__dirname, '..', 'public', 'favicon-32x32.png')
    const outputPath = path.join(__dirname, '..', 'public', 'favicon.ico')

    // Convert PNG to ICO using sharp
    await sharp(inputPath).toFormat('ico').toFile(outputPath)

    console.log('Favicon.ico created successfully at:', outputPath)
  } catch (error) {
    console.error('Error creating favicon.ico:', error)
  }
}

createFaviconIco()
