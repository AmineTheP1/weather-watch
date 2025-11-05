# Railway Build Timeout Fix Guide

## 🚨 Problem: Build Timeout Error

Railway's free tier has build time limits (usually 15-20 minutes). Large Docker images or slow builds can exceed this limit.

## ✅ Quick Fix: Optimized Deployment

### Method 1: Use Optimized Dockerfile (Recommended)

1. **Use the new optimized Dockerfile:**
```bash
# Copy the optimized Dockerfile
cp Dockerfile.optimized Dockerfile

# Deploy to Railway
railway up
```

### Method 2: Pre-build Frontend (Faster)

1. **Build frontend locally first:**
```bash
cd frontend
npm install
npm run build
cd ..
```

2. **Use pre-built Dockerfile:**
```bash
# Create pre-built Dockerfile
cat > Dockerfile.prebuilt << 'EOF'
FROM node:18-alpine

# Install PostgreSQL client
RUN apk add --no-cache postgresql-client

WORKDIR /app

# Copy backend only
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production

COPY backend/ ./backend/

# Copy pre-built frontend
COPY frontend/dist ./frontend/dist/

EXPOSE 3001

CMD ["node", "backend/server.js"]
EOF
```

3. **Deploy with pre-built version:**
```bash
cp Dockerfile.prebuilt Dockerfile
railway up
```

### Method 3: Railway CLI Build (No Docker)

1. **Create railway.json config:**
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && cd frontend && npm install && npm run build && cd ../backend && npm install"
  },
  "deploy": {
    "startCommand": "node backend/server.js",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

2. **Deploy without Docker:**
```bash
railway up --no-docker
```

## 🚀 Speed Optimization Tips

### 1. Use Alpine Linux
- ✅ Already using `node:18-alpine` (smaller base image)

### 2. Optimize .dockerignore
```bash
cat > .dockerignore << 'EOF'
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
frontend/node_modules
backend/node_modules
*.log
.DS_Store
Thumbs.db
EOF
```

### 3. Cache Dependencies
```dockerfile
# Copy package files first (cached layer)
COPY package*.json ./
RUN npm ci --only=production

# Then copy source code
COPY . .
```

### 4. Use Railway's Build Cache
```bash
# Enable build caching
railway variables set RAILWAY_CACHE_BUILD=true
```

## 🔄 Alternative: Switch to Render.com

If Railway continues to timeout, try Render (free tier):

1. **Create render.yaml:**
```yaml
services:
  - type: web
    name: weather-watch
    env: node
    buildCommand: npm install && cd frontend && npm install && npm run build
    startCommand: node backend/server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: weather-db
          property: connectionString

databases:
  - name: weather-db
    plan: free
```

2. **Deploy to Render:**
```bash
git push origin main  # Connect to Render GitHub integration
```

## 🎯 Recommended Action Plan

**For immediate fix:**
```bash
# 1. Use optimized Dockerfile
cp Dockerfile.optimized Dockerfile

# 2. Add .dockerignore
echo "node_modules" >> .dockerignore
echo "frontend/node_modules" >> .dockerignore
echo "backend/node_modules" >> .dockerignore

# 3. Deploy
railway up
```

**If still timing out:**
```bash
# Build frontend locally first
cd frontend && npm install && npm run build && cd ..

# Use pre-built approach
cp Dockerfile.prebuilt Dockerfile
railway up
```

**Last resort:**
- Try Method 3 (Nixpacks build)
- Or switch to Render.com

## 📞 Need Help?
- Railway Discord: https://discord.gg/railway
- Railway Docs: https://docs.railway.app
- Check build logs: `railway logs --follow`