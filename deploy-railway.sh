#!/bin/bash

# Railway Deployment Script for Weather Watch
echo "🚀 Deploying Weather Watch to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Login to Railway
echo "🔐 Logging in to Railway..."
railway login

# Initialize Railway project (if not already done)
if [ ! -f "railway.json" ]; then
    echo "📝 Initializing Railway project..."
    railway init
fi

# Add PostgreSQL database
echo "🗄️ Adding PostgreSQL database..."
railway add --database

# Deploy to Railway
echo "🚀 Deploying to Railway..."
railway up

# Show status
echo "📊 Deployment status:"
railway status

# Show logs
echo "📋 Recent logs:"
railway logs

echo "✅ Deployment complete!"
echo "🌐 Your Weather Watch app should be live on Railway!"
echo ""
echo "Next steps:"
echo "1. Check your Railway dashboard for the app URL"
echo "2. Set FRONTEND_URL environment variable to your app URL"
echo "3. Test your API endpoints"
echo "4. Check Railway logs for any issues"