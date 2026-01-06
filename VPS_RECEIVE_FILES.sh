#!/bin/bash
# Script to run on VPS to receive and set up Recipe Labs V2 Platform files
# This can be run in Claude Code on the VPS

echo "📥 Setting up Recipe Labs V2 Platform on VPS..."
echo ""

# Create deployment directory
mkdir -p /var/www/recipe-labs-platform-v2
cd /var/www/recipe-labs-platform-v2

echo "✅ Directory created: /var/www/recipe-labs-platform-v2"
echo ""
echo "📋 Next steps:"
echo "1. Upload the dist folder contents to this directory"
echo "2. Or use the commands below to download from a temporary location"
echo ""
echo "The dist folder should contain:"
echo "  - index.html"
echo "  - assets/index-*.js"
echo "  - assets/index-*.css"
echo ""
echo "Once files are uploaded, run:"
echo "  chmod -R 755 /var/www/recipe-labs-platform-v2"
echo "  ls -la /var/www/recipe-labs-platform-v2"


