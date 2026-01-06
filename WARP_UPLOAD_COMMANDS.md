# Upload Dist Files to VPS - Warp Terminal Commands

## Quick Upload Method

### Step 1: Get Your Local IP Address

Run this in Warp:
```bash
ipconfig getifaddr en0
```

Or if that doesn't work:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1
```

### Step 2: Start Local HTTP Server

Run this in Warp (in a new terminal tab):
```bash
cd "/Users/simeonreid/AiSim Virtual Workspace/recipe-labs platform app/dist"
python3 -m http.server 8000
```

Keep this running!

### Step 3: Download on VPS (in Claude Code)

Replace `YOUR_LOCAL_IP` with the IP from Step 1:

```bash
mkdir -p /var/www/recipe-labs-platform-v2/assets
cd /var/www/recipe-labs-platform-v2

# Download files
curl http://YOUR_LOCAL_IP:8000/index.html -o index.html
curl http://YOUR_LOCAL_IP:8000/assets/index-DJQ8ZZcd.js -o assets/index-DJQ8ZZcd.js
curl http://YOUR_LOCAL_IP:8000/assets/index-tn0RQdqM.css -o assets/index-tn0RQdqM.css

# Set permissions
chmod -R 755 /var/www/recipe-labs-platform-v2

# Verify
ls -la /var/www/recipe-labs-platform-v2
```

---

## Alternative: Use SCP with SSH Key

If you have SSH key access, run this in Warp:

```bash
cd "/Users/simeonreid/AiSim Virtual Workspace/recipe-labs platform app"
scp -i ~/.ssh/id_rsa -r dist/* root@72.61.72.94:/var/www/recipe-labs-platform-v2/
```

Or if your SSH key is in a different location:
```bash
scp -i /path/to/your/ssh/key -r dist/* root@72.61.72.94:/var/www/recipe-labs-platform-v2/
```

---

## Alternative: Use the Tar Archive

I've created a tar archive at `/tmp/recipe-labs-v2-dist.tar.gz`

**In Warp (local machine)**:
```bash
scp /tmp/recipe-labs-v2-dist.tar.gz root@72.61.72.94:/tmp/
```

**Then in Claude Code (VPS)**:
```bash
mkdir -p /var/www/recipe-labs-platform-v2
cd /var/www/recipe-labs-platform-v2
tar -xzf /tmp/recipe-labs-v2-dist.tar.gz
chmod -R 755 /var/www/recipe-labs-platform-v2
```

---

## Files to Upload

1. `index.html` (8.8 KB)
2. `assets/index-DJQ8ZZcd.js` (560 KB)
3. `assets/index-tn0RQdqM.css` (empty file, but needed)

**Total size**: ~570 KB


