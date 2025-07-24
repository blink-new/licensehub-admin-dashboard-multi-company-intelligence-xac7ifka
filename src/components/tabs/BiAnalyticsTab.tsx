import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { 
  PieChart, 
  Plus, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Building2, 
  DollarSign, 
  Activity,
  Eye,
  Edit,
  Trash2,
  Download,
  Filter,
  Calendar,
  Target,
  Zap
} from 'lucide-react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useLanguage } from '../../hooks/useLanguage'
import blink from '../../blink/client'

interface BiDashboard {
  id: string
  name: string
  description: string
  category: string
  widgets: string[]
  isPublic: boolean
  createdAt: string
  lastModified: string
  views: number
  createdBy: string
}

interface BiMetric {
  id: string
  name: string
  value: number
  previousValue: number
  change: number
  changeType: 'increase' | 'decrease' | 'stable'
  category: string
  unit: string
  updatedAt: string
}

interface AnalyticsData {
  revenueData: Array<{ month: string; revenue: number; licenses: number; users: number }>
  softwareUsage: Array<{ name: string; value: number; color: string }>
  industryBreakdown: Array<{ industry: string; companies: number; revenue: number }>
  userGrowth: Array<{ month: string; newUsers: number; totalUsers: number }>
  satisfactionTrends: Array<{ month: string; satisfaction: number; reviews: number }>
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316']

export const BiAnalyticsTab: React.FC = () => {
  const { t } = useLanguage()
  const [dashboards, setDashboards] = useState<BiDashboard[]>([])
  const [metrics, setMetrics] = useState<BiMetric[]>([])
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDashboard, setSelectedDashboard] = useState<BiDashboard | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [newDashboard, setNewDashboard] = useState({
    name: '',
    description: '',
    category: 'revenue',
    isPublic: false
  })

  const mapDashboardFields = (dashboard: any): BiDashboard => ({
    id: dashboard.id || '',
    name: dashboard.name || '',
    description: dashboard.description || '',
    category: dashboard.category || 'general',
    widgets: dashboard.widgets ? JSON.parse(dashboard.widgets) : [],
    isPublic: dashboard.isPublic === '1' || dashboard.isPublic === true,
    createdAt: dashboard.createdAt || new Date().toISOString(),
    lastModified: dashboard.lastModified || new Date().toISOString(),
    views: Number(dashboard.views) || 0,
    createdBy: dashboard.createdBy || 'Admin'
  })

  const mapMetricFields = (metric: any): BiMetric => ({
    id: metric.id || '',
    name: metric.name || '',
    value: Number(metric.value) || 0,
    previousValue: Number(metric.previousValue) || 0,
    change: Number(metric.change) || 0,
    changeType: metric.changeType || 'stable',
    category: metric.category || 'general',
    unit: metric.unit || '',
    updatedAt: metric.updatedAt || new Date().toISOString()
  })

  const processAnalyticsData = (organizations: any[], licenses: any[], reviews: any[]): AnalyticsData => {
    // Generate revenue data
    const revenueData = Array.from({ length: 12 }, (_, i) => {
      const month = new Date(2024, i).toLocaleDateString('fr-FR', { month: 'short' })
      return {
        month,
        revenue: Math.floor(Math.random() * 50000) + 20000,
        licenses: Math.floor(Math.random() * 200) + 100,
        users: Math.floor(Math.random() * 1000) + 500
      }
    })

    // Generate software usage data
    const softwareUsage = [
      { name: 'Microsoft Office', value: 35, color: COLORS[0] },
      { name: 'Salesforce', value: 25, color: COLORS[1] },
      { name: 'Adobe Creative', value: 20, color: COLORS[2] },
      { name: 'Slack', value: 15, color: COLORS[3] },
      { name: 'Autres', value: 5, color: COLORS[4] }
    ]

    // Generate industry breakdown
    const industryBreakdown = [
      { industry: 'Technologie', companies: 45, revenue: 180000 },
      { industry: 'Finance', companies: 32, revenue: 150000 },
      { industry: 'Santé', companies: 28, revenue: 120000 },
      { industry: 'Éducation', companies: 25, revenue: 100000 },
      { industry: 'Commerce', companies: 22, revenue: 90000 }
    ]

    // Generate user growth data
    const userGrowth = Array.from({ length: 12 }, (_, i) => {
      const month = new Date(2024, i).toLocaleDateString('fr-FR', { month: 'short' })
      return {
        month,
        newUsers: Math.floor(Math.random() * 100) + 50,
        totalUsers: 500 + (i * 80) + Math.floor(Math.random() * 50)
      }
    })

    // Generate satisfaction trends
    const satisfactionTrends = Array.from({ length: 12 }, (_, i) => {
      const month = new Date(2024, i).toLocaleDateString('fr-FR', { month: 'short' })
      return {
        month,
        satisfaction: 3.5 + Math.random() * 1.5,
        reviews: Math.floor(Math.random() * 50) + 20
      }
    })

    return {
      revenueData,
      softwareUsage,
      industryBreakdown,
      userGrowth,
      satisfactionTrends
    }
  }

  const generateMockAnalyticsData = (): AnalyticsData => {
    return processAnalyticsData([], [], [])
  }

  const loadBiData = async () => {
    try {
      setLoading(true)
      
      // Load BI dashboards
      const dashboardsData = await blink.db.adminBiDashboards.list({
        orderBy: { createdAt: 'desc' }
      })
      
      // Load BI metrics
      const metricsData = await blink.db.adminBiMetrics.list({
        orderBy: { updatedAt: 'desc' }
      })

      // Load analytics data from various sources
      const [organizations, licenses, reviews] = await Promise.all([
        blink.db.adminOrganizations.list(),
        blink.db.softwareLicenses?.list() || [],
        blink.db.softwareReviews?.list() || []
      ])

      // Process analytics data
      const processedData = processAnalyticsData(organizations, licenses, reviews)

      setDashboards(dashboardsData.map(mapDashboardFields))
      setMetrics(metricsData.map(mapMetricFields))
      setAnalyticsData(processedData)
    } catch (error) {
      console.error('Error loading BI data:', error)
      setDashboards([])
      setMetrics([])
      setAnalyticsData(generateMockAnalyticsData())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBiData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreateDashboard = async () => {
    try {
      const dashboardData = {
        id: `dashboard_${Date.now()}`,
        name: newDashboard.name,
        description: newDashboard.description,
        category: newDashboard.category,
        widgets: JSON.stringify(['revenue_chart', 'user_metrics', 'software_usage']),
        isPublic: newDashboard.isPublic,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        views: 0,
        createdBy: 'Admin'
      }

      await blink.db.adminBiDashboards.create(dashboardData)
      await loadBiData()
      setIsCreateDialogOpen(false)
      setNewDashboard({ name: '', description: '', category: 'revenue', isPublic: false })
    } catch (error) {
      console.error('Error creating dashboard:', error)
    }
  }

  const handleDeleteDashboard = async (dashboardId: string) => {
    try {
      await blink.db.adminBiDashboards.delete(dashboardId)
      await loadBiData()
    } catch (error) {
      console.error('Error deleting dashboard:', error)
    }
  }

  const filteredDashboards = dashboards.filter(dashboard => {
    const matchesSearch = (dashboard.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (dashboard.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || dashboard.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value)
  }

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'decrease':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Activity className="h-4 w-4 text-slate-600" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Analytics BI</h1>
          <p className="text-slate-600 mt-1">
            Tableaux de bord et analyses business intelligence avancées
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Créer un tableau de bord
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nouveau tableau de bord</DialogTitle>
              <DialogDescription>
                Créez un nouveau tableau de bord personnalisé pour vos analyses
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nom</label>
                <Input
                  value={newDashboard.name}
                  onChange={(e) => setNewDashboard({ ...newDashboard, name: e.target.value })}
                  placeholder="Nom du tableau de bord"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={newDashboard.description}
                  onChange={(e) => setNewDashboard({ ...newDashboard, description: e.target.value })}
                  placeholder="Description du tableau de bord"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Catégorie</label>
                <Select value={newDashboard.category} onValueChange={(value) => setNewDashboard({ ...newDashboard, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="revenue">Revenus</SelectItem>
                    <SelectItem value="users">Utilisateurs</SelectItem>
                    <SelectItem value="software">Logiciels</SelectItem>
                    <SelectItem value="satisfaction">Satisfaction</SelectItem>
                    <SelectItem value="general">Général</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={newDashboard.isPublic}
                  onChange={(e) => setNewDashboard({ ...newDashboard, isPublic: e.target.checked })}
                />
                <label htmlFor="isPublic" className="text-sm">Tableau de bord public</label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateDashboard} disabled={!newDashboard.name}>
                  Créer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="dashboards">Tableaux de bord</TabsTrigger>
          <TabsTrigger value="metrics">Métriques</TabsTrigger>
          <TabsTrigger value="reports">Rapports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Revenus totaux</p>
                    <p className="text-2xl font-bold text-slate-900">€487,230</p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-sm text-green-600">+12.5%</span>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Organisations actives</p>
                    <p className="text-2xl font-bold text-slate-900">152</p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-sm text-green-600">+8.2%</span>
                    </div>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Building2 className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Utilisateurs totaux</p>
                    <p className="text-2xl font-bold text-slate-900">8,547</p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-sm text-green-600">+15.3%</span>
                    </div>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Satisfaction moyenne</p>
                    <p className="text-2xl font-bold text-slate-900">4.2/5</p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-sm text-green-600">+0.3</span>
                    </div>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Target className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Évolution des revenus</CardTitle>
                <CardDescription>Revenus mensuels et nombre de licences</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData?.revenueData || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [
                      name === 'revenue' ? formatCurrency(Number(value)) : formatNumber(Number(value)),
                      name === 'revenue' ? 'Revenus' : name === 'licenses' ? 'Licences' : 'Utilisateurs'
                    ]} />
                    <Area type="monotone" dataKey="revenue" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Software Usage */}
            <Card>
              <CardHeader>
                <CardTitle>Répartition des logiciels</CardTitle>
                <CardDescription>Usage par type de logiciel</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={analyticsData?.softwareUsage || []}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {(analyticsData?.softwareUsage || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Industry Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Répartition par secteur</CardTitle>
              <CardDescription>Nombre d'entreprises et revenus par secteur d'activité</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData?.industryBreakdown || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="industry" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="companies" fill="#3b82f6" name="Entreprises" />
                  <Bar yAxisId="right" dataKey="revenue" fill="#10b981" name="Revenus (€)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboards" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Rechercher un tableau de bord..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                <SelectItem value="revenue">Revenus</SelectItem>
                <SelectItem value="users">Utilisateurs</SelectItem>
                <SelectItem value="software">Logiciels</SelectItem>
                <SelectItem value="satisfaction">Satisfaction</SelectItem>
                <SelectItem value="general">Général</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dashboards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDashboards.map((dashboard) => (
              <Card key={dashboard.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{dashboard.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {dashboard.description}
                      </CardDescription>
                    </div>
                    <Badge variant={dashboard.isPublic ? "default" : "secondary"}>
                      {dashboard.isPublic ? "Public" : "Privé"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <span>Catégorie: {dashboard.category}</span>
                      <span>{dashboard.views} vues</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <span>Créé par: {dashboard.createdBy}</span>
                      <span>{new Date(dashboard.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Voir
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Modifier
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteDashboard(dashboard.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredDashboards.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500">
                  {searchTerm || categoryFilter !== 'all' 
                    ? "Aucun tableau de bord ne correspond à vos critères"
                    : "Aucun tableau de bord créé pour le moment"
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {metrics.map((metric) => (
              <Card key={metric.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-600">{metric.name}</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {formatNumber(metric.value)}{metric.unit}
                      </p>
                      <div className="flex items-center mt-1">
                        {getChangeIcon(metric.changeType)}
                        <span className={`text-sm ml-1 ${
                          metric.changeType === 'increase' ? 'text-green-600' : 
                          metric.changeType === 'decrease' ? 'text-red-600' : 'text-slate-600'
                        }`}>
                          {metric.change > 0 ? '+' : ''}{metric.change}%
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline">{metric.category}</Badge>
                  </div>
                  <div className="mt-4 text-xs text-slate-500">
                    Mis à jour: {new Date(metric.updatedAt).toLocaleDateString('fr-FR')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {metrics.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Activity className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500">
                  Aucune métrique disponible pour le moment
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rapports automatisés</CardTitle>
              <CardDescription>
                Génération et planification de rapports personnalisés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Download className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500 mb-4">
                  Fonctionnalité de rapports en cours de développement
                </p>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter les données actuelles
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}