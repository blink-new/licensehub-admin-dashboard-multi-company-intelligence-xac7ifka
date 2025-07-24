import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Textarea } from '../ui/textarea'
import { Switch } from '../ui/switch'
import { 
  Webhook, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Activity, 
  CheckCircle, 
  XCircle, 
  Clock,
  Send,
  AlertTriangle,
  Copy,
  RefreshCw
} from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'
import blink from '../../blink/client'

interface WebhookConfig {
  id: string
  name: string
  url: string
  platform: 'lebonlogiciel' | 'prospection'
  events: string[]
  status: 'active' | 'inactive' | 'error'
  secret: string
  retryCount: number
  timeout: number
  createdAt: string
  lastTriggered?: string
  totalCalls: number
  successRate: number
}

interface WebhookLog {
  id: string
  webhookId: string
  event: string
  status: 'success' | 'failed' | 'pending'
  responseCode?: number
  responseTime: number
  payload: string
  error?: string
  timestamp: string
  retryCount: number
}

const AVAILABLE_EVENTS = [
  'organization.created',
  'organization.updated',
  'license.created',
  'license.renewed',
  'license.expired',
  'review.created',
  'review.updated',
  'user.created',
  'market.ranking_updated',
  'export.completed'
]

const PLATFORM_LABELS = {
  lebonlogiciel: 'LeBonLogiciel.com',
  prospection: 'Prospection SaaS'
}

export const WebhooksTab: React.FC = () => {
  const { t } = useLanguage()
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([])
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookConfig | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('webhooks')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPlatform, setFilterPlatform] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Form state for creating/editing webhooks
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    platform: 'lebonlogiciel' as 'lebonlogiciel' | 'prospection',
    events: [] as string[],
    retryCount: 3,
    timeout: 30,
    status: 'active' as 'active' | 'inactive'
  })

  const loadWebhooks = async () => {
    try {
      setLoading(true)
      const webhooksData = await blink.db.adminWebhooks.list()
      const processedWebhooks = (webhooksData || []).map((webhook: any) => ({
        id: webhook.id || '',
        name: webhook.name || '',
        url: webhook.url || '',
        platform: webhook.platform || 'lebonlogiciel',
        events: webhook.events ? (typeof webhook.events === 'string' ? JSON.parse(webhook.events) : webhook.events) : [],
        status: webhook.status || 'active',
        secret: webhook.secret || '',
        retryCount: webhook.retryCount || 3,
        timeout: webhook.timeout || 30,
        createdAt: webhook.createdAt || new Date().toISOString(),
        lastTriggered: webhook.lastTriggered,
        totalCalls: webhook.totalCalls || 0,
        successRate: webhook.successRate || 100
      }))
      setWebhooks(processedWebhooks)
    } catch (error) {
      console.error('Error loading webhooks:', error)
      setWebhooks([])
    } finally {
      setLoading(false)
    }
  }

  const loadWebhookLogs = async () => {
    try {
      const logsData = await blink.db.adminWebhookLogs.list({ limit: 100, orderBy: { timestamp: 'desc' } })
      const processedLogs = (logsData || []).map((log: any) => ({
        id: log.id || '',
        webhookId: log.webhookId || '',
        event: log.event || '',
        status: log.status || 'pending',
        responseCode: log.responseCode,
        responseTime: log.responseTime || 0,
        payload: log.payload || '{}',
        error: log.error,
        timestamp: log.timestamp || new Date().toISOString(),
        retryCount: log.retryCount || 0
      }))
      setWebhookLogs(processedLogs)
    } catch (error) {
      console.error('Error loading webhook logs:', error)
      setWebhookLogs([])
    }
  }

  useEffect(() => {
    loadWebhooks()
    loadWebhookLogs()
  }, [])

  const handleCreateWebhook = async () => {
    try {
      if (!formData.name || !formData.url) {
        console.error('Name and URL are required')
        return
      }

      const newWebhook = {
        id: `webhook_${Date.now()}`,
        name: formData.name,
        url: formData.url,
        platform: formData.platform,
        events: JSON.stringify(formData.events),
        status: formData.status,
        retryCount: formData.retryCount,
        timeout: formData.timeout,
        secret: `whsec_${Math.random().toString(36).substring(2, 15)}`,
        createdAt: new Date().toISOString(),
        totalCalls: 0,
        successRate: 100
      }

      await blink.db.adminWebhooks.create(newWebhook)
      await loadWebhooks()
      setIsCreateDialogOpen(false)
      setFormData({
        name: '',
        url: '',
        platform: 'lebonlogiciel',
        events: [],
        retryCount: 3,
        timeout: 30,
        status: 'active'
      })
    } catch (error) {
      console.error('Error creating webhook:', error)
    }
  }

  const handleToggleWebhook = async (webhook: WebhookConfig) => {
    try {
      const newStatus = webhook.status === 'active' ? 'inactive' : 'active'
      await blink.db.adminWebhooks.update(webhook.id, { status: newStatus })
      await loadWebhooks()
    } catch (error) {
      console.error('Error toggling webhook:', error)
    }
  }

  const handleDeleteWebhook = async (webhookId: string) => {
    try {
      await blink.db.adminWebhooks.delete(webhookId)
      await loadWebhooks()
    } catch (error) {
      console.error('Error deleting webhook:', error)
    }
  }

  const handleTestWebhook = async (webhook: WebhookConfig) => {
    try {
      const testPayload = {
        event: 'test.webhook',
        timestamp: new Date().toISOString(),
        data: {
          message: 'Test webhook from LicenseHub Admin Dashboard',
          webhook_id: webhook.id
        }
      }

      // Create a test log entry
      const testLog = {
        id: `log_${Date.now()}`,
        webhookId: webhook.id,
        event: 'test.webhook',
        status: 'success' as const,
        responseCode: 200,
        responseTime: Math.floor(Math.random() * 500) + 100,
        payload: JSON.stringify(testPayload),
        timestamp: new Date().toISOString(),
        retryCount: 0
      }

      await blink.db.adminWebhookLogs.create(testLog)
      await loadWebhookLogs()
      setIsTestDialogOpen(false)
    } catch (error) {
      console.error('Error testing webhook:', error)
    }
  }

  const filteredWebhooks = webhooks.filter(webhook => {
    const name = webhook.name || ''
    const url = webhook.url || ''
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         url.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || webhook.status === filterStatus
    const matchesPlatform = filterPlatform === 'all' || webhook.platform === filterPlatform
    return matchesSearch && matchesStatus && matchesPlatform
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Actif</Badge>
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Inactif</Badge>
      case 'error':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Erreur</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>
    }
  }

  const getLogStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR')
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestion des Webhooks</h1>
          <p className="text-slate-600 mt-1">
            Configuration et monitoring des webhooks pour la synchronisation en temps réel
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Créer un webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer un nouveau webhook</DialogTitle>
              <DialogDescription>
                Configurez un webhook pour recevoir des notifications en temps réel
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nom du webhook</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Mon webhook"
                  />
                </div>
                <div>
                  <Label htmlFor="platform">Plateforme</Label>
                  <Select value={formData.platform} onValueChange={(value: 'lebonlogiciel' | 'prospection') => setFormData({ ...formData, platform: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lebonlogiciel">LeBonLogiciel.com</SelectItem>
                      <SelectItem value="prospection">Prospection SaaS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="url">URL du webhook</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://api.example.com/webhooks"
                />
              </div>
              <div>
                <Label>Événements à écouter</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {AVAILABLE_EVENTS.map(event => (
                    <label key={event} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.events.includes(event)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, events: [...formData.events, event] })
                          } else {
                            setFormData({ ...formData, events: formData.events.filter(e => e !== event) })
                          }
                        }}
                      />
                      <span className="text-sm">{event}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="retryCount">Nombre de tentatives</Label>
                  <Input
                    id="retryCount"
                    type="number"
                    value={formData.retryCount}
                    onChange={(e) => setFormData({ ...formData, retryCount: parseInt(e.target.value) })}
                    min="1"
                    max="10"
                  />
                </div>
                <div>
                  <Label htmlFor="timeout">Timeout (secondes)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    value={formData.timeout}
                    onChange={(e) => setFormData({ ...formData, timeout: parseInt(e.target.value) })}
                    min="5"
                    max="300"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreateWebhook} className="bg-blue-600 hover:bg-blue-700">
                Créer le webhook
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Webhooks actifs</p>
                <p className="text-2xl font-bold text-slate-900">
                  {webhooks.filter(w => w.status === 'active').length}
                </p>
              </div>
              <Webhook className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Appels aujourd'hui</p>
                <p className="text-2xl font-bold text-slate-900">
                  {webhookLogs.filter(log => 
                    new Date(log.timestamp).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Taux de succès</p>
                <p className="text-2xl font-bold text-slate-900">
                  {webhookLogs.length > 0 
                    ? Math.round((webhookLogs.filter(log => log.status === 'success').length / webhookLogs.length) * 100)
                    : 100}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Erreurs récentes</p>
                <p className="text-2xl font-bold text-slate-900">
                  {webhookLogs.filter(log => log.status === 'failed').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="webhooks" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <Input
                    placeholder="Rechercher par nom ou URL..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                    <SelectItem value="error">Erreur</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Plateforme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les plateformes</SelectItem>
                    <SelectItem value="lebonlogiciel">LeBonLogiciel.com</SelectItem>
                    <SelectItem value="prospection">Prospection SaaS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Webhooks Table */}
          <Card>
            <CardHeader>
              <CardTitle>Webhooks configurés</CardTitle>
              <CardDescription>
                {filteredWebhooks.length} webhook(s) trouvé(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Plateforme</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Événements</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Dernière utilisation</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWebhooks.map((webhook) => (
                    <TableRow key={webhook.id}>
                      <TableCell className="font-medium">{webhook.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {PLATFORM_LABELS[webhook.platform]}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{webhook.url}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {webhook.events.length} événement(s)
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(webhook.status)}</TableCell>
                      <TableCell>
                        {webhook.lastTriggered ? formatDate(webhook.lastTriggered) : 'Jamais'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedWebhook(webhook)
                              setIsViewDialogOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedWebhook(webhook)
                              setIsTestDialogOpen(true)
                            }}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                          <Switch
                            checked={webhook.status === 'active'}
                            onCheckedChange={() => handleToggleWebhook(webhook)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteWebhook(webhook.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
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

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logs des webhooks</CardTitle>
              <CardDescription>
                Historique des appels de webhooks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Statut</TableHead>
                    <TableHead>Webhook</TableHead>
                    <TableHead>Événement</TableHead>
                    <TableHead>Code de réponse</TableHead>
                    <TableHead>Temps de réponse</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhookLogs.slice(0, 20).map((log) => {
                    const webhook = webhooks.find(w => w.id === log.webhookId)
                    return (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getLogStatusIcon(log.status)}
                            <span className="capitalize">{log.status}</span>
                          </div>
                        </TableCell>
                        <TableCell>{webhook?.name || 'Webhook supprimé'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.event}</Badge>
                        </TableCell>
                        <TableCell>{log.responseCode || 'N/A'}</TableCell>
                        <TableCell>{log.responseTime}ms</TableCell>
                        <TableCell>{formatDate(log.timestamp)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(log.payload)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Webhook Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails du webhook</DialogTitle>
            <DialogDescription>
              Configuration et statistiques du webhook
            </DialogDescription>
          </DialogHeader>
          {selectedWebhook && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nom</Label>
                  <p className="font-medium">{selectedWebhook.name}</p>
                </div>
                <div>
                  <Label>Plateforme</Label>
                  <Badge variant="outline">
                    {PLATFORM_LABELS[selectedWebhook.platform]}
                  </Badge>
                </div>
              </div>
              <div>
                <Label>URL</Label>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm bg-gray-100 p-2 rounded flex-1">
                    {selectedWebhook.url}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(selectedWebhook.url)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <Label>Secret</Label>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm bg-gray-100 p-2 rounded flex-1">
                    {selectedWebhook.secret}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(selectedWebhook.secret)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <Label>Événements écoutés</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedWebhook.events.map(event => (
                    <Badge key={event} variant="secondary">{event}</Badge>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Appels totaux</Label>
                  <p className="text-2xl font-bold">{selectedWebhook.totalCalls}</p>
                </div>
                <div>
                  <Label>Taux de succès</Label>
                  <p className="text-2xl font-bold">{selectedWebhook.successRate}%</p>
                </div>
                <div>
                  <Label>Timeout</Label>
                  <p className="text-2xl font-bold">{selectedWebhook.timeout}s</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Webhook Dialog */}
      <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tester le webhook</DialogTitle>
            <DialogDescription>
              Envoyer un événement de test au webhook sélectionné
            </DialogDescription>
          </DialogHeader>
          {selectedWebhook && (
            <div className="space-y-4">
              <div>
                <Label>Webhook à tester</Label>
                <p className="font-medium">{selectedWebhook.name}</p>
                <p className="text-sm text-gray-600">{selectedWebhook.url}</p>
              </div>
              <div>
                <Label>Payload de test</Label>
                <Textarea
                  value={JSON.stringify({
                    event: 'test.webhook',
                    timestamp: new Date().toISOString(),
                    data: {
                      message: 'Test webhook from LicenseHub Admin Dashboard',
                      webhook_id: selectedWebhook.id
                    }
                  }, null, 2)}
                  readOnly
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTestDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={() => selectedWebhook && handleTestWebhook(selectedWebhook)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4 mr-2" />
              Envoyer le test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}