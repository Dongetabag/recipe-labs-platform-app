#!/bin/bash
# Recipe Labs V2 Platform - VPS Deployment Script
# Run this from your local machine to deploy to VPS

set -e

VPS_HOST="72.61.72.94"
VPS_USER="root"
VPS_KEY="${VPS_KEY:-$HOME/.ssh/id_ed25519_vps}"
DEPLOY_PATH="/var/www/recipe-labs-platform-v2"
LOCAL_DIST="./dist"

echo "🚀 Deploying Recipe Labs V2 Platform to VPS..."
echo ""

# Step 1: Build the application
echo "📦 Step 1: Building application..."
npm run build
echo "✅ Build complete"
echo ""

# Step 2: Create deployment directory on VPS
echo "📁 Step 2: Creating deployment directory on VPS..."
ssh -i "${VPS_KEY}" -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} << 'EOF'
mkdir -p /var/www/recipe-labs-platform-v2
chmod 755 /var/www/recipe-labs-platform-v2
EOF
echo "✅ Directory created"
echo ""

# Step 3: Copy files to VPS
echo "📤 Step 3: Copying files to VPS..."
ssh -i "${VPS_KEY}" -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} "mkdir -p ${DEPLOY_PATH}/dist"
scp -i "${VPS_KEY}" -o StrictHostKeyChecking=no -r ${LOCAL_DIST}/* ${VPS_USER}@${VPS_HOST}:${DEPLOY_PATH}/dist/
echo "✅ Files copied"
echo ""

# Step 4: Configure Nginx (if needed)
echo "⚙️  Step 4: Checking Nginx configuration..."
ssh -i "${VPS_KEY}" -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} << 'EOF'
# Check if Nginx config exists
if [ ! -f /etc/nginx/sites-available/recipe-labs-platform-v2 ]; then
  echo "Creating Nginx configuration..."
  cat > /etc/nginx/sites-available/recipe-labs-platform-v2 << 'NGINX_CONFIG'
server {
    listen 3003;
    server_name 72.61.72.94;
    root /var/www/recipe-labs-platform-v2;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
NGINX_CONFIG

  # Enable site
  ln -sf /etc/nginx/sites-available/recipe-labs-platform-v2 /etc/nginx/sites-enabled/
  
  # Test and reload Nginx
  nginx -t && systemctl reload nginx
  echo "✅ Nginx configured"
else
  echo "✅ Nginx configuration already exists"
fi
EOF
echo ""

# Step 5: Verify deployment
echo "🧪 Step 5: Verifying deployment..."
ssh -i "${VPS_KEY}" -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} << 'EOF'
echo "Checking files..."
ls -la /var/www/recipe-labs-platform-v2/ | head -10
echo ""
echo "Testing Nginx..."
curl -I http://localhost:3003 2>/dev/null | head -5 || echo "Nginx not responding"
EOF
echo ""

echo "✅ Deployment complete!"
echo ""
echo "🌐 Access the platform at:"
echo "   http://${VPS_HOST}:3003"
echo ""
echo "📝 Next Steps:"
echo "   1. Test the platform in browser"
echo "   2. Verify Agent Chat Widget appears"
echo "   3. Test agent communication"
echo "   4. Configure environment variables if needed"

