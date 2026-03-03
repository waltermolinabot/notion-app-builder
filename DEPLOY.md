# Deployment Guide

## Production Deployment

### Prerequisites
- Vercel account connected to GitHub
- Domain (optional, can use vercel.app)
- Stripe account for billing
- Notion OAuth app credentials

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Notion
NOTION_CLIENT_ID=...
NOTION_CLIENT_SECRET=...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Sentry (optional)
NEXT_PUBLIC_SENTRY_DSN=https://...

# App
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Deploy Steps

1. **Connect to Vercel**
   ```bash
   npm i -g vercel
   vercel link
   ```

2. **Set environment variables**
   ```bash
   vercel env add DATABASE_URL
   vercel env add NOTION_CLIENT_ID
   # ... add all required vars
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Post-Deployment Checklist

- [ ] Verify landing page loads
- [ ] Test OAuth flow (connect Notion)
- [ ] Create test app and publish
- [ ] Check Stripe checkout works
- [ ] Verify email delivery (if applicable)
- [ ] Check Sentry for errors
- [ ] Test mobile responsiveness

### Rollback

```bash
vercel rollback
```

### Monitoring

- **Vercel Dashboard**: Deployment status, functions, edge config
- **Sentry**: Error tracking, performance
- **Stripe Dashboard**: Revenue, subscriptions
- **Clerk Dashboard**: Users, auth issues
