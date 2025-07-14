/**
 * Simple Deployment Script for Coordinates Project
 * Provides multiple deployment options for getting the project online
 * IDX-DEPLOY-010: Simple Deployment Script
 * 
 * For index reference format, see INDEX_DESCRIBER.md
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SimpleDeployer {
    constructor() {
        this.projectName = 'coordinates-game';
        this.port = process.env.PORT || 3001;
    }

    // IDX-DEPLOY-011: Build Application
    async build() {
        console.log('🏗️  Building application...');
        
        try {
            // Install dependencies
            console.log('📦 Installing dependencies...');
            execSync('npm install', { stdio: 'inherit' });
            
            // Build the application
            console.log('🔨 Building with Vite...');
            execSync('npm run build', { stdio: 'inherit' });
            
            console.log('✅ Build completed successfully');
            return true;
        } catch (error) {
            console.error('❌ Build failed:', error.message);
            return false;
        }
    }

    // IDX-DEPLOY-012: Local Development Server
    async startLocal() {
        console.log('🚀 Starting local development server...');
        
        try {
            // Start the development server
            console.log(`🌐 Starting server on port ${this.port}...`);
            execSync(`npm start`, { stdio: 'inherit' });
        } catch (error) {
            console.error('❌ Failed to start local server:', error.message);
        }
    }

    // IDX-DEPLOY-013: Production Server
    async startProduction() {
        console.log('🚀 Starting production server...');
        
        try {
            // Start the production server
            console.log(`🌐 Starting production server on port ${this.port}...`);
            execSync(`npm run start:prod`, { stdio: 'inherit' });
        } catch (error) {
            console.error('❌ Failed to start production server:', error.message);
        }
    }

    // IDX-DEPLOY-014: Docker Deployment
    async deployDocker() {
        console.log('🐳 Deploying with Docker...');
        
        try {
            // Build Docker image
            console.log('🔨 Building Docker image...');
            execSync('docker build -t coordinates-game .', { stdio: 'inherit' });
            
            // Run Docker container
            console.log('🚀 Running Docker container...');
            execSync(`docker run -p ${this.port}:3001 coordinates-game`, { stdio: 'inherit' });
        } catch (error) {
            console.error('❌ Docker deployment failed:', error.message);
        }
    }

    // IDX-DEPLOY-015: Docker Compose Deployment
    async deployDockerCompose() {
        console.log('🐳 Deploying with Docker Compose...');
        
        try {
            // Start with Docker Compose
            console.log('🚀 Starting with Docker Compose...');
            execSync('docker-compose --profile prod up -d', { stdio: 'inherit' });
            
            console.log('✅ Docker Compose deployment completed');
            console.log(`🌐 Application should be available at http://localhost:${this.port}`);
        } catch (error) {
            console.error('❌ Docker Compose deployment failed:', error.message);
        }
    }

    // IDX-DEPLOY-016: Heroku Deployment
    async deployHeroku() {
        console.log('🚀 Deploying to Heroku...');
        
        try {
            // Check if Heroku CLI is installed
            try {
                execSync('heroku --version', { stdio: 'pipe' });
            } catch (error) {
                console.error('❌ Heroku CLI not found. Please install it first.');
                return;
            }
            
            // Create Heroku app if it doesn't exist
            console.log('📱 Creating Heroku app...');
            try {
                execSync('heroku create coordinates-game', { stdio: 'inherit' });
            } catch (error) {
                console.log('ℹ️  App might already exist, continuing...');
            }
            
            // Deploy to Heroku
            console.log('📤 Deploying to Heroku...');
            execSync('git push heroku main', { stdio: 'inherit' });
            
            // Open the app
            console.log('🌐 Opening Heroku app...');
            execSync('heroku open', { stdio: 'inherit' });
            
            console.log('✅ Heroku deployment completed');
        } catch (error) {
            console.error('❌ Heroku deployment failed:', error.message);
        }
    }

    // IDX-DEPLOY-017: Vercel Deployment
    async deployVercel() {
        console.log('🚀 Deploying to Vercel...');
        
        try {
            // Check if Vercel CLI is installed
            try {
                execSync('vercel --version', { stdio: 'pipe' });
            } catch (error) {
                console.log('📦 Installing Vercel CLI...');
                execSync('npm install -g vercel', { stdio: 'inherit' });
            }
            
            // Deploy to Vercel
            console.log('📤 Deploying to Vercel...');
            execSync('vercel --prod', { stdio: 'inherit' });
            
            console.log('✅ Vercel deployment completed');
        } catch (error) {
            console.error('❌ Vercel deployment failed:', error.message);
        }
    }

    // IDX-DEPLOY-018: Netlify Deployment
    async deployNetlify() {
        console.log('🚀 Deploying to Netlify...');
        
        try {
            // Check if Netlify CLI is installed
            try {
                execSync('netlify --version', { stdio: 'pipe' });
            } catch (error) {
                console.log('📦 Installing Netlify CLI...');
                execSync('npm install -g netlify-cli', { stdio: 'inherit' });
            }
            
            // Deploy to Netlify
            console.log('📤 Deploying to Netlify...');
            execSync('netlify deploy --prod --dir=dist', { stdio: 'inherit' });
            
            console.log('✅ Netlify deployment completed');
        } catch (error) {
            console.error('❌ Netlify deployment failed:', error.message);
        }
    }

    // IDX-DEPLOY-019: Railway Deployment
    async deployRailway() {
        console.log('🚀 Deploying to Railway...');
        
        try {
            // Check if Railway CLI is installed
            try {
                execSync('railway --version', { stdio: 'pipe' });
            } catch (error) {
                console.log('📦 Installing Railway CLI...');
                execSync('npm install -g @railway/cli', { stdio: 'inherit' });
            }
            
            // Login to Railway
            console.log('🔐 Logging into Railway...');
            execSync('railway login', { stdio: 'inherit' });
            
            // Deploy to Railway
            console.log('📤 Deploying to Railway...');
            execSync('railway up', { stdio: 'inherit' });
            
            console.log('✅ Railway deployment completed');
        } catch (error) {
            console.error('❌ Railway deployment failed:', error.message);
        }
    }

    // IDX-DEPLOY-020: Show Deployment Options
    showOptions() {
        console.log(`
🚀 Coordinates Project Deployment Options
=========================================

1.  Local Development Server
    Command: node deploy-simple.js local
    Description: Start local development server with hot reload

2.  Production Server
    Command: node deploy-simple.js production
    Description: Start production server locally

3.  Docker Deployment
    Command: node deploy-simple.js docker
    Description: Deploy using Docker container

4.  Docker Compose
    Command: node deploy-simple.js compose
    Description: Deploy using Docker Compose

5.  Heroku Deployment
    Command: node deploy-simple.js heroku
    Description: Deploy to Heroku cloud platform

6.  Vercel Deployment
    Command: node deploy-simple.js vercel
    Description: Deploy to Vercel (static hosting)

7.  Netlify Deployment
    Command: node deploy-simple.js netlify
    Description: Deploy to Netlify (static hosting)

8.  Railway Deployment
    Command: node deploy-simple.js railway
    Description: Deploy to Railway cloud platform

9.  Build Only
    Command: node deploy-simple.js build
    Description: Build the application without deploying

10. AWS Deployment (Advanced)
    Command: node deploy-aws.js
    Description: Full AWS deployment with ECS, CloudFront, Route53

Examples:
  node deploy-simple.js local
  node deploy-simple.js heroku
  node deploy-simple.js docker
        `);
    }

    // IDX-DEPLOY-021: Main Deployment Method
    async deploy(option) {
        console.log('🚀 Starting deployment for Coordinates project...');
        
        // Build the application first
        if (!await this.build()) {
            console.error('❌ Build failed, cannot proceed with deployment');
            return;
        }
        
        switch (option) {
            case 'local':
                await this.startLocal();
                break;
            case 'production':
                await this.startProduction();
                break;
            case 'docker':
                await this.deployDocker();
                break;
            case 'compose':
                await this.deployDockerCompose();
                break;
            case 'heroku':
                await this.deployHeroku();
                break;
            case 'vercel':
                await this.deployVercel();
                break;
            case 'netlify':
                await this.deployNetlify();
                break;
            case 'railway':
                await this.deployRailway();
                break;
            case 'build':
                console.log('✅ Build completed successfully');
                break;
            default:
                this.showOptions();
                break;
        }
    }
}

// Run deployment if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const deployer = new SimpleDeployer();
    const option = process.argv[2] || 'help';
    deployer.deploy(option);
}

export default SimpleDeployer; 