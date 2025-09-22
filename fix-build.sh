#!/bin/bash
# Build Fix Script for Vercel Deployment

echo "🔧 Fixing build issues for Vercel deployment..."

# Generate types first
echo "📝 Generating Payload types..."
pnpm generate:types

# Generate import map
echo "🗺️ Generating import map..."
pnpm generate:importmap

# Test build locally
echo "🔨 Testing build locally..."
pnpm build

echo "✅ Build fix complete!"
echo ""
echo "🚀 Ready to deploy to Vercel!"
echo ""
echo "Next steps:"
echo "1. git add ."
echo "2. git commit -m 'Fix: Resolve Vercel build issues'"  
echo "3. git push origin main"