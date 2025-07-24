# 🔗 Cross-Project API Integration

## Overview
This document outlines the API endpoints needed for cross-project integration between the main LicenseHub project and this Admin Dashboard.

## Main LicenseHub API Endpoints

These endpoints should be added to your main LicenseHub project to provide data access for the admin dashboard:

### Company Data
```typescript
// GET /api/admin/companies - List all companies using LicenseHub
interface CompanyResponse {
  id: string
  name: string
  domain: string
  industry: string
  employeeCount: number
  licenseCount: number
  monthlySpend: number
  dataConsent: 'granted' | 'pending' | 'revoked'
  createdAt: string
  lastActive: string
}
```

### License Data
```typescript
// GET /api/admin/licenses - Aggregated license usage statistics
interface LicenseStatsResponse {
  totalLicenses: number
  activeLicenses: number
  monthlyRevenue: number
  topSoftware: Array<{
    name: string
    category: string
    userCount: number
    revenue: number
    growthRate: number
  }>
  usageByIndustry: Array<{
    industry: string
    licenseCount: number
    averageSpend: number
  }>
}
```

### Review Data
```typescript
// GET /api/admin/reviews - Aggregated review data for market intelligence
interface ReviewDataResponse {
  totalReviews: number
  averageRating: number
  reviewsByCategory: Array<{
    category: string
    count: number
    averageRating: number
    sentiment: 'positive' | 'neutral' | 'negative'
  }>
  competitiveInsights: Array<{
    software: string
    rating: number
    reviewCount: number
    keyFeatures: string[]
    commonComplaints: string[]
  }>
}
```

### User Activity
```typescript
// GET /api/admin/users - User activity and engagement data
interface UserActivityResponse {
  totalUsers: number
  activeUsers: number
  userGrowth: number
  engagementMetrics: {
    dailyActiveUsers: number
    weeklyActiveUsers: number
    monthlyActiveUsers: number
    averageSessionDuration: number
  }
  usersByCompany: Array<{
    companyId: string
    companyName: string
    userCount: number
    lastActivity: string
  }>
}
```

## Webhook Integration

### Webhook Events
Set up webhooks in your main LicenseHub project to notify the admin dashboard of important events:

```typescript
// Webhook payload structure
interface WebhookPayload {
  event: string
  timestamp: string
  data: any
  source: 'licensehub'
  version: '1.0'
}

// Event types to implement:
const WEBHOOK_EVENTS = {
  // License events
  'license.created': 'New license purchased',
  'license.renewed': 'License renewed',
  'license.cancelled': 'License cancelled',
  'license.upgraded': 'License plan upgraded',
  
  // Review events
  'review.created': 'New software review submitted',
  'review.updated': 'Review updated',
  'review.moderated': 'Review moderation completed',
  
  // User events
  'user.registered': 'New user registered',
  'user.company_verified': 'User company verification completed',
  
  // Company events
  'company.onboarded': 'New company onboarded',
  'company.consent_updated': 'Data sharing consent updated',
  
  // System events
  'data.export_requested': 'Data export requested',
  'data.export_completed': 'Data export completed',
}
```

### Webhook Endpoints for Admin Dashboard
```typescript
// POST /api/webhooks/licensehub - Receive webhooks from main LicenseHub
export async function handleLicenseHubWebhook(req: Request) {
  const { event, data, timestamp } = req.body
  
  switch (event) {
    case 'license.created':
      await updateLicenseMetrics(data)
      await notifyMarketIntelligence(data)
      break
      
    case 'review.created':
      await updateReviewAnalytics(data)
      await updateCompetitiveIntelligence(data)
      break
      
    case 'company.consent_updated':
      await updateConsentStatus(data.companyId, data.consentStatus)
      break
      
    default:
      console.log(`Unhandled webhook event: ${event}`)
  }
  
  // Log webhook for audit trail
  await blink.db.adminWebhookLogs.create({
    event,
    source: 'licensehub',
    data: JSON.stringify(data),
    processedAt: new Date().toISOString(),
    status: 'processed'
  })
  
  return new Response('OK', { status: 200 })
}
```

## External Platform Integration

### lebonlogiciel.com API
```typescript
// Anonymized data export for software comparison website
interface LebonlogicielExport {
  software: Array<{
    name: string
    category: string
    averageRating: number
    reviewCount: number
    features: string[]
    pricing: {
      startingPrice: number
      currency: string
      billingCycle: string
    }
    // No company-specific data
  }>
  marketTrends: Array<{
    category: string
    growthRate: number
    popularFeatures: string[]
    averagePrice: number
  }>
}
```

### Prospection SaaS API
```typescript
// Full company data for B2B prospection (with consent)
interface ProspectionExport {
  companies: Array<{
    name: string
    domain: string
    industry: string
    employeeCount: number
    technologies: Array<{
      name: string
      category: string
      licenseCount: number
      monthlySpend: number
      renewalDate: string
      satisfactionScore: number
    }>
    contacts: Array<{
      role: string
      department: string
      // No personal data - only role-based info
    }>
    // Only for companies with explicit consent
    dataConsent: 'granted'
  }>
}
```

## Implementation Steps

### Phase 1: Main LicenseHub Updates
1. Add admin API endpoints to main project
2. Implement webhook system
3. Set up data aggregation queries
4. Add consent tracking

### Phase 2: Admin Dashboard Integration
1. Create API client for main LicenseHub
2. Implement webhook receivers
3. Set up real-time data sync
4. Add export functionality

### Phase 3: External Platform APIs
1. Create lebonlogiciel.com export endpoints
2. Implement prospection SaaS integration
3. Set up automated data sync
4. Add monitoring and logging

## Security Considerations

### API Authentication
```typescript
// Use API keys for service-to-service communication
const API_HEADERS = {
  'Authorization': `Bearer ${ADMIN_API_KEY}`,
  'Content-Type': 'application/json',
  'X-Source': 'admin-dashboard'
}
```

### Data Privacy
- Only export anonymized data to lebonlogiciel.com
- Require explicit consent for prospection SaaS data
- Implement data retention policies
- Add audit logging for all data access

### Rate Limiting
```typescript
// Implement rate limiting for API endpoints
const RATE_LIMITS = {
  '/api/admin/*': '100 requests per minute',
  '/api/webhooks/*': '1000 requests per minute',
  '/api/exports/*': '10 requests per hour'
}
```

## Monitoring and Logging

### Metrics to Track
- API response times
- Webhook delivery success rates
- Data export completion rates
- Error rates by endpoint
- Data freshness (last sync timestamps)

### Alerting
- Failed webhook deliveries
- API endpoint errors
- Data sync delays
- Consent revocations
- Export failures

This integration architecture ensures seamless data flow between your main LicenseHub project and the admin dashboard while maintaining security and compliance standards.