# Railway Deployment Guide for Weather Watch

## 🚀 Why Railway?
Railway is perfect for full-stack applications because:
- ✅ No build issues (Docker-based deployment)
- ✅ Built-in PostgreSQL database
- ✅ Automatic environment variable management
- ✅ Better for Node.js/Express backends
- ✅ Free tier includes $5/month credit

## 📋 Prerequisites
- Railway account: https://railway.app
- Railway CLI: `npm install -g @railway/cli`

## 🔧 Step-by-Step Deployment

### 1. Login to Railway
```bash
railway login
```

### 2. Create New Project
```bash
railway init
```
Choose "Empty Project" and name it "weather-watch"

### 3. Add PostgreSQL Database
```bash
railway add --database
```
Choose "PostgreSQL" - this will automatically create your database

### 4. Deploy Your Application
```bash
railway up
```

### 5. Configure Environment Variables
Railway will automatically detect and suggest environment variables. You need to set:

```bash
# Railway will provide these automatically:
DATABASE_URL=postgresql://user:password@host:port/database
DATABASE_HOST=your-railway-host
DATABASE_PORT=5432
DATABASE_NAME=railway
DATABASE_USER=postgres
DATABASE_PASSWORD=your-railway-password

# You need to add these:
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-app.railway.app
```

To set environment variables:
```bash
railway variables set NODE_ENV=production
railway variables set PORT=3001
railway variables set FRONTEND_URL=https://your-app.railway.app
```

### 6. Get Your App URL
```bash
railway status
```

## 🔍 Verification Steps

1. **Check deployment status:**
```bash
railway logs
```

2. **Test health endpoint:**
```bash
curl https://your-app.railway.app/api/health
```

3. **Test database connection:**
```bash
railway run npm run dev
```

## 🛠️ Troubleshooting

### Build Issues?
- Railway uses Docker, so all dependencies will be installed correctly
- No more "vite: not found" errors!

### Database Connection Issues?
- Railway provides `DATABASE_URL` automatically
- Your app will automatically use Railway's PostgreSQL

### Port Issues?
- Railway automatically assigns a port
- Use `process.env.PORT` in your app (already configured)

### CORS Issues?
- Update `FRONTEND_URL` to your Railway app URL
- Backend CORS is already configured for Railway

## 🎯 Railway Commands Cheat Sheet

```bash
railway login              # Login to Railway
railway init              # Create new project
railway up                # Deploy your code
railway logs              # View logs
railway status            # Check status
railway variables         # Manage environment variables
railway connect           # Connect to database
railway run [command]     # Run commands in Railway environment
```

## 📊 Cost
- **Free tier**: $5/month credit
- **Database**: Included in free tier
- **Build time**: Included in free tier
- **Perfect for**: Small to medium projects

## 🔄 Migration from Vercel
Since you're switching from Vercel:
1. ✅ No need to change your code
2. ✅ Database will be automatically created
3. ✅ Environment variables are easier to manage
4. ✅ Full-stack deployment works perfectly

## 🚀 Deploy Now!
```bash
# One-command deployment
railway login
railway init
railway add --database
railway up
```

Your Weather Watch app will be live in minutes! 🎉