#!/bin/bash
# Quick Railway deployment with timeout fixes

echo "🚀 Deploying Weather Watch to Railway (Optimized)"
echo "================================================"

# Method 1: Try optimized Docker first
echo "📦 Using optimized Dockerfile..."
cp Dockerfile.optimized Dockerfile

echo "🗑️  Setting up .dockerignore..."
# .dockerignore already created

echo "🏗️  Deploying to Railway..."
railway up

# Check if deployment succeeded
if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Getting deployment URL..."
    railway status
else
    echo "❌ Docker deployment failed. Trying alternative method..."
    
    # Method 2: Build frontend locally
    echo "🔧 Building frontend locally..."
    cd frontend
    npm install
    npm run build
    cd ..
    
    echo "📦 Using pre-built Dockerfile..."
    # Create pre-built Dockerfile
    cat > Dockerfile << 'EOF'
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
    
    echo "🏗️  Deploying pre-built version..."
    railway up
    
    if [ $? -eq 0 ]; then
        echo "✅ Pre-built deployment successful!"
        railway status
    else
        echo "❌ Still failing. Trying Nixpacks..."
        
        # Method 3: Use Nixpacks (no Docker)
        echo "🔧 Using Railway Nixpacks..."
        railway up --no-docker
    fi
fi

echo "🎉 Deployment complete!"
echo "💡 Check logs: railway logs --follow"
echo "🌐 Check status: railway status"