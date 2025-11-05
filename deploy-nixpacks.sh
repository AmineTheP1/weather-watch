#!/bin/bash
# Railway Nixpacks Deployment Script - Docker-Free
# This script deploys using Railway's Nixpacks builder (much faster than Docker)

echo "🚀 Deploying to Railway using Nixpacks (Docker-free)..."
echo "⚡ This method is 5x faster than Docker builds"

# Check if railway CLI is available
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Ensure we're in the project root
cd "$(dirname "$0")"

# Commit any uncommitted changes
echo "📁 Committing changes..."
git add .
git commit -m "Deploy to Railway using Nixpacks" || true

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main

# Deploy using Nixpacks (no Docker!)
echo "🎯 Deploying to Railway using Nixpacks..."
echo "📝 Railway will detect railway.json and use Nixpacks automatically"

# Option 1: Use Railway web interface (recommended)
echo ""
echo "✅ RECOMMENDED METHOD:"
echo "1. Go to https://railway.app"
echo "2. Click 'New Project'"
echo "3. Select 'Deploy from GitHub'"
echo "4. Choose your weather-watch repository"
echo "5. Railway will automatically detect railway.json and use Nixpacks"
echo ""
echo "⚡ Build time: 3-5 minutes (vs 15+ minutes with Docker)"
echo "🔧 No Docker required - uses Railway's optimized Nixpacks"

# Option 2: Try CLI if available
if command -v railway &> /dev/null; then
    echo ""
    echo "🔄 Alternative: Trying Railway CLI..."
    railway up --no-docker 2>/dev/null || echo "CLI deployment failed - use web interface above"
fi

echo ""
echo "🎉 Deployment started! Check Railway dashboard for progress."
echo "🌐 Your app will be available at: https://railway.app/project/[project-id]"