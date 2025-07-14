# Deployment Guide - Coordinates Project

> For index reference format, see [INDEX_DESCRIBER.md](./INDEX_DESCRIBER.md)  <!-- IDX-DOC-00 -->

# IDX-DEPLOY-001: Quick Deployment Guide

*Get your multiplayer planetary shooter online quickly with multiple deployment options*

---

## 🚀 Quick Start - Get Online in 5 Minutes

### Option 1: Local Development (Fastest)
```bash
# Start local development server
npm run deploy:local
```
**Result**: Game available at `http://localhost:3001`

### Option 2: Heroku (Recommended for beginners)
```bash
# Deploy to Heroku (free tier available)
npm run deploy:heroku
```
**Result**: Game available at `https://your-app-name.herokuapp.com`

### Option 3: Railway (Modern alternative)
```bash
# Deploy to Railway (free tier available)
npm run deploy:railway
```
**Result**: Game available at `https://your-app-name.railway.app`

---

## 🎯 Deployment Options Overview

| Platform | Difficulty | Cost | Features | Best For |
|----------|------------|------|----------|----------|
| **Local** | ⭐ | Free | Full control | Development |
| **Heroku** | ⭐⭐ | Free/Paid | Easy deployment | Beginners |
| **Railway** | ⭐⭐ | Free/Paid | Modern platform | Quick deployment |
| **Vercel** | ⭐⭐ | Free/Paid | Static hosting | Frontend focus |
| **Netlify** | ⭐⭐ | Free/Paid | Static hosting | Frontend focus |
| **Docker** | ⭐⭐⭐ | Free | Containerized | DevOps |
| **AWS** | ⭐⭐⭐⭐⭐ | Paid | Full control | Production |

---

## 📋 Prerequisites

### Required Software
- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **Git** (for version control)

### Optional Software
- **Docker** (for containerized deployment)
- **Heroku CLI** (for Heroku deployment)
- **AWS CLI** (for AWS deployment)

### Check Installation
```bash
# Check Node.js
node --version

# Check npm
npm --version

# Check Git
git --version

# Check Docker (optional)
docker --version
```

---

## 🛠️ Step-by-Step Deployment

### 1. Build the Application
```bash
# Build the application first
npm run deploy:build
```

### 2. Choose Your Deployment Method

#### A. Local Development Server
```bash
# Start local development server
npm run deploy:local
```
- ✅ **Pros**: Fast, free, full control
- ❌ **Cons**: Only accessible locally
- 🌐 **URL**: `http://localhost:3001`

#### B. Heroku Deployment
```bash
# Deploy to Heroku
npm run deploy:heroku
```
- ✅ **Pros**: Easy, free tier, automatic HTTPS
- ❌ **Cons**: Limited resources on free tier
- 🌐 **URL**: `https://your-app-name.herokuapp.com`

#### C. Railway Deployment
```bash
# Deploy to Railway
npm run deploy:railway
```
- ✅ **Pros**: Modern, fast, good free tier
- ❌ **Cons**: Requires account setup
- 🌐 **URL**: `https://your-app-name.railway.app`

#### D. Docker Deployment
```bash
# Deploy with Docker
npm run deploy:docker
```
- ✅ **Pros**: Consistent environment, portable
- ❌ **Cons**: Requires Docker knowledge
- 🌐 **URL**: `http://localhost:3001`

#### E. AWS Deployment (Advanced)
```bash
# Full AWS deployment
npm run deploy:aws
```
- ✅ **Pros**: Full control, scalable, production-ready
- ❌ **Cons**: Complex, requires AWS knowledge, costs money
- 🌐 **URL**: `https://rekursing.com`

---

## 🔧 Advanced Configuration

### Environment Variables
Create a `.env` file for custom configuration:
```env
# Server Configuration
PORT=3001
NODE_ENV=production

# Database (if needed)
DATABASE_URL=your_database_url

# AWS Configuration (for AWS deployment)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

### Custom Port
```bash
# Set custom port
PORT=8080 npm run deploy:local
```

### Production Build
```bash
# Build for production
npm run build

# Start production server
npm run start:prod
```

---

## 🐳 Docker Deployment

### Build Docker Image
```bash
# Build image
docker build -t coordinates-game .

# Run container
docker run -p 3001:3001 coordinates-game
```

### Docker Compose
```bash
# Start with Docker Compose
docker-compose --profile prod up -d

# Stop services
docker-compose down
```

---

## ☁️ Cloud Platform Deployment

### Heroku
```bash
# Install Heroku CLI first
# Then deploy
npm run deploy:heroku
```

### Railway
```bash
# Install Railway CLI first
npm install -g @railway/cli

# Then deploy
npm run deploy:railway
```

### Vercel
```bash
# Install Vercel CLI first
npm install -g vercel

# Then deploy
npm run deploy:vercel
```

### Netlify
```bash
# Install Netlify CLI first
npm install -g netlify-cli

# Then deploy
npm run deploy:netlify
```

---

## 🚀 AWS Deployment (Production)

### Prerequisites
- AWS account with billing enabled
- AWS CLI configured
- Domain name (rekursing.com)
- Route 53 hosted zone

### Deployment Steps
```bash
# 1. Configure AWS CLI
aws configure

# 2. Deploy to AWS
npm run deploy:aws
```

### AWS Services Used
- **ECS**: Container orchestration
- **ECR**: Container registry
- **CloudFront**: CDN and HTTPS
- **Route 53**: DNS management
- **ACM**: SSL certificates
- **S3**: Static asset storage

---

## 🔍 Troubleshooting

### Common Issues

#### Build Fails
```bash
# Clear cache and reinstall
npm run clean
npm install
npm run deploy:build
```

#### Port Already in Use
```bash
# Kill process on port 3001
npx kill-port 3001

# Or use different port
PORT=3002 npm run deploy:local
```

#### Docker Issues
```bash
# Remove old containers
docker system prune -a

# Rebuild image
docker build --no-cache -t coordinates-game .
```

#### Heroku Issues
```bash
# Check Heroku logs
heroku logs --tail

# Restart app
heroku restart
```

### Performance Optimization

#### Enable Compression
```javascript
// In server.js
app.use(compression());
```

#### Enable Caching
```javascript
// Static file caching
app.use(express.static(__dirname, {
    maxAge: '1d',
    etag: true
}));
```

#### Monitor Performance
```bash
# Check server performance
npm run deploy:production

# Monitor with tools
# Press F2 for Performance Monitor
```

---

## 📊 Monitoring and Maintenance

### Health Checks
```bash
# Check application health
curl http://localhost:3001/health

# Monitor logs
npm run deploy:production
```

### Performance Monitoring
- Press **F2** in game for Performance Monitor
- Press **F3** for Network Analyzer
- Press **F1** for Debug Console

### Logs and Debugging
```bash
# View application logs
npm run deploy:production

# Debug mode
NODE_ENV=development npm run deploy:local
```

---

## 🎮 Game Features After Deployment

### Multiplayer Features
- ✅ Real-time multiplayer gameplay
- ✅ Cross-planet player visibility
- ✅ Chat system with commands
- ✅ Player statistics tracking

### AI Features
- ✅ 15 specialized AI agents
- ✅ Manager agent coordination
- ✅ Memory management system
- ✅ Automated job queuing

### Development Tools
- ✅ F1: Debug Console
- ✅ F2: Performance Monitor
- ✅ F3: Network Analyzer
- ✅ F4: Gameplay Enhancer
- ✅ F5: Game Utilities
- ✅ F6: Objectives Manager
- ✅ F7: Web Search
- ✅ F8: LM Studio Interface

---

## 🚀 Quick Commands Reference

```bash
# Quick deployment commands
npm run deploy:local      # Local development
npm run deploy:production # Production server
npm run deploy:docker     # Docker deployment
npm run deploy:heroku     # Heroku deployment
npm run deploy:railway    # Railway deployment
npm run deploy:vercel     # Vercel deployment
npm run deploy:netlify    # Netlify deployment
npm run deploy:aws        # AWS deployment
npm run deploy:build      # Build only
npm run deploy:help       # Show all options

# Development commands
npm start                 # Start development server
npm run build            # Build application
npm run server           # Start server only
npm run dev              # Start Vite dev server
npm run preview          # Preview build

# Docker commands
npm run docker:build     # Build Docker image
npm run docker:run       # Run Docker container
npm run docker:compose:dev   # Docker Compose dev
npm run docker:compose:prod  # Docker Compose prod
```

---

## 🎯 Next Steps

1. **Choose your deployment method** based on your needs
2. **Deploy the application** using the commands above
3. **Test the multiplayer features** with friends
4. **Monitor performance** using the built-in tools
5. **Scale up** as needed for more players

---

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the logs for error messages
3. Use the debug tools (F1-F8) in the game
4. Check the project documentation

---

*For full technical details and advanced deployment options, see the individual deployment scripts and AWS deployment guide.* 