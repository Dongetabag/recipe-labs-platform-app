#!/bin/bash
# Start a simple HTTP server to serve the dist folder
# Run this in Warp terminal on your local machine

cd "/Users/simeonreid/AiSim Virtual Workspace/recipe-labs platform app/dist"

echo "🌐 Starting HTTP server on port 8000..."
echo "📁 Serving files from: $(pwd)"
echo ""
echo "📥 On VPS, run this command to download:"
echo "   curl -L http://$(ipconfig getifaddr en0 2>/dev/null || hostname -I | awk '{print $1}'):8000 | tar -xz -C /var/www/recipe-labs-platform-v2/"
echo ""
echo "Or download files individually:"
echo "   mkdir -p /var/www/recipe-labs-platform-v2/assets"
echo "   curl http://YOUR_LOCAL_IP:8000/index.html -o /var/www/recipe-labs-platform-v2/index.html"
echo "   curl http://YOUR_LOCAL_IP:8000/assets/index-DJQ8ZZcd.js -o /var/www/recipe-labs-platform-v2/assets/index-DJQ8ZZcd.js"
echo "   curl http://YOUR_LOCAL_IP:8000/assets/index-tn0RQdqM.css -o /var/www/recipe-labs-platform-v2/assets/index-tn0RQdqM.css"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python3 -m http.server 8000


