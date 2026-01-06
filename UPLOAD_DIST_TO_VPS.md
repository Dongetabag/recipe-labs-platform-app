# Upload Dist Folder to VPS

## Location of Dist Folder

**Local Path**: `/Users/simeonreid/AiSim Virtual Workspace/recipe-labs platform app/dist/`

## Option 1: SCP Upload (From Local Machine)

Run this command from your local machine:

```bash
cd "/Users/simeonreid/AiSim Virtual Workspace/recipe-labs platform app"
scp -r dist/* root@72.61.72.94:/var/www/recipe-labs-platform-v2/
```

Or upload the tar archive:

```bash
scp /tmp/recipe-labs-v2-dist.tar.gz root@72.61.72.94:/tmp/
```

Then on VPS, extract it:
```bash
cd /var/www/recipe-labs-platform-v2
tar -xzf /tmp/recipe-labs-v2-dist.tar.gz
```

## Option 2: Use Claude Code on VPS

Since you're in Claude Code on the VPS, you can:

1. **Ask me to upload the files** - I can help transfer them
2. **Use the tar archive** - I've created `/tmp/recipe-labs-v2-dist.tar.gz` on your local machine

## Option 3: Manual Copy

If you have the files locally, you can:
1. Zip the dist folder
2. Upload via SFTP/SCP
3. Extract on VPS

## What's in the Dist Folder

- `index.html` - Main HTML file
- `assets/` - JavaScript and CSS bundles
  - `index-*.js` - Main application bundle
  - `index-*.css` - Styles

## Quick Upload Command

```bash
# From local machine
scp -r "/Users/simeonreid/AiSim Virtual Workspace/recipe-labs platform app/dist"/* root@72.61.72.94:/var/www/recipe-labs-platform-v2/
```


