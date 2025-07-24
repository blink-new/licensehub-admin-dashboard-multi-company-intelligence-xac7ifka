// Admin Dashboard Types
export interface AdminUser {
  id: string
  email: string
  displayName?: string
  role: 'super_admin' | 'admin' | 'analyst' | 'viewer'
  createdAt: string
  lastLoginAt?: string
}

export interface AdminOrganization {
  id: string
  name: string
  domain: string
  industry?: string
  employeeCount?: number
  consentStatus: 'granted' | 'pending' | 'revoked'
  dataSharing: {
    anonymized: boolean
    fullData: boolean
  }
  createdAt: string
  updatedAt: string
}

export interface MarketIntelligence {
  id: string
  softwareName: string
  category: string
  marketRank: number
  totalUsers: number
  averageRating: number
  growthRate: number
  competitorAnalysis: {
    mainCompetitors: string[]
    marketShare: number
  }
  updatedAt: string
}

export interface ApiKey {
  id: string
  name: string
  keyPrefix: string
  platform: 'lebonlogiciel' | 'prospection_saas'
  permissions: string[]
  isActive: boolean
  lastUsed?: string
  createdAt: string
  expiresAt?: string
}

export interface WebhookConfig {
  id: string
  name: string
  url: string
  events: string[]
  isActive: boolean
  secret: string
  lastTriggered?: string
  successRate: number
  createdAt: string
}

export interface BiMetric {
  id: string
  organizationId: string
  metricType: 'revenue' | 'usage' | 'satisfaction' | 'growth'
  value: number
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  timestamp: string
  metadata?: Record<string, any>
}

export interface BiDashboard {
  id: string
  name: string
  description?: string
  widgets: DashboardWidget[]
  isPublic: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface DashboardWidget {
  id: string
  type: 'chart' | 'metric' | 'table' | 'map'
  title: string
  config: Record<string, any>
  position: { x: number; y: number; w: number; h: number }
}

export interface TeamMember {
  id: string
  userId: string
  role: AdminUser['role']
  permissions: string[]
  invitedBy: string
  joinedAt: string
  lastActive?: string
}

export interface AuditLog {
  id: string
  userId: string
  action: string
  resource: string
  resourceId?: string
  details: Record<string, any>
  ipAddress: string
  userAgent: string
  timestamp: string
}

// Language support
export type Language = 'en' | 'fr'

export interface LanguageContext {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}