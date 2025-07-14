# Netlify Custom Domain Setup for rekursing.com

## Quick Setup (Recommended)

### 1. Add Custom Domain in Netlify
1. Go to: https://app.netlify.com/projects/rekursing-com
2. Navigate to: **Site Settings** → **Domain Management**
3. Click: **Add custom domain**
4. Enter: `www.rekursing.com`
5. Click: **Verify**

### 2. Configure DNS in AWS Route 53
Netlify will provide you with DNS records. Use these in your AWS Route 53:

#### Option A: CNAME Setup (Recommended)
- **Type**: CNAME
- **Name**: www
- **Value**: rekursing-com.netlify.app
- **TTL**: 300

#### Option B: A Record Setup
- **Type**: A
- **Name**: www
- **Value**: 75.2.60.5
- **TTL**: 300

### 3. SSL Certificate
- Netlify automatically provides free SSL certificates
- Certificate will be provisioned once DNS is configured
- Wait 24-48 hours for full SSL activation

## Manual AWS Route 53 Configuration

### Step 1: Access Route 53
1. Go to AWS Console → Route 53
2. Select your hosted zone for `rekursing.com`

### Step 2: Create DNS Records
1. **Create CNAME Record**:
   - Record name: `www`
   - Record type: `CNAME`
   - Value: `rekursing-com.netlify.app`
   - TTL: `300`

2. **Create A Record (Optional for root domain)**:
   - Record name: `@` (or leave empty)
   - Record type: `A`
   - Value: `75.2.60.5`
   - TTL: `300`

### Step 3: Verify Configuration
```bash
# Test DNS resolution
nslookup www.rekursing.com
dig www.rekursing.com

# Test website access
curl -I https://www.rekursing.com
```

## Verification Timeline
- **Immediate**: DNS changes visible in Route 53
- **5-30 minutes**: Some users can access the site
- **24-48 hours**: Full global DNS propagation
- **24-48 hours**: SSL certificate activation

## Troubleshooting

### DNS Not Resolving
1. Check Route 53 record configuration
2. Verify TTL settings
3. Wait for propagation
4. Test with different DNS servers

### SSL Certificate Issues
1. Ensure DNS is properly configured
2. Wait 24-48 hours for certificate provisioning
3. Check Netlify SSL status in dashboard

### Site Not Loading
1. Verify Netlify site is accessible: https://rekursing-com.netlify.app
2. Check DNS resolution
3. Clear browser cache
4. Test with incognito mode

## Next Steps
1. Set up redirects (www to non-www or vice versa)
2. Configure custom headers if needed
3. Set up form handling
4. Configure analytics
5. Set up monitoring and alerts 