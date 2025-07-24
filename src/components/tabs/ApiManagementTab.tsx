import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Switch } from '../ui/switch'
import { Textarea } from '../ui/textarea'
import { 
  Key, 
  Plus, 
  Eye, 
  EyeOff, 
  Copy, 
  Trash2, 
  Settings, 
  Activity, 
  Globe, 
  Shield,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Code,
  Database,
  Zap
} from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'
import blink from '../../blink/client'

interface ApiKey {
  id: string
  name: string
  key: string
  platform: 'lebonlogiciel' | 'prospection_saas' | 'general'
  permissions: string[]
  status: 'active' | 'inactive' | 'expired'
  created_at: string
  last_used: string | null
  usage_count: number
  rate_limit: number
  expires_at: string | null
  description: string
  ip_whitelist: string[]
}

interface ApiEndpoint {
  id: string
  name: string
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  description: string
  data_type: 'anonymized' | 'full' | 'aggregated'
  platform: 'lebonlogiciel' | 'prospection_saas' | 'general'
  status: 'active' | 'inactive' | 'maintenance'
  response_time_avg: number
  calls_today: number
  success_rate: number
}

export const ApiManagementTab: React.FC = () => {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState('keys')
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [apiEndpoints, setApiEndpoints] = useState<ApiEndpoint[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showKeyValue, setShowKeyValue] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPlatform, setFilterPlatform] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Form states
  const [newKeyForm, setNewKeyForm] = useState({
    name: '',
    platform: 'lebonlogiciel' as const,
    permissions: [] as string[],
    rate_limit: 1000,
    expires_at: '',
    description: '',
    ip_whitelist: ''
  })

  const generateApiKey = () => {
    return 'lh_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Jamais'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num)
  }

  const getPlatformBadge = (platform: string) => {
    const badges = {
      lebonlogiciel: { label: 'LeBonLogiciel.com', color: 'bg-green-100 text-green-800' },
      prospection_saas: { label: 'Prospection SaaS', color: 'bg-blue-100 text-blue-800' },
      general: { label: 'Général', color: 'bg-gray-100 text-gray-800' }
    }
    const badge = badges[platform as keyof typeof badges] || badges.general
    return <Badge className={badge.color}>{badge.label}</Badge>
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      active: { label: 'Actif', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      inactive: { label: 'Inactif', color: 'bg-red-100 text-red-800', icon: XCircle },
      expired: { label: 'Expiré', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
      maintenance: { label: 'Maintenance', color: 'bg-orange-100 text-orange-800', icon: Settings }
    }
    const badge = badges[status as keyof typeof badges] || badges.active
    const Icon = badge.icon
    return (
      <Badge className={badge.color}>
        <Icon className="h-3 w-3 mr-1" />
        {badge.label}
      </Badge>
    )
  }

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load API keys
      const keysData = await blink.db.adminApiKeys.list()
      const mappedKeys = keysData.map((key: any) => ({
        id: key.id,
        name: key.name || 'N/A',
        key: key.api_key || key.apiKey || '',
        platform: key.platform || 'general',
        permissions: key.permissions ? JSON.parse(key.permissions) : [],
        status: key.status || 'active',
        created_at: key.created_at || key.createdAt || new Date().toISOString(),
        last_used: key.last_used || key.lastUsed,
        usage_count: key.usage_count || key.usageCount || 0,
        rate_limit: key.rate_limit || key.rateLimit || 1000,
        expires_at: key.expires_at || key.expiresAt,
        description: key.description || '',
        ip_whitelist: key.ip_whitelist ? JSON.parse(key.ip_whitelist) : key.ipWhitelist ? JSON.parse(key.ipWhitelist) : []
      }))
      setApiKeys(mappedKeys)

      // Load API endpoints
      const endpointsData = await blink.db.adminApiEndpoints.list()
      const mappedEndpoints = endpointsData.map((endpoint: any) => ({
        id: endpoint.id,
        name: endpoint.name || 'N/A',
        path: endpoint.path || '',
        method: endpoint.method || 'GET',
        description: endpoint.description || '',
        data_type: endpoint.data_type || endpoint.dataType || 'anonymized',
        platform: endpoint.platform || 'general',
        status: endpoint.status || 'active',
        response_time_avg: endpoint.response_time_avg || endpoint.responseTimeAvg || 0,
        calls_today: endpoint.calls_today || endpoint.callsToday || 0,
        success_rate: endpoint.success_rate || endpoint.successRate || 100
      }))
      setApiEndpoints(mappedEndpoints)

    } catch (error) {
      console.error('Error loading API data:', error)
      setApiKeys([])
      setApiEndpoints([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateApiKey = async () => {
    try {
      const newKey = {
        id: `key_${Date.now()}`,
        name: newKeyForm.name,
        apiKey: generateApiKey(),
        platform: newKeyForm.platform,
        permissions: JSON.stringify(newKeyForm.permissions),
        status: 'active',
        createdAt: new Date().toISOString(),
        lastUsed: null,
        usageCount: 0,
        rateLimit: newKeyForm.rate_limit,
        expiresAt: newKeyForm.expires_at || null,
        description: newKeyForm.description,
        ipWhitelist: JSON.stringify(newKeyForm.ip_whitelist.split(',').map(ip => ip.trim()).filter(ip => ip)),
        keyPrefix: 'lh_custom',
        keyHash: 'hash_' + Date.now(),
        isActive: true
      }

      await blink.db.adminApiKeys.create(newKey)
      await loadData()
      setShowCreateDialog(false)
      setNewKeyForm({
        name: '',
        platform: 'lebonlogiciel',
        permissions: [],
        rate_limit: 1000,
        expires_at: '',
        description: '',
        ip_whitelist: ''
      })
    } catch (error) {
      console.error('Error creating API key:', error)
    }
  }

  const handleDeleteApiKey = async (keyId: string) => {
    try {
      await blink.db.adminApiKeys.delete(keyId)
      await loadData()
    } catch (error) {
      console.error('Error deleting API key:', error)
    }
  }

  const handleToggleKeyStatus = async (keyId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
      await blink.db.adminApiKeys.update(keyId, { status: newStatus })
      await loadData()
    } catch (error) {
      console.error('Error updating API key status:', error)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredApiKeys = apiKeys.filter(key => {
    const name = key.name || ''
    const description = key.description || ''
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPlatform = filterPlatform === 'all' || key.platform === filterPlatform
    const matchesStatus = filterStatus === 'all' || key.status === filterStatus
    return matchesSearch && matchesPlatform && matchesStatus
  })

  const filteredEndpoints = apiEndpoints.filter(endpoint => {
    const name = endpoint.name || ''
    const path = endpoint.path || ''
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         path.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPlatform = filterPlatform === 'all' || endpoint.platform === filterPlatform
    const matchesStatus = filterStatus === 'all' || endpoint.status === filterStatus
    return matchesSearch && matchesPlatform && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement des données API...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestion des API</h1>
          <p className="text-slate-600 mt-1">
            Gérez les clés API et endpoints pour les intégrations externes
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Créer une clé API
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle clé API</DialogTitle>
              <DialogDescription>
                Configurez une nouvelle clé API pour l'intégration avec vos plateformes externes
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nom de la clé</Label>
                  <Input
                    id="name"
                    value={newKeyForm.name}
                    onChange={(e) => setNewKeyForm({...newKeyForm, name: e.target.value})}
                    placeholder="Ex: LeBonLogiciel Production"
                  />
                </div>
                <div>
                  <Label htmlFor="platform">Plateforme</Label>
                  <Select value={newKeyForm.platform} onValueChange={(value: any) => setNewKeyForm({...newKeyForm, platform: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lebonlogiciel">LeBonLogiciel.com</SelectItem>
                      <SelectItem value="prospection_saas">Prospection SaaS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newKeyForm.description}
                  onChange={(e) => setNewKeyForm({...newKeyForm, description: e.target.value})}
                  placeholder="Description de l'utilisation de cette clé API"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rate_limit">Limite de taux (req/h)</Label>
                  <Input
                    id="rate_limit"
                    type="number"
                    value={newKeyForm.rate_limit}
                    onChange={(e) => setNewKeyForm({...newKeyForm, rate_limit: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="expires_at">Date d'expiration (optionnel)</Label>
                  <Input
                    id="expires_at"
                    type="datetime-local"
                    value={newKeyForm.expires_at}
                    onChange={(e) => setNewKeyForm({...newKeyForm, expires_at: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="ip_whitelist">Liste blanche IP (optionnel)</Label>
                <Input
                  id="ip_whitelist"
                  value={newKeyForm.ip_whitelist}
                  onChange={(e) => setNewKeyForm({...newKeyForm, ip_whitelist: e.target.value})}
                  placeholder="192.168.1.1, 10.0.0.1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreateApiKey} className="bg-blue-600 hover:bg-blue-700">
                Créer la clé API
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Clés API Actives</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatNumber(apiKeys.filter(k => k.status === 'active').length)}
                </p>
              </div>
              <Key className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Endpoints Actifs</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatNumber(apiEndpoints.filter(e => e.status === 'active').length)}
                </p>
              </div>
              <Globe className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Appels Aujourd'hui</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatNumber(apiEndpoints.reduce((sum, e) => sum + e.calls_today, 0))}
                </p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Taux de Succès</p>
                <p className="text-2xl font-bold text-slate-900">
                  {apiEndpoints.length > 0 
                    ? Math.round(apiEndpoints.reduce((sum, e) => sum + e.success_rate, 0) / apiEndpoints.length)
                    : 0}%
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="keys" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Clés API
          </TabsTrigger>
          <TabsTrigger value="endpoints" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Endpoints
          </TabsTrigger>
          <TabsTrigger value="usage" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Utilisation
          </TabsTrigger>
          <TabsTrigger value="docs" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Documentation
          </TabsTrigger>
        </TabsList>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <div className="flex-1">
            <Input
              placeholder="Rechercher par nom ou description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="flex gap-2">
            <Select value={filterPlatform} onValueChange={setFilterPlatform}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Toutes les plateformes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les plateformes</SelectItem>
                <SelectItem value="lebonlogiciel">LeBonLogiciel.com</SelectItem>
                <SelectItem value="prospection_saas">Prospection SaaS</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="inactive">Inactif</SelectItem>
                <SelectItem value="expired">Expiré</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="keys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Clés API</CardTitle>
              <CardDescription>
                Gérez les clés d'accès pour vos intégrations externes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Plateforme</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Utilisation</TableHead>
                    <TableHead>Dernière utilisation</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApiKeys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{key.name}</p>
                          <p className="text-sm text-slate-500">{key.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getPlatformBadge(key.platform)}</TableCell>
                      <TableCell>{getStatusBadge(key.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{formatNumber(key.usage_count)} appels</p>
                          <p className="text-slate-500">Limite: {formatNumber(key.rate_limit)}/h</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(key.last_used)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowKeyValue(showKeyValue === key.id ? null : key.id)}
                          >
                            {showKeyValue === key.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(key.key)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Switch
                            checked={key.status === 'active'}
                            onCheckedChange={() => handleToggleKeyStatus(key.id, key.status)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteApiKey(key.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        {showKeyValue === key.id && (
                          <div className="mt-2 p-2 bg-slate-100 rounded text-xs font-mono">
                            {key.key}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Endpoints API</CardTitle>
              <CardDescription>
                Surveillez les performances de vos endpoints API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Méthode</TableHead>
                    <TableHead>Type de données</TableHead>
                    <TableHead>Plateforme</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEndpoints.map((endpoint) => (
                    <TableRow key={endpoint.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{endpoint.name}</p>
                          <p className="text-sm text-slate-500 font-mono">{endpoint.path}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          endpoint.method === 'GET' ? 'border-green-200 text-green-800' :
                          endpoint.method === 'POST' ? 'border-blue-200 text-blue-800' :
                          endpoint.method === 'PUT' ? 'border-yellow-200 text-yellow-800' :
                          'border-red-200 text-red-800'
                        }>
                          {endpoint.method}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          endpoint.data_type === 'anonymized' ? 'border-green-200 text-green-800' :
                          endpoint.data_type === 'full' ? 'border-red-200 text-red-800' :
                          'border-blue-200 text-blue-800'
                        }>
                          {endpoint.data_type === 'anonymized' ? 'Anonymisé' :
                           endpoint.data_type === 'full' ? 'Complet' : 'Agrégé'}
                        </Badge>
                      </TableCell>
                      <TableCell>{getPlatformBadge(endpoint.platform)}</TableCell>
                      <TableCell>{getStatusBadge(endpoint.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{formatNumber(endpoint.calls_today)} appels/jour</p>
                          <p className="text-slate-500">{endpoint.response_time_avg}ms • {endpoint.success_rate}%</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analyse d'utilisation</CardTitle>
              <CardDescription>
                Surveillez l'utilisation de vos API en temps réel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500 mb-2">Graphiques d'utilisation</p>
                <p className="text-sm text-slate-400">
                  Intégration avec des graphiques de performance en temps réel
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documentation API</CardTitle>
              <CardDescription>
                Documentation interactive pour vos intégrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-green-200">
                    <CardHeader>
                      <CardTitle className="text-green-800 flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        LeBonLogiciel.com API
                      </CardTitle>
                      <CardDescription>
                        Données anonymisées pour votre site de comparaison
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                          <span className="text-sm font-mono">GET /api/v1/software/rankings</span>
                          <Badge className="bg-green-100 text-green-800">Anonymisé</Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                          <span className="text-sm font-mono">GET /api/v1/reviews/aggregated</span>
                          <Badge className="bg-green-100 text-green-800">Anonymisé</Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                          <span className="text-sm font-mono">GET /api/v1/market/trends</span>
                          <Badge className="bg-green-100 text-green-800">Anonymisé</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-blue-800 flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Prospection SaaS API
                      </CardTitle>
                      <CardDescription>
                        Données complètes avec consentement pour prospection
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                          <span className="text-sm font-mono">GET /api/v1/companies/full</span>
                          <Badge className="bg-red-100 text-red-800">Complet</Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                          <span className="text-sm font-mono">GET /api/v1/contacts/verified</span>
                          <Badge className="bg-red-100 text-red-800">Complet</Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                          <span className="text-sm font-mono">GET /api/v1/licenses/detailed</span>
                          <Badge className="bg-red-100 text-red-800">Complet</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Authentification</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-sm text-slate-600 mb-2">Toutes les requêtes doivent inclure l'en-tête d'authentification :</p>
                      <code className="text-sm bg-slate-800 text-slate-100 p-2 rounded block">
                        Authorization: Bearer YOUR_API_KEY
                      </code>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}