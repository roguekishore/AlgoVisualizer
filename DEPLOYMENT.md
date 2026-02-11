# Deployment Guide

## Environment Configuration

### Development
1. Copy `.env.example` to `.env`:
   ```bash
   cp reactapp/.env.example reactapp/.env
   ```

2. For local development, use:
   ```
   REACT_APP_JUDGE_URL=http://localhost:9000
   ```

### Production Deployment

#### Frontend (React App)
1. Set the production judge URL:
   ```
   REACT_APP_JUDGE_URL=http://your-ec2-ip:9000
   ```

2. Build and deploy:
   ```bash
   cd reactapp
   npm run build
   # Deploy the build/ folder to your hosting service
   ```

#### Backend (Judge Service)
1. Deploy to EC2 using Docker:
   ```bash
   # On your EC2 instance
   git clone your-repo
   cd judge
   docker-compose up -d
   ```

2. Or build and push to Docker Hub:
   ```bash
   cd judge
   npm run docker:build
   npm run docker:push
   ```

## Security Notes

- **Never commit .env files** - they contain sensitive URLs and keys
- **Use .env.example** to document required environment variables
- **Keep API endpoints configurable** via environment variables
- **Use HTTPS in production** for the judge API endpoint

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_JUDGE_URL` | Judge service endpoint | `http://localhost:9000` |
| `GENERATE_SOURCEMAP` | Control React sourcemaps | `false` |