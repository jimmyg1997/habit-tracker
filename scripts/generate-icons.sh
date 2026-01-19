#!/bin/bash

# Script to generate PWA icons from a source image
# Usage: ./scripts/generate-icons.sh path/to/source-image.png

SOURCE_IMAGE=$1

if [ -z "$SOURCE_IMAGE" ]; then
  echo "Usage: ./scripts/generate-icons.sh path/to/source-image.png"
  echo "The source image should be at least 512x512px"
  exit 1
fi

if [ ! -f "$SOURCE_IMAGE" ]; then
  echo "Error: Source image not found: $SOURCE_IMAGE"
  exit 1
fi

echo "Generating PWA icons from $SOURCE_IMAGE..."

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
  echo "Error: ImageMagick is not installed."
  echo "Install it with: brew install imagemagick (Mac) or apt-get install imagemagick (Linux)"
  exit 1
fi

# Create public directory if it doesn't exist
mkdir -p public

# Generate icons
convert "$SOURCE_IMAGE" -resize 16x16 public/favicon-16x16.png
convert "$SOURCE_IMAGE" -resize 32x32 public/favicon-32x32.png
convert "$SOURCE_IMAGE" -resize 64x64 public/pwa-64x64.png
convert "$SOURCE_IMAGE" -resize 192x192 public/pwa-192x192.png
convert "$SOURCE_IMAGE" -resize 512x512 public/pwa-512x512.png
convert "$SOURCE_IMAGE" -resize 512x512 public/maskable-icon-512x512.png
convert "$SOURCE_IMAGE" -resize 180x180 public/apple-touch-icon.png

echo "✅ Icons generated successfully in public/ folder!"
echo ""
echo "Generated files:"
echo "  - favicon-16x16.png"
echo "  - favicon-32x32.png"
echo "  - pwa-64x64.png"
echo "  - pwa-192x192.png"
echo "  - pwa-512x512.png"
echo "  - maskable-icon-512x512.png"
echo "  - apple-touch-icon.png"

