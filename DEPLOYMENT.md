# 🚀 Deployment Guide

This guide will help you deploy your Portal Mini Store Template to Vercel with automatic deployments from GitHub.

## 📋 Prerequisites

- GitHub account
- Vercel account
- PostgreSQL database (Vercel Postgres recommended)
- Gmail account (for email notifications)
- Vercel Blob storage or S3 bucket (for file uploads)

## 🔧 Step 1: GitHub Repository Setup

### 1.1 Create GitHub Repository
```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit your code
git commit -m "Initial commit with enhanced order status system"

# Add remote origin (replace with your repo URL)
git remote add origin https://github.com/rahmatullahboss/portal-mini-store-template.git

# Push to main branch
git push -u origin main
```

### 1.2 Set GitHub Secrets
Go to your GitHub repository → Settings → Secrets and variables → Actions

Add the following secrets:

#### Required Secrets:
- `PAYLOAD_SECRET` - Random secret key for Payload CMS
- `POSTGRES_URL` - PostgreSQL database connection string
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob storage token
- `VERCEL_TOKEN` - Vercel deployment token
- `NEXT_PUBLIC_SERVER_URL` - Your production domain URL
- `ORG_ID` - Vercel organization ID
- `PROJECT_ID` - Vercel project ID

#### Optional Secrets (for email):
- `GMAIL_USER` - Gmail address for notifications
- `GOOGLE_APP_PASSWORD` - Gmail app password
- `EMAIL_DEFAULT_FROM_NAME` - Email sender name
- `ORDER_NOTIFICATIONS_EMAIL` - Admin notification email

## 🌐 Step 2: Vercel Setup

### 2.1 Connect GitHub to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Select your GitHub repository
4. Choose "Next.js" framework
5. Set build settings:
   - Build Command: `pnpm run ci`
   - Output Directory: `.next`
   - Install Command: `pnpm install`

### 2.2 Environment Variables in Vercel
Add these environment variables in Vercel Dashboard → Project Settings → Environment Variables:

#### Database Configuration:
```
POSTGRES_URL=postgresql://username:password@host:port/database
DATABASE_URL=postgresql://username:password@host:port/database
```

#### Payload CMS Configuration:
```
PAYLOAD_SECRET=your-super-secret-key-here
NEXT_PUBLIC_SERVER_URL=https://your-domain.vercel.app
```

#### Media Storage (Choose one):
**Option A: Vercel Blob Storage (Recommended)**
```
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_token_here
```

**Option B: S3 Storage**
```
S3_BUCKET=your-bucket-name
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
```

#### Email Configuration:
```
GMAIL_USER=your-email@gmail.com
GOOGLE_APP_PASSWORD=your-app-password
EMAIL_DEFAULT_FROM_NAME=Online Bazar
ORDER_NOTIFICATIONS_EMAIL=admin@yourdomain.com
```

#### Production Settings:
```
NODE_ENV=production
DYAD_DISABLE_DB_PUSH=true
```

## 🗄️ Step 3: Database Setup

### 3.1 Vercel Postgres (Recommended)
1. Go to Vercel Dashboard → Storage
2. Create new Postgres database
3. Copy connection string to `POSTGRES_URL`

### 3.2 Manual Database Migration
If you need to manually run migrations:
```bash
# Connect to your production database
pnpm payload migrate
```

## 📧 Step 4: Email Setup

### 4.1 Gmail App Password
1. Enable 2-Factor Authentication on Gmail
2. Go to Google Account Settings → Security → App passwords
3. Generate an app password for "Mail"
4. Use this password in `GOOGLE_APP_PASSWORD`

## 🔄 Step 5: Auto-Deployment Setup

### 5.1 GitHub Actions Workflow
The `.github/workflows/deploy.yml` file is already configured to:
- Run on every push to `main` branch
- Install dependencies and build the project
- Deploy to Vercel automatically

### 5.2 Vercel Integration
1. In Vercel Dashboard → Project Settings → Git
2. Enable "Auto-deploy" for production branch (`main`)
3. Configure branch protection rules in GitHub (optional)

## ✅ Step 6: Verification

### 6.1 Test Auto-Deployment
1. Make a small change to your code
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Test auto-deployment"
   git push origin main
   ```
3. Check Vercel Dashboard for deployment status
4. Visit your deployed site

### 6.2 Test Order Status System
1. Visit `/admin` on your deployed site
2. Create a test order
3. Change order status in admin panel
4. Verify email notifications are sent

## 🔧 Troubleshooting

### Common Issues:

#### Build Errors:
- Check environment variables are set correctly
- Ensure `PAYLOAD_SECRET` is set
- Verify database connection string

#### Email Not Working:
- Check Gmail app password is correct
- Verify SMTP settings
- Check spam folder for test emails

#### Database Issues:
- Ensure `DYAD_DISABLE_DB_PUSH=true` in production
- Run migrations manually if needed
- Check database connection permissions

#### Media Upload Issues:
- Verify Vercel Blob token is correct
- Check S3 credentials if using S3
- Ensure proper CORS settings

### Deployment Logs:
Check deployment logs in:
- Vercel Dashboard → Deployments → View Function Logs
- GitHub Actions → Workflow runs

## 🎯 Production Best Practices

1. **Security:**
   - Use strong `PAYLOAD_SECRET`
   - Enable HTTPS redirects
   - Set up proper CORS policies

2. **Performance:**
   - Enable Vercel Analytics
   - Monitor function execution times
   - Optimize images and assets

3. **Monitoring:**
   - Set up error tracking (Sentry recommended)
   - Monitor email delivery rates
   - Track database performance

4. **Backup:**
   - Regular database backups
   - Export Payload content periodically
   - Version control all configurations

## 🚀 Advanced Configuration

### Custom Domain Setup:
1. In Vercel Dashboard → Project Settings → Domains
2. Add your custom domain
3. Configure DNS settings
4. Update `NEXT_PUBLIC_SERVER_URL` to your domain

### CDN and Performance:
- Vercel automatically provides global CDN
- Images are optimized via Next.js Image component
- Static assets are cached automatically

## 📞 Support

If you encounter issues:

1. Check this deployment guide
2. Review Vercel deployment logs
3. Check GitHub Actions workflow results
4. Verify all environment variables are set
5. Test locally with production environment variables

---

**🎉 Congratulations!** Your Portal Mini Store is now automatically deployed with enhanced order status management!

Every code push to GitHub will automatically trigger a new deployment to Vercel. 🚀