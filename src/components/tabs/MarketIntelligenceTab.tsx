import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { TrendingUp } from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'

export const MarketIntelligenceTab: React.FC = () => {
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t('market.title')}</h1>
          <p className="text-slate-600 mt-1">
            Analyse concurrentielle et intelligence marché
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Market Intelligence
          </CardTitle>
          <CardDescription>
            Cette section sera développée pour l'analyse concurrentielle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <TrendingUp className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500">
              Fonctionnalité en cours de développement
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}