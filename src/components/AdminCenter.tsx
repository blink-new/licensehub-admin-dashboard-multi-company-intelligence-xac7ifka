import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { 
  BarChart3, 
  Building2, 
  TrendingUp, 
  Key, 
  Webhook, 
  PieChart, 
  Users, 
  Globe,
  Settings,
  LogOut,
  Menu,
  X,
  Download
} from 'lucide-react'
import { useLanguage } from '../hooks/useLanguage'
import blink from '../blink/client'
import { AdminUser } from '../types/admin'
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet'

// Import tab components
import { OverviewTab } from './tabs/OverviewTab'
import { OrganizationsTab } from './tabs/OrganizationsTab'
import { MarketIntelligenceTab } from './tabs/MarketIntelligenceTab'
import { ApiManagementTab } from './tabs/ApiManagementTab'
import { WebhooksTab } from './tabs/WebhooksTab'
import { DataExportsTab } from './tabs/DataExportsTab'
import { BiAnalyticsTab } from './tabs/BiAnalyticsTab'
import { TeamAccessTab } from './tabs/TeamAccessTab'

interface AdminCenterProps {
  defaultTab?: string
}

export const AdminCenter: React.FC<AdminCenterProps> = ({ defaultTab = 'overview' }) => {
  const { language, setLanguage, t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Update active tab based on current route
  useEffect(() => {
    const pathToTab: { [key: string]: string } = {
      '/': 'overview',
      '/organizations': 'organizations',
      '/market': 'market-intelligence',
      '/api': 'api-management',
      '/webhooks': 'webhooks',
      '/exports': 'data-exports',
      '/analytics': 'bi-analytics',
      '/team': 'team-access'
    }
    const currentTab = pathToTab[location.pathname] || 'overview'
    setActiveTab(currentTab)
  }, [location.pathname])

  // Auth state management
  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      if (state.user) {
        setUser({
          id: state.user.id,
          email: state.user.email,
          displayName: state.user.displayName || state.user.email,
          role: 'admin', // Default role, should be fetched from admin_team_members table
          createdAt: new Date().toISOString(),
        })
      } else {
        setUser(null)
      }
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const handleLogout = () => {
    blink.auth.logout()
  }

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'fr' : 'en')
  }

  // Simplified admin-focused navigation (as per migration guide)
  const navigationItems = [
    { id: 'overview', label: t('nav.overview'), icon: BarChart3, path: '/' },
    { id: 'organizations', label: t('nav.organizations'), icon: Building2, path: '/organizations' },
    { id: 'market-intelligence', label: t('nav.market_intelligence'), icon: TrendingUp, path: '/market' },
    { id: 'api-management', label: t('nav.api_management'), icon: Key, path: '/api' },
    { id: 'webhooks', label: t('nav.webhooks'), icon: Webhook, path: '/webhooks' },
    { id: 'data-exports', label: t('nav.data_exports'), icon: Download, path: '/exports' },
    { id: 'bi-analytics', label: t('nav.bi_analytics'), icon: PieChart, path: '/analytics' },
    { id: 'team-access', label: t('nav.team_access'), icon: Users, path: '/team' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-blue-900">LicenseHub Admin</CardTitle>
            <CardDescription>
              {t('header.welcome')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => blink.auth.login()} 
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const NavigationContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-slate-200">
        <h1 className="text-xl font-bold text-blue-900">LicenseHub</h1>
        <p className="text-sm text-slate-600">Admin Dashboard</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => {
                navigate(item.path)
                setMobileMenuOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`} />
            <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{user.displayName}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLanguage}
            className="flex-1"
          >
            <Globe className="h-4 w-4 mr-1" />
            {language.toUpperCase()}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex-1"
          >
            <LogOut className="h-4 w-4 mr-1" />
            {t('header.logout')}
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:bg-white lg:border-r lg:border-slate-200">
        <NavigationContent />
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-blue-900">LicenseHub Admin</h1>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <NavigationContent />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0 pt-16 lg:pt-0">
        <main className="flex-1 overflow-auto p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsContent value="overview" className="mt-0 h-full">
              <OverviewTab />
            </TabsContent>
            <TabsContent value="organizations" className="mt-0 h-full">
              <OrganizationsTab />
            </TabsContent>
            <TabsContent value="market-intelligence" className="mt-0 h-full">
              <MarketIntelligenceTab />
            </TabsContent>
            <TabsContent value="api-management" className="mt-0 h-full">
              <ApiManagementTab />
            </TabsContent>
            <TabsContent value="webhooks" className="mt-0 h-full">
              <WebhooksTab />
            </TabsContent>
            <TabsContent value="data-exports" className="mt-0 h-full">
              <DataExportsTab />
            </TabsContent>
            <TabsContent value="bi-analytics" className="mt-0 h-full">
              <BiAnalyticsTab />
            </TabsContent>
            <TabsContent value="team-access" className="mt-0 h-full">
              <TeamAccessTab />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}