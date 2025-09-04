# MongoDB Integration and Vercel Deployment Guide

This guide will help you deploy your Next.js application to Vercel with MongoDB integration.

## Prerequisites

1. **MongoDB Atlas Account**: Sign up at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. **Vercel Account**: Sign up at [Vercel](https://vercel.com)
3. **Node.js**: Version 18 or higher

## Step 1: Set Up MongoDB Atlas

1. **Create a New Cluster**:
   - Log in to MongoDB Atlas
   - Click "Create a New Cluster"
   - Choose the free tier (M0 Sandbox)
   - Select your preferred region
   - Click "Create Cluster"

2. **Create Database User**:
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create a username and secure password
   - Set user privileges to "Read and write to any database"
   - Click "Add User"

3. **Configure Network Access**:
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Choose "Allow Access from Anywhere" (0.0.0.0/0) for Vercel deployment
   - Click "Confirm"

4. **Get Connection String**:
   - Go to "Clusters" and click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with your preferred database name (e.g., "mediate")

## Step 2: Local Development Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Update your `.env.local` file with your MongoDB connection string:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mediate?retryWrites=true&w=majority
   NEXT_PUBLIC_API_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-local-secret-key-change-this-in-production
   NEXTAUTH_URL=http://localhost:3000
   ```

3. **Test Local Development**:
   ```bash
   npm run dev
   ```
   
   Visit `http://localhost:3000` and check:
   - Application loads without errors
   - Database health check at `http://localhost:3000/api/health`
   - User registration/login works
   - Dashboard shows database status

## Step 3: Deploy to Vercel

1. **Push to Git Repository**:
   ```bash
   git add .
   git commit -m "Add MongoDB integration and Vercel deployment config"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your Git repository
   - Vercel will automatically detect it's a Next.js project

3. **Configure Environment Variables in Vercel**:
   - In your Vercel project settings, go to "Environment Variables"
   - Add the following variables:
   
   ```
   MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/mediate?retryWrites=true&w=majority
   NEXT_PUBLIC_API_URL = https://your-backend-api.com
   NEXTAUTH_SECRET = your-production-secret-key-generate-a-secure-one
   NEXTAUTH_URL = https://your-app.vercel.app
   ```

4. **Deploy**:
   - Click "Deploy"
   - Vercel will build and deploy your application
   - Once deployed, you'll get a URL like `https://your-app.vercel.app`

## Step 4: Verify Deployment

1. **Check Application Health**:
   - Visit your deployed application
   - Go to `/api/health` to check database connectivity
   - Test user registration and login
   - Verify dashboard shows correct database status

2. **Monitor Logs**:
   - In Vercel dashboard, go to your project
   - Click on "Functions" tab to see API route logs
   - Check for any errors in the deployment logs

## Step 5: Production Configuration

1. **Database Indexes** (Optional but recommended):
   In MongoDB Atlas, create indexes for better performance:
   ```javascript
   // User preferences collection
   db.user_preferences.createIndex({ "userId": 1 }, { unique: true })
   
   // Cache collection
   db.cache.createIndex({ "key": 1, "userId": 1 }, { unique: true })
   db.cache.createIndex({ "expires_at": 1 }, { expireAfterSeconds: 0 })
   
   // Sessions collection
   db.sessions.createIndex({ "sessionId": 1 }, { unique: true })
   db.sessions.createIndex({ "userId": 1 })
   db.sessions.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 })
   ```

2. **Security Considerations**:
   - Use strong, unique passwords for database users
   - Regularly rotate your `NEXTAUTH_SECRET`
   - Monitor database access logs
   - Set up database backup policies in MongoDB Atlas

## Features Added

### MongoDB Integration
- **User Preferences**: Store user settings, themes, and preferences
- **API Response Caching**: Cache API responses to improve performance
- **Session Management**: Track user sessions and activity
- **Health Monitoring**: Monitor database connectivity and performance

### API Endpoints
- `GET/POST/PUT/DELETE /api/user-preferences` - User preferences management
- `GET/POST/DELETE /api/cache` - Cache management with statistics
- `GET/POST /api/health` - Database health checks and system monitoring

### Frontend Features
- **Enhanced Dashboard**: Shows database status, cache statistics, and user preferences
- **Automatic Caching**: API responses are automatically cached to improve performance
- **User Preferences**: Persistent user settings across sessions
- **Real-time Health Monitoring**: Live status of all system components

## Troubleshooting

### Common Issues

1. **MongoDB Connection Errors**:
   - Verify your connection string is correct
   - Check that your IP is whitelisted in MongoDB Atlas
   - Ensure database user has proper permissions

2. **Vercel Build Errors**:
   - Check that all environment variables are set
   - Verify TypeScript compilation passes locally
   - Review build logs in Vercel dashboard

3. **API Route Timeouts**:
   - MongoDB operations might be slow on free tier
   - Consider upgrading to a paid MongoDB Atlas tier
   - Implement proper error handling and timeouts

4. **Cache Issues**:
   - Clear cache using `DELETE /api/cache?cleanup=true`
   - Check cache statistics at `GET /api/cache?stats=true`
   - Monitor cache hit rates in dashboard

### Performance Optimization

1. **Database Optimization**:
   - Create appropriate indexes
   - Use MongoDB Atlas performance advisor
   - Monitor slow queries

2. **Caching Strategy**:
   - Adjust TTL values based on data freshness requirements
   - Implement cache warming for frequently accessed data
   - Use cache statistics to optimize cache policies

3. **Vercel Optimization**:
   - Use Vercel Analytics to monitor performance
   - Implement proper error boundaries
   - Optimize bundle size with dynamic imports

## Support

If you encounter issues:
1. Check the application logs in Vercel dashboard
2. Verify MongoDB Atlas connection and permissions
3. Test API endpoints individually using tools like Postman
4. Review the TODO.md file for implementation status

## Next Steps

After successful deployment:
1. Set up monitoring and alerting
2. Implement backup strategies
3. Add more sophisticated caching policies
4. Consider implementing user analytics
5. Add more user preference options
