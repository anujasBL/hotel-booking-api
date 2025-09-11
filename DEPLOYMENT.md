# Hotel Booking API - Deployment Guide

This guide covers deploying the Hotel Booking API to various platforms.

## Prerequisites

Before deploying, ensure you have:
- A production Supabase project set up
- Valid OpenAI API key
- All environment variables configured
- Database schema deployed

## Platform Deployment Options

### 1. Render (Recommended for Beginners)

**Render** provides easy deployment for Node.js applications with automatic builds and SSL.

#### Steps:
1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/hotel-booking-api.git
   git push -u origin main
   ```

2. **Connect to Render**
   - Go to [render.com](https://render.com)
   - Create account and connect GitHub
   - Create new "Web Service"
   - Select your repository

3. **Configure Build Settings**
   ```yaml
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

4. **Set Environment Variables**
   - Add all variables from your `.env` file
   - Generate a strong `JWT_SECRET`
   - Use production Supabase keys

5. **Deploy**
   - Render will automatically build and deploy
   - Your API will be available at `https://your-app-name.onrender.com`

#### Render Configuration File
Create `render.yaml` in project root:
```yaml
services:
  - type: web
    name: hotel-booking-api
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
```

### 2. Railway

**Railway** offers seamless deployment with great developer experience.

#### Steps:
1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Deploy**
   ```bash
   railway login
   railway init
   railway add
   railway deploy
   ```

3. **Set Environment Variables**
   ```bash
   railway variables set NODE_ENV=production
   railway variables set SUPABASE_URL=your_url
   # ... add all other variables
   ```

### 3. Vercel

**Vercel** is excellent for serverless deployment.

#### Steps:
1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Configure for Serverless**
   Create `vercel.json`:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "dist/server.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "/dist/server.js"
       }
     ],
     "env": {
       "NODE_ENV": "production"
     }
   }
   ```

3. **Deploy**
   ```bash
   npm run build
   vercel --prod
   ```

### 4. Heroku

**Heroku** offers traditional platform-as-a-service deployment.

#### Steps:
1. **Install Heroku CLI**
   - Download from [heroku.com](https://devcenter.heroku.com/articles/heroku-cli)

2. **Create Heroku App**
   ```bash
   heroku login
   heroku create your-hotel-api
   ```

3. **Configure Environment**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set SUPABASE_URL=your_url
   # ... add all variables
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

#### Heroku Configuration
Create `Procfile`:
```
web: npm start
```

### 5. DigitalOcean App Platform

**DigitalOcean** provides managed application deployment.

#### Steps:
1. **Create App Spec**
   Create `.do/app.yaml`:
   ```yaml
   name: hotel-booking-api
   services:
   - name: api
     source_dir: /
     github:
       repo: yourusername/hotel-booking-api
       branch: main
     run_command: npm start
     build_command: npm run build
     environment_slug: node-js
     instance_count: 1
     instance_size_slug: basic-xxs
     envs:
     - key: NODE_ENV
       value: production
   ```

2. **Deploy via Dashboard**
   - Go to DigitalOcean Apps
   - Import from GitHub
   - Configure environment variables

### 6. AWS (Advanced)

For enterprise deployments using AWS services.

#### Services Used:
- **AWS Lambda** + **API Gateway** (Serverless)
- **ECS** + **Fargate** (Containerized)
- **EC2** (Traditional server)

#### Example: Lambda Deployment
1. **Install Serverless Framework**
   ```bash
   npm install -g serverless
   ```

2. **Configure Serverless**
   Create `serverless.yml`:
   ```yaml
   service: hotel-booking-api
   
   provider:
     name: aws
     runtime: nodejs18.x
     region: us-east-1
   
   functions:
     api:
       handler: dist/lambda.handler
       events:
         - http:
             path: /{proxy+}
             method: ANY
   ```

3. **Create Lambda Handler**
   Create `src/lambda.ts`:
   ```typescript
   import serverless from 'serverless-http';
   import app from './server';
   
   export const handler = serverless(app);
   ```

## Environment Configuration

### Production Environment Variables
```bash
# Server
NODE_ENV=production
PORT=3000

# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_key

# AI/ML
OPENAI_API_KEY=your_production_openai_key

# Security
JWT_SECRET=your_super_secure_production_jwt_secret_32_chars_minimum

# CORS
FRONTEND_URL=https://your-frontend-domain.com

# Logging
LOG_LEVEL=warn
```

### Security Considerations

1. **Environment Variables**
   - Never commit `.env` files
   - Use secure secret management
   - Rotate keys regularly

2. **Database Security**
   - Enable Row Level Security (RLS) in Supabase
   - Use least-privilege service keys
   - Enable database SSL

3. **API Security**
   - Implement rate limiting
   - Use HTTPS only
   - Validate all inputs
   - Implement CORS properly

4. **Monitoring**
   - Set up error tracking (Sentry)
   - Monitor API performance
   - Set up alerts for failures

## Database Setup

### Supabase Production Setup

1. **Create Production Project**
   - Create new Supabase project for production
   - Use strong passwords
   - Enable backups

2. **Run Database Schema**
   ```sql
   -- Copy contents from src/config/database-setup.sql
   -- Run in Supabase SQL Editor
   ```

3. **Configure Security**
   - Enable RLS on user-specific tables
   - Set up proper authentication policies
   - Configure API keys with appropriate permissions

4. **Enable Extensions**
   ```sql
   -- Required for vector search
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

## Performance Optimization

### 1. Caching
```typescript
// Add Redis caching for frequently accessed data
import redis from 'redis';

const client = redis.createClient(process.env.REDIS_URL);

// Cache hotel search results
const cacheKey = `hotels:${JSON.stringify(filters)}`;
const cached = await client.get(cacheKey);
if (cached) return JSON.parse(cached);
```

### 2. Database Indexing
```sql
-- Add indexes for better query performance
CREATE INDEX CONCURRENTLY idx_hotels_city_gin ON hotels USING GIN ((location->>'city'));
CREATE INDEX CONCURRENTLY idx_bookings_user_date ON bookings(user_id, check_in_date);
```

### 3. Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use('/api/v1', limiter);
```

## Monitoring and Logging

### 1. Health Checks
```typescript
// Enhanced health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
    uptime: process.uptime(),
    database: await checkDatabaseHealth(),
    openai: await checkOpenAIHealth(),
  };
  
  res.json(health);
});
```

### 2. Error Tracking
```bash
# Install Sentry
npm install @sentry/node

# Configure in server.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### 3. Logging
```typescript
// Production logging configuration
const logger = winston.createLogger({
  level: 'warn',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});
```

## CI/CD Pipeline

### GitHub Actions Example
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build
      run: npm run build
    
    - name: Deploy to Render
      uses: johnbeynon/render-deploy-action@v0.0.8
      with:
        service-id: ${{ secrets.RENDER_SERVICE_ID }}
        api-key: ${{ secrets.RENDER_API_KEY }}
```

## SSL Certificate

Most platforms (Render, Vercel, Heroku) provide automatic SSL certificates. For custom domains:

1. **Add Custom Domain**
   - Configure in platform dashboard
   - Update DNS records
   - SSL will be automatically provisioned

2. **Force HTTPS**
   ```typescript
   // Add HTTPS redirect middleware
   app.use((req, res, next) => {
     if (req.header('x-forwarded-proto') !== 'https') {
       res.redirect(`https://${req.header('host')}${req.url}`);
     } else {
       next();
     }
   });
   ```

## Post-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database schema deployed
- [ ] SSL certificate active
- [ ] Health checks passing
- [ ] API documentation accessible
- [ ] Rate limiting configured
- [ ] Monitoring/alerting set up
- [ ] Backup strategy implemented
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] Error tracking active

## Scaling Considerations

### Horizontal Scaling
- Use load balancers
- Implement stateless architecture
- Use Redis for session storage

### Database Scaling
- Implement read replicas
- Use connection pooling
- Consider database sharding for large scale

### Caching Strategy
- Redis for application cache
- CDN for static assets
- Database query optimization

For production support, monitor your application closely and be prepared to scale based on usage patterns.
