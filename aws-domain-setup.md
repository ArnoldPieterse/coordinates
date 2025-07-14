# AWS Domain Setup for rekursing.com

## Current Status
- Domain: www.rekursing.com (AWS hosted)
- Netlify Site: https://rekursing-com.netlify.app
- Goal: Point domain to Netlify deployment

## AWS Route 53 Configuration

### 1. Get Netlify DNS Records
From your Netlify dashboard, get these DNS records:
- A record: 75.2.60.5
- CNAME record: rekursing-com.netlify.app

### 2. AWS Route 53 Setup
1. Go to AWS Route 53 Console
2. Select your hosted zone for rekursing.com
3. Create/Update these records:

#### A Record (Root Domain)
- Name: @ (or leave empty for root domain)
- Type: A
- Value: 75.2.60.5
- TTL: 300

#### CNAME Record (www subdomain)
- Name: www
- Type: CNAME
- Value: rekursing-com.netlify.app
- TTL: 300

#### A Record (www subdomain - Alternative)
- Name: www
- Type: A
- Value: 75.2.60.5
- TTL: 300

### 3. SSL Certificate (Optional)
- Netlify provides free SSL certificates
- AWS Certificate Manager can also be used for custom certificates

## Alternative: Netlify Custom Domain Setup

### 1. Add Custom Domain in Netlify
1. Go to Netlify Dashboard > Site Settings > Domain Management
2. Add custom domain: www.rekursing.com
3. Netlify will provide DNS records to configure

### 2. Update AWS DNS
Use the DNS records provided by Netlify to update your Route 53 configuration.

## Verification Steps
1. Wait for DNS propagation (up to 48 hours)
2. Test: https://www.rekursing.com
3. Check SSL certificate status
4. Verify redirects work properly

## Troubleshooting
- Use `nslookup www.rekursing.com` to check DNS resolution
- Check AWS Route 53 health checks
- Verify Netlify site is accessible
- Test both HTTP and HTTPS 