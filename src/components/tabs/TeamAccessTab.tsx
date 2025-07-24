import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Users, Plus } from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'

export const TeamAccessTab: React.FC = () => {
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t('team.title')}</h1>
          <p className="text-slate-600 mt-1">
            Contrôle d'accès basé sur les rôles pour votre équipe
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          {t('team.invite_member')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Access Control
          </CardTitle>
          <CardDescription>
            Cette section sera développée pour la gestion des accès équipe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500">
              Fonctionnalité en cours de développement
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}