import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Switch } from '../ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Users,
  Calendar,
  Globe,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Mail,
  Phone,
  MapPin
} from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'
import blink from '../../blink/client'

interface Organization {
  id: string
  name: string
  domain: string
  industry: string
  size: string
  country: string
  contact_email: string
  contact_phone: string
  address: string
  status: 'active' | 'inactive' | 'pending'
  consent_lebonlogiciel: boolean
  consent_prospection: boolean
  consent_date: string
  total_licenses: number
  total_users: number
  monthly_revenue: number
  created_at: string
  last_activity: string
}

export const OrganizationsTab: React.FC = () => {
  const { t } = useLanguage()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [consentFilter, setConsentFilter] = useState<string>('all')
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  // Form state for add/edit
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    industry: '',
    size: '',
    country: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    consent_lebonlogiciel: false,
    consent_prospection: false
  })

  const loadOrganizations = async () => {
    try {
      setLoading(true)
      const data = await blink.db.adminOrganizations.list({
        orderBy: { createdAt: 'desc' }
      })
      // Ensure all required fields have default values
      const safeData = data.map(org => ({
        ...org,
        name: org.name || '',
        domain: org.domain || '',
        industry: org.industry || '',
        size: org.size || '',
        country: org.country || '',
        contact_email: org.contactEmail || org.contact_email || '',
        contact_phone: org.contactPhone || org.contact_phone || '',
        address: org.address || '',
        status: org.status || 'pending',
        consent_lebonlogiciel: Boolean(org.consentLebonlogiciel || org.consent_lebonlogiciel),
        consent_prospection: Boolean(org.consentProspection || org.consent_prospection),
        consent_date: org.consentDate || org.consent_date || new Date().toISOString(),
        total_licenses: org.totalLicenses || org.total_licenses || 0,
        total_users: org.totalUsers || org.total_users || 0,
        monthly_revenue: org.monthlyRevenue || org.monthly_revenue || 0,
        created_at: org.createdAt || org.created_at || new Date().toISOString(),
        last_activity: org.lastActivity || org.last_activity || new Date().toISOString()
      }))
      setOrganizations(safeData)
    } catch (error) {
      console.error('Error loading organizations:', error)
      // Set empty array on error to prevent further issues
      setOrganizations([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrganizations()
  }, [])

  const handleAddOrganization = async () => {
    try {
      await blink.db.adminOrganizations.create({
        name: formData.name,
        domain: formData.domain,
        industry: formData.industry,
        size: formData.size,
        country: formData.country,
        contactEmail: formData.contact_email,
        contactPhone: formData.contact_phone,
        address: formData.address,
        status: 'active',
        consentLebonlogiciel: formData.consent_lebonlogiciel,
        consentProspection: formData.consent_prospection,
        consentDate: new Date().toISOString(),
        totalLicenses: 0,
        totalUsers: 0,
        monthlyRevenue: 0,
        lastActivity: new Date().toISOString()
      })
      
      setIsAddDialogOpen(false)
      setFormData({
        name: '',
        domain: '',
        industry: '',
        size: '',
        country: '',
        contact_email: '',
        contact_phone: '',
        address: '',
        consent_lebonlogiciel: false,
        consent_prospection: false
      })
      loadOrganizations()
    } catch (error) {
      console.error('Error adding organization:', error)
    }
  }

  const handleEditOrganization = async () => {
    if (!selectedOrg) return
    
    try {
      await blink.db.adminOrganizations.update(selectedOrg.id, {
        name: formData.name,
        domain: formData.domain,
        industry: formData.industry,
        size: formData.size,
        country: formData.country,
        contactEmail: formData.contact_email,
        contactPhone: formData.contact_phone,
        address: formData.address,
        consentLebonlogiciel: formData.consent_lebonlogiciel,
        consentProspection: formData.consent_prospection
      })
      setIsEditDialogOpen(false)
      setSelectedOrg(null)
      loadOrganizations()
    } catch (error) {
      console.error('Error updating organization:', error)
    }
  }

  const handleDeleteOrganization = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette organisation ?')) return
    
    try {
      await blink.db.adminOrganizations.delete(id)
      loadOrganizations()
    } catch (error) {
      console.error('Error deleting organization:', error)
    }
  }

  const openEditDialog = (org: Organization) => {
    setSelectedOrg(org)
    setFormData({
      name: org.name,
      domain: org.domain,
      industry: org.industry,
      size: org.size,
      country: org.country,
      contact_email: org.contact_email,
      contact_phone: org.contact_phone,
      address: org.address,
      consent_lebonlogiciel: org.consent_lebonlogiciel,
      consent_prospection: org.consent_prospection
    })
    setIsEditDialogOpen(true)
  }

  const openViewDialog = (org: Organization) => {
    setSelectedOrg(org)
    setIsViewDialogOpen(true)
  }

  // Filter organizations with null/undefined safety
  const filteredOrganizations = organizations.filter(org => {
    // Safe string matching with null/undefined checks
    const name = org.name || ''
    const domain = org.domain || ''
    const industry = org.industry || ''
    
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         industry.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || org.status === statusFilter
    
    const matchesConsent = consentFilter === 'all' || 
                          (consentFilter === 'both' && org.consent_lebonlogiciel && org.consent_prospection) ||
                          (consentFilter === 'lebonlogiciel' && org.consent_lebonlogiciel) ||
                          (consentFilter === 'prospection' && org.consent_prospection) ||
                          (consentFilter === 'none' && !org.consent_lebonlogiciel && !org.consent_prospection)
    
    return matchesSearch && matchesStatus && matchesConsent
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" />Actif</Badge>
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="h-3 w-3 mr-1" />Inactif</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><AlertTriangle className="h-3 w-3 mr-1" />En attente</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getConsentBadges = (org: Organization) => {
    const badges = []
    if (org.consent_lebonlogiciel) {
      badges.push(<Badge key="lebonlogiciel" className="bg-blue-100 text-blue-800 hover:bg-blue-100">LeBonLogiciel</Badge>)
    }
    if (org.consent_prospection) {
      badges.push(<Badge key="prospection" className="bg-purple-100 text-purple-800 hover:bg-purple-100">Prospection</Badge>)
    }
    if (badges.length === 0) {
      badges.push(<Badge key="none" variant="outline">Aucun consentement</Badge>)
    }
    return badges
  }

  const formatCurrency = (amount: number | undefined | null) => {
    const safeAmount = amount || 0
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(safeAmount)
  }

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('fr-FR')
    } catch (error) {
      return 'N/A'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestion des Organisations</h1>
          <p className="text-slate-600 mt-1">
            Gérez les organisations clientes et leur consentement de partage de données
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une organisation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Ajouter une nouvelle organisation</DialogTitle>
              <DialogDescription>
                Créez un nouveau profil d'organisation cliente
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de l'organisation *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Acme Corporation"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="domain">Domaine</Label>
                <Input
                  id="domain"
                  value={formData.domain}
                  onChange={(e) => setFormData({...formData, domain: e.target.value})}
                  placeholder="Ex: acme.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Secteur d'activité</Label>
                <Select value={formData.industry} onValueChange={(value) => setFormData({...formData, industry: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un secteur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technologie</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="healthcare">Santé</SelectItem>
                    <SelectItem value="manufacturing">Industrie</SelectItem>
                    <SelectItem value="retail">Commerce</SelectItem>
                    <SelectItem value="education">Éducation</SelectItem>
                    <SelectItem value="consulting">Conseil</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="size">Taille de l'entreprise</Label>
                <Select value={formData.size} onValueChange={(value) => setFormData({...formData, size: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner la taille" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="startup">Startup (1-10)</SelectItem>
                    <SelectItem value="small">PME (11-50)</SelectItem>
                    <SelectItem value="medium">Moyenne (51-200)</SelectItem>
                    <SelectItem value="large">Grande (201-1000)</SelectItem>
                    <SelectItem value="enterprise">Entreprise (1000+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Pays</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  placeholder="Ex: France"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_email">Email de contact</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                  placeholder="contact@acme.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_phone">Téléphone</Label>
                <Input
                  id="contact_phone"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                  placeholder="+33 1 23 45 67 89"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Adresse complète de l'organisation"
                />
              </div>
              <div className="col-span-2 space-y-4">
                <Label>Consentements de partage de données</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="consent_lebonlogiciel"
                    checked={formData.consent_lebonlogiciel}
                    onCheckedChange={(checked) => setFormData({...formData, consent_lebonlogiciel: checked})}
                  />
                  <Label htmlFor="consent_lebonlogiciel">Autoriser le partage vers LeBonLogiciel.com (données anonymisées)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="consent_prospection"
                    checked={formData.consent_prospection}
                    onCheckedChange={(checked) => setFormData({...formData, consent_prospection: checked})}
                  />
                  <Label htmlFor="consent_prospection">Autoriser le partage vers plateforme de prospection (données complètes)</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleAddOrganization} className="bg-blue-600 hover:bg-blue-700">
                Créer l'organisation
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
                <p className="text-sm font-medium text-slate-600">Total Organisations</p>
                <p className="text-2xl font-bold text-slate-900">{organizations.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Organisations Actives</p>
                <p className="text-2xl font-bold text-green-600">
                  {organizations.filter(org => org.status === 'active').length}
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
                <p className="text-sm font-medium text-slate-600">Consentement LeBonLogiciel</p>
                <p className="text-2xl font-bold text-blue-600">
                  {organizations.filter(org => org.consent_lebonlogiciel).length}
                </p>
              </div>
              <Globe className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Consentement Prospection</p>
                <p className="text-2xl font-bold text-purple-600">
                  {organizations.filter(org => org.consent_prospection).length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher par nom, domaine ou secteur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="inactive">Inactif</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
              </SelectContent>
            </Select>
            <Select value={consentFilter} onValueChange={setConsentFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrer par consentement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les consentements</SelectItem>
                <SelectItem value="both">Les deux consentements</SelectItem>
                <SelectItem value="lebonlogiciel">LeBonLogiciel uniquement</SelectItem>
                <SelectItem value="prospection">Prospection uniquement</SelectItem>
                <SelectItem value="none">Aucun consentement</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Organizations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Organisations ({filteredOrganizations.length})</CardTitle>
          <CardDescription>
            Gérez vos organisations clientes et leurs paramètres de consentement
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-slate-500 mt-4">Chargement des organisations...</p>
            </div>
          ) : filteredOrganizations.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500">Aucune organisation trouvée</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Organisation</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Secteur</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Statut</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Consentements</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Licences</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Revenus</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrganizations.map((org) => (
                    <tr key={org.id} className="border-b hover:bg-slate-50">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-slate-900">{org.name || 'N/A'}</div>
                          <div className="text-sm text-slate-500">{org.domain || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline">{org.industry || 'N/A'}</Badge>
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(org.status)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1">
                          {getConsentBadges(org)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <div>{org.total_licenses} licences</div>
                          <div className="text-slate-500">{org.total_users} utilisateurs</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-slate-900">
                          {formatCurrency(org.monthly_revenue)}/mois
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openViewDialog(org)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(org)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteOrganization(org.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier l'organisation</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l'organisation
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nom de l'organisation</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-domain">Domaine</Label>
              <Input
                id="edit-domain"
                value={formData.domain}
                onChange={(e) => setFormData({...formData, domain: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-industry">Secteur d'activité</Label>
              <Select value={formData.industry} onValueChange={(value) => setFormData({...formData, industry: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technologie</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="healthcare">Santé</SelectItem>
                  <SelectItem value="manufacturing">Industrie</SelectItem>
                  <SelectItem value="retail">Commerce</SelectItem>
                  <SelectItem value="education">Éducation</SelectItem>
                  <SelectItem value="consulting">Conseil</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-size">Taille de l'entreprise</Label>
              <Select value={formData.size} onValueChange={(value) => setFormData({...formData, size: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="startup">Startup (1-10)</SelectItem>
                  <SelectItem value="small">PME (11-50)</SelectItem>
                  <SelectItem value="medium">Moyenne (51-200)</SelectItem>
                  <SelectItem value="large">Grande (201-1000)</SelectItem>
                  <SelectItem value="enterprise">Entreprise (1000+)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-country">Pays</Label>
              <Input
                id="edit-country"
                value={formData.country}
                onChange={(e) => setFormData({...formData, country: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-contact_email">Email de contact</Label>
              <Input
                id="edit-contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-contact_phone">Téléphone</Label>
              <Input
                id="edit-contact_phone"
                value={formData.contact_phone}
                onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="edit-address">Adresse</Label>
              <Textarea
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>
            <div className="col-span-2 space-y-4">
              <Label>Consentements de partage de données</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-consent_lebonlogiciel"
                  checked={formData.consent_lebonlogiciel}
                  onCheckedChange={(checked) => setFormData({...formData, consent_lebonlogiciel: checked})}
                />
                <Label htmlFor="edit-consent_lebonlogiciel">Autoriser le partage vers LeBonLogiciel.com</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-consent_prospection"
                  checked={formData.consent_prospection}
                  onCheckedChange={(checked) => setFormData({...formData, consent_prospection: checked})}
                />
                <Label htmlFor="edit-consent_prospection">Autoriser le partage vers plateforme de prospection</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleEditOrganization} className="bg-blue-600 hover:bg-blue-700">
              Sauvegarder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {selectedOrg?.name}
            </DialogTitle>
            <DialogDescription>
              Détails complets de l'organisation
            </DialogDescription>
          </DialogHeader>
          {selectedOrg && (
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">Informations générales</TabsTrigger>
                <TabsTrigger value="consent">Consentements</TabsTrigger>
                <TabsTrigger value="stats">Statistiques</TabsTrigger>
              </TabsList>
              <TabsContent value="general" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-600">Nom de l'organisation</Label>
                    <p className="text-slate-900">{selectedOrg.name || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-600">Domaine</Label>
                    <p className="text-slate-900">{selectedOrg.domain || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-600">Secteur d'activité</Label>
                    <p className="text-slate-900">{selectedOrg.industry || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-600">Taille</Label>
                    <p className="text-slate-900">{selectedOrg.size || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-600">Pays</Label>
                    <p className="text-slate-900 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {selectedOrg.country || 'N/A'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-600">Statut</Label>
                    <div>{getStatusBadge(selectedOrg.status)}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-600">Email de contact</Label>
                    <p className="text-slate-900 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {selectedOrg.contact_email || 'N/A'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-600">Téléphone</Label>
                    <p className="text-slate-900 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {selectedOrg.contact_phone || 'N/A'}
                    </p>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label className="text-sm font-medium text-slate-600">Adresse</Label>
                    <p className="text-slate-900">{selectedOrg.address || 'N/A'}</p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="consent" className="space-y-4">
                <div className="grid grid-cols-1 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-blue-600" />
                        LeBonLogiciel.com
                      </CardTitle>
                      <CardDescription>
                        Partage de données anonymisées pour comparaison de logiciels
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {selectedOrg.consent_lebonlogiciel ? 'Consentement accordé' : 'Consentement refusé'}
                          </p>
                          <p className="text-sm text-slate-500">
                            Date: {formatDate(selectedOrg.consent_date)}
                          </p>
                        </div>
                        {selectedOrg.consent_lebonlogiciel ? (
                          <CheckCircle className="h-8 w-8 text-green-600" />
                        ) : (
                          <XCircle className="h-8 w-8 text-red-600" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-purple-600" />
                        Plateforme de Prospection
                      </CardTitle>
                      <CardDescription>
                        Partage de données complètes pour prospection B2B
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {selectedOrg.consent_prospection ? 'Consentement accordé' : 'Consentement refusé'}
                          </p>
                          <p className="text-sm text-slate-500">
                            Date: {formatDate(selectedOrg.consent_date)}
                          </p>
                        </div>
                        {selectedOrg.consent_prospection ? (
                          <CheckCircle className="h-8 w-8 text-green-600" />
                        ) : (
                          <XCircle className="h-8 w-8 text-red-600" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="stats" className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600">Licences Totales</p>
                          <p className="text-2xl font-bold text-slate-900">{selectedOrg.total_licenses}</p>
                        </div>
                        <Download className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600">Utilisateurs</p>
                          <p className="text-2xl font-bold text-slate-900">{selectedOrg.total_users}</p>
                        </div>
                        <Users className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600">Revenus Mensuels</p>
                          <p className="text-2xl font-bold text-slate-900">
                            {formatCurrency(selectedOrg.monthly_revenue)}
                          </p>
                        </div>
                        <Calendar className="h-8 w-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-600">Date de création</Label>
                    <p className="text-slate-900">{formatDate(selectedOrg.created_at)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-600">Dernière activité</Label>
                    <p className="text-slate-900">{formatDate(selectedOrg.last_activity)}</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}