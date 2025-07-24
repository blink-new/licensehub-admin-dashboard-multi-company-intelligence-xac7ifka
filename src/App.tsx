import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { LanguageProvider } from './contexts/LanguageContext'
import { AdminCenter } from './components/AdminCenter'
import { OrganizationsTab } from './components/tabs/OrganizationsTab'
import { BiAnalyticsTab } from './components/tabs/BiAnalyticsTab'
import { ApiManagementTab } from './components/tabs/ApiManagementTab'
import { WebhooksTab } from './components/tabs/WebhooksTab'
import { MarketIntelligenceTab } from './components/tabs/MarketIntelligenceTab'
import { TeamAccessTab } from './components/tabs/TeamAccessTab'
import { Toaster } from './components/ui/toaster'

function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="min-h-screen bg-slate-50">
          <Routes>
            <Route path="/" element={<AdminCenter />} />
            <Route path="/organizations" element={<AdminCenter defaultTab="organizations" />} />
            <Route path="/market" element={<AdminCenter defaultTab="market-intelligence" />} />
            <Route path="/api" element={<AdminCenter defaultTab="api-management" />} />
            <Route path="/webhooks" element={<AdminCenter defaultTab="webhooks" />} />
            <Route path="/exports" element={<AdminCenter defaultTab="data-exports" />} />
            <Route path="/analytics" element={<AdminCenter defaultTab="bi-analytics" />} />
            <Route path="/team" element={<AdminCenter defaultTab="team-access" />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </LanguageProvider>
  )
}

export default App