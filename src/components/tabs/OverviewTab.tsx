import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { 
  Building2, 
  Key, 
  TrendingUp, 
  Download,
  Users,
  DollarSign,
  Activity,
  BarChart3
} from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'
import { blink } from '../../blink/client'

interface OverviewStats {
  totalOrganizations: number
  activeLicenses: number
  monthlyRevenue: number
  dataExports: number
}

interface RecentActivity {
  id: string
  type: 'organization_added' | 'license_created' | 'data_exported' | 'api_call'
  description: string
  timestamp: string
  organizationName?: string
}

interface TopSoftware {
  name: string
  category: string
  usageCount: number
  growthRate: number
}

export const OverviewTab: React.FC = () => {
  const { t } = useLanguage()
  const [stats, setStats] = useState<OverviewStats>({
    totalOrganizations: 0,
    activeLicenses: 0,
    monthlyRevenue: 0,
    dataExports: 0
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [topSoftware, setTopSoftware] = useState<TopSoftware[]>([])
  const [loading, setLoading] = useState(true)

  const loadOverviewData = async () => {
    try {
      setLoading(true)
      
      // Load organizations count
      const organizations = await blink.db.adminOrganizations.list({
        limit: 1000
      })
      
      // Load licenses count (from shared LicenseHub database)
      const licenses = await blink.db.softwareLicenses.list({
        where: { status: 'active' },
        limit: 1000
      })
      
      // Load BI metrics for revenue calculation
      const revenueMetrics = await blink.db.adminBiMetrics.list({
        where: { 
          metricType: 'revenue',
          period: 'monthly'
        },
        orderBy: { timestamp: 'desc' },
        limit: 1
      })
      
      // Load recent audit logs for activity
      const auditLogs = await blink.db.adminAuditLogs?.list({
        orderBy: { timestamp: 'desc' },
        limit: 10
      }) || []
      
      // Load top software from market intelligence
      const marketData = await blink.db.adminMarketIntelligence.list({
        orderBy: { totalUsers: 'desc' },
        limit: 5
      })

      setStats({
        totalOrganizations: organizations.length,
        activeLicenses: licenses.length,
        monthlyRevenue: revenueMetrics[0]?.value || 0,
        dataExports: 156 // Mock data for now
      })

      // Transform audit logs to recent activity
      const activities: RecentActivity[] = auditLogs.map((log: any) => ({
        id: log.id,
        type: log.action as RecentActivity['type'],
        description: log.details?.description || `${log.action} performed`,
        timestamp: log.timestamp,
        organizationName: log.details?.organizationName
      }))
      
      setRecentActivity(activities)

      // Transform market data to top software
      const software: TopSoftware[] = marketData.map((item: any) => ({
        name: item.softwareName,
        category: item.category,
        usageCount: item.totalUsers,
        growthRate: item.growthRate || 0
      }))
      
      setTopSoftware(software)
      
    } catch (error) {
      console.error('Error loading overview data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOverviewData()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num)
  }

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'organization_added':
        return <Building2 className="h-4 w-4" />
      case 'license_created':
        return <Key className="h-4 w-4" />
      case 'data_exported':
        return <Download className="h-4 w-4" />
      case 'api_call':
        return <Activity className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: RecentActivity['type']) => {
    switch (type) {
      case 'organization_added':
        return 'bg-green-100 text-green-700'
      case 'license_created':
        return 'bg-blue-100 text-blue-700'
      case 'data_exported':
        return 'bg-purple-100 text-purple-700'
      case 'api_call':
        return 'bg-orange-100 text-orange-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">{t('overview.title')}</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-slate-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t('overview.title')}</h1>
          <p className="text-slate-600 mt-1">
            Vue d'ensemble de votre plateforme d'intelligence de données
          </p>
        </div>
        <Button onClick={loadOverviewData} variant="outline">
          <Activity className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{t('overview.total_organizations')}</p>
                <p className="text-3xl font-bold text-slate-900">{formatNumber(stats.totalOrganizations)}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+12% ce mois</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{t('overview.active_licenses')}</p>
                <p className="text-3xl font-bold text-slate-900">{formatNumber(stats.activeLicenses)}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Key className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+8% ce mois</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{t('overview.monthly_revenue')}</p>
                <p className="text-3xl font-bold text-slate-900">{formatCurrency(stats.monthlyRevenue)}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+15% ce mois</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{t('overview.data_exports')}</p>
                <p className="text-3xl font-bold text-slate-900">{formatNumber(stats.dataExports)}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Download className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+23% ce mois</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              {t('overview.recent_activity')}
            </CardTitle>
            <CardDescription>
              Dernières activités sur la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">
                        {activity.description}
                      </p>
                      {activity.organizationName && (
                        <p className="text-xs text-slate-500">
                          {activity.organizationName}
                        </p>
                      )}
                      <p className="text-xs text-slate-400">
                        {new Date(activity.timestamp).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">
                  Aucune activité récente
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Software */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {t('overview.top_software')}
            </CardTitle>
            <CardDescription>
              Logiciels les plus utilisés par vos clients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topSoftware.length > 0 ? (
                topSoftware.map((software, index) => (
                  <div key={software.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {software.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {software.category}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-900">
                        {formatNumber(software.usageCount)}
                      </p>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        <span className="text-xs text-green-600">
                          +{software.growthRate}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">
                  Aucune donnée de logiciel disponible
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}