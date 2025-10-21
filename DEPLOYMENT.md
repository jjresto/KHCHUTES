# Deployment Guide - DeepSeek V3 Integration

## Pre-Deployment Checklist

### ✅ Required Steps

- [ ] **API Key Obtained**
  - Sign up at https://platform.deepseek.com
  - Generate API key
  - Verify key is active

- [ ] **Environment Variables Set**
  - `DEEPSEEK_API_KEY` configured in production environment
  - Other optional variables set as needed
  - Verify no `.env` file committed to repository

- [ ] **Dependencies Installed**
  - Run `npm install`
  - Verify all packages installed successfully
  - Check for security vulnerabilities: `npm audit`

- [ ] **Code Review Completed**
  - Review `src/services/deepseekV3.js`
  - Review `src/pages/NewDiagnostic.js`
  - Verify error handling is comprehensive

- [ ] **Testing Completed**
  - Test basic diagnostic flow
  - Test with multiple OBD-II codes
  - Test error scenarios
  - Test with images (if enabled)
  - Verify fallback mechanisms work

- [ ] **Security Review**
  - Confirm API key not exposed in client code
  - Review input validation
  - Check error messages don't leak sensitive data
  - Verify rate limiting is in place

- [ ] **Documentation Review**
  - Ensure README.md is up to date
  - Verify DEEPSEEK_V3_INTEGRATION.md is accurate
  - Check that all examples work

---

## Deployment Steps

### 1. Environment Configuration

#### Development
```bash
# .env.development
DEEPSEEK_API_KEY=sk-dev-xxxxxxxxxxxxxxxx
DEEPSEEK_TEMPERATURE=0.5
DEEPSEEK_MAX_TOKENS=2000
DEEPSEEK_TIMEOUT=30000
```

#### Production
```bash
# Set in production environment (not in file)
export DEEPSEEK_API_KEY="sk-prod-xxxxxxxxxxxxxxxx"
export DEEPSEEK_TEMPERATURE="0.3"
export DEEPSEEK_MAX_TOKENS="2000"
export DEEPSEEK_TIMEOUT="30000"
export DEEPSEEK_MAX_RETRIES="3"
```

### 2. Build for Production

```bash
# Install production dependencies
npm ci --production

# Build application
npm run build

# Verify build succeeded
ls -la dist/
```

### 3. Deploy to Server

#### Option A: Traditional Server

```bash
# Copy files to server
scp -r dist/ user@server:/var/www/automotive-diagnostic-ai/

# SSH into server
ssh user@server

# Set environment variables
echo 'export DEEPSEEK_API_KEY="your-key"' >> ~/.bashrc
source ~/.bashrc

# Start application
cd /var/www/automotive-diagnostic-ai
npm start
```

#### Option B: Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t automotive-diagnostic-ai .
docker run -d \
  -p 3000:3000 \
  -e DEEPSEEK_API_KEY="your-key" \
  --name diagnostic-ai \
  automotive-diagnostic-ai
```

#### Option C: Cloud Platform (Vercel/Netlify)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Set environment variable in dashboard
# DEEPSEEK_API_KEY = your-key
```

### 4. Configure Monitoring

#### Log Aggregation

```javascript
// Add to deepseekV3.js
_callDeepSeekAPI(messages) {
  const startTime = Date.now();
  
  try {
    const response = await fetch(...);
    const duration = Date.now() - startTime;
    
    // Log to monitoring service
    logger.info('DeepSeek API call', {
      duration,
      status: response.status,
      timestamp: new Date().toISOString()
    });
    
    return response;
  } catch (error) {
    logger.error('DeepSeek API error', {
      error: error.message,
      duration: Date.now() - startTime
    });
    throw error;
  }
}
```

#### Health Check Endpoint

```javascript
// Add health check route
app.get('/health', async (req, res) => {
  try {
    // Test DeepSeek API connectivity
    const testResult = await deepSeekV3.analyzeDiagnostic({
      vehicleInfo: "2020 Test Vehicle",
      symptoms: "Health check test",
      troubleCodes: []
    });
    
    res.json({ 
      status: 'healthy',
      deepseek: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy',
      error: error.message 
    });
  }
});
```

### 5. Set Up Alerts

#### Cost Alerts

```javascript
// Monitor API usage
let dailyRequestCount = 0;
let dailyCost = 0;

const COST_PER_REQUEST = 0.03; // Adjust based on actual pricing
const DAILY_BUDGET = 50; // USD

function trackUsage() {
  dailyRequestCount++;
  dailyCost += COST_PER_REQUEST;
  
  if (dailyCost > DAILY_BUDGET * 0.8) {
    sendAlert(`DeepSeek API cost approaching budget: $${dailyCost}`);
  }
}
```

#### Error Rate Monitoring

```javascript
let errorCount = 0;
let totalRequests = 0;

function trackError() {
  errorCount++;
  totalRequests++;
  
  const errorRate = (errorCount / totalRequests) * 100;
  
  if (errorRate > 5) { // 5% error rate threshold
    sendAlert(`High error rate: ${errorRate.toFixed(2)}%`);
  }
}
```

---

## Post-Deployment Verification

### 1. Smoke Tests

```bash
# Test basic functionality
curl -X POST https://your-domain.com/api/diagnostic \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleInfo": "2020 Toyota Camry",
    "symptoms": "Check engine light on",
    "troubleCodes": ["P0420"]
  }'

# Expected: JSON response with diagnosis
```

### 2. Monitor Logs

```bash
# View application logs
tail -f /var/log/automotive-diagnostic-ai/app.log

# Look for:
# - "DeepSeek V3 analysis completed" (success)
# - API errors
# - Timeout issues
```

### 3. Check Performance

```javascript
// Monitor response times
const avgResponseTime = totalTime / requestCount;
console.log(`Average DeepSeek response time: ${avgResponseTime}ms`);

// Target: < 8 seconds for most requests
```

### 4. Verify Error Handling

```bash
# Test with invalid API key (in dev)
DEEPSEEK_API_KEY="invalid" npm start

# Should see:
# - Graceful error handling
# - Fallback diagnosis provided
# - No crashes
```

---

## Scaling Considerations

### Rate Limiting

```javascript
// Add rate limiting per user
const rateLimit = require('express-rate-limit');

const diagnosticLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 diagnostics per 15 minutes per IP
  message: 'Too many diagnostic requests, please try again later'
});

app.post('/api/diagnostic', diagnosticLimiter, async (req, res) => {
  // Handle diagnostic request
});
```

### Caching

```javascript
// Cache common trouble code interpretations
const cache = new Map();

async function getCachedCodeInterpretation(code) {
  if (cache.has(code)) {
    return cache.get(code);
  }
  
  const result = await deepSeekV3.interpretTroubleCode(code);
  cache.set(code, result);
  
  return result;
}
```

### Load Balancing

```nginx
# nginx.conf
upstream diagnostic_servers {
  server localhost:3000;
  server localhost:3001;
  server localhost:3002;
}

server {
  listen 80;
  
  location / {
    proxy_pass http://diagnostic_servers;
  }
}
```

---

## Rollback Plan

### If Issues Occur

```bash
# 1. Revert to previous version
git checkout <previous-commit>

# 2. Rebuild
npm run build

# 3. Redeploy
vercel --prod

# 4. Investigate issue
git log
git diff <previous-commit> <current-commit>
```

### Fallback to base44 (if needed)

```javascript
// Temporary fallback
const USE_DEEPSEEK = process.env.ENABLE_DEEPSEEK !== 'false';

const result = USE_DEEPSEEK 
  ? await deepSeekV3.analyzeDiagnostic(...)
  : await base44.integrations.Core.InvokeLLM(...);
```

---

## Maintenance

### Regular Tasks

**Daily:**
- Monitor error rates
- Check API costs
- Review diagnostic accuracy

**Weekly:**
- Review user feedback
- Analyze slow queries
- Check for API updates

**Monthly:**
- Security updates: `npm audit fix`
- Review and optimize prompts
- Analyze cost trends
- Update documentation

### Updates

```bash
# Update dependencies
npm update

# Check for security vulnerabilities
npm audit

# Test after updates
npm test
```

---

## Cost Management

### Estimate Monthly Costs

```
Average diagnostics per day: 100
Cost per diagnostic: $0.03
Monthly cost: 100 * 30 * $0.03 = $90/month
```

### Cost Optimization Tips

1. **Cache Common Results**
   - Cache trouble code interpretations
   - Cache diagnostic patterns

2. **Optimize Prompts**
   - Reduce prompt length where possible
   - Use efficient token usage

3. **Set Limits**
   - Max tokens per request: 2000
   - Request timeout: 30 seconds
   - Rate limiting: 10 requests/15 min per user

4. **Monitor Usage**
   - Daily cost alerts
   - Usage dashboards
   - Cost attribution by feature

---

## Support Contacts

- **DeepSeek Support:** https://platform.deepseek.com/support
- **API Documentation:** https://platform.deepseek.com/docs
- **Status Page:** https://status.deepseek.com
- **Developer Forum:** [Your support forum URL]

---

## Emergency Procedures

### API Down

```javascript
// Automatic fallback already implemented
// System will show fallback diagnosis
// Monitor: https://status.deepseek.com
```

### High Error Rate

```bash
# 1. Check DeepSeek status
curl https://api.deepseek.com/health

# 2. Review recent logs
tail -f /var/log/app.log | grep ERROR

# 3. Verify API key
echo $DEEPSEEK_API_KEY

# 4. Test manually
npm run test:diagnostic
```

### Budget Exceeded

```javascript
// Implement cost circuit breaker
if (dailyCost > DAILY_BUDGET) {
  // Stop making API calls
  useLocalFallback = true;
  sendAlert('DeepSeek budget exceeded, using fallback mode');
}
```

---

**Deployment Complete! Monitor logs and metrics for the first 24-48 hours. 🚀**
