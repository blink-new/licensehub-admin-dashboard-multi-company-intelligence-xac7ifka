import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { 
  Download, 
  FileText, 
  Database, 
  Calendar,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'
import { blink } from '../../blink/client'

interface ExportJob {
  id: string
  name: string
  format: 'json' | 'csv' | 'excel'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  dataSource: string
  filters: string
  createdAt: string
  completedAt?: string
  downloadUrl?: string
  fileSize?: string
}

export const DataExportsTab: React.FC = () => {
  const { t } = useLanguage()
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  
  // New export form state
  const [exportName, setExportName] = useState('')
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'excel'>('csv')
  const [dataSource, setDataSource] = useState('')
  const [dateRange, setDateRange] = useState('')
  const [filters, setFilters] = useState('')

  const loadExportJobs = async () => {
    try {
      setLoading(true)
      // Load export jobs from admin_data_exports table
      const jobs = await blink.db.adminDataExports.list({
        orderBy: { createdAt: 'desc' },
        limit: 50
      })
      
      setExportJobs(jobs.map(job => ({
        id: job.id,
        name: job.name,
        format: job.format as 'json' | 'csv' | 'excel',
        status: job.status as 'pending' | 'processing' | 'completed' | 'failed',
        dataSource: job.dataSource,
        filters: job.filters || '',
        createdAt: job.createdAt,
        completedAt: job.completedAt,
        downloadUrl: job.downloadUrl,
        fileSize: job.fileSize
      })))
    } catch (error) {
      console.error('Failed to load export jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadExportJobs()
  }, [])

  const createExport = async () => {
    if (!exportName.trim() || !dataSource) return

    try {
      setCreating(true)
      
      // Create new export job
      const newJob = await blink.db.adminDataExports.create({
        name: exportName,
        format: exportFormat,
        dataSource,
        filters: filters || null,
        status: 'pending',
        createdAt: new Date().toISOString(),
        userId: (await blink.auth.me()).id
      })

      // Add to local state
      setExportJobs(prev => [{
        id: newJob.id,
        name: newJob.name,
        format: newJob.format as 'json' | 'csv' | 'excel',
        status: 'pending',
        dataSource: newJob.dataSource,
        filters: newJob.filters || '',
        createdAt: newJob.createdAt,
      }, ...prev])

      // Reset form
      setExportName('')
      setDataSource('')
      setFilters('')
      
      // TODO: Trigger actual export processing via webhook or background job
      
    } catch (error) {
      console.error('Failed to create export:', error)
    } finally {
      setCreating(false)
    }
  }

  const downloadExport = (job: ExportJob) => {
    if (job.downloadUrl) {
      window.open(job.downloadUrl, '_blank')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const dataSourceOptions = [
    { value: 'software_licenses', label: 'Software Licenses' },
    { value: 'software_reviews', label: 'Software Reviews' },
    { value: 'software_declarations', label: 'Software Declarations' },
    { value: 'users', label: 'Users' },
    { value: 'admin_organizations', label: 'Organizations' },
    { value: 'admin_market_intelligence', label: 'Market Intelligence' },
    { value: 'admin_bi_metrics', label: 'BI Metrics' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Data Exports</h1>
        <p className="text-gray-600 mt-1">
          Export data in JSON, CSV, or Excel formats for external platform integration
        </p>
      </div>

      {/* Create New Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Create New Export
          </CardTitle>
          <CardDescription>
            Export data for lebonlogiciel.com and prospection SaaS integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="exportName">Export Name</Label>
              <Input
                id="exportName"
                value={exportName}
                onChange={(e) => setExportName(e.target.value)}
                placeholder="e.g., Monthly License Report"
              />
            </div>
            <div>
              <Label htmlFor="format">Format</Label>
              <Select value={exportFormat} onValueChange={(value: 'json' | 'csv' | 'excel') => setExportFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="dataSource">Data Source</Label>
            <Select value={dataSource} onValueChange={setDataSource}>
              <SelectTrigger>
                <SelectValue placeholder="Select data source" />
              </SelectTrigger>
              <SelectContent>
                {dataSourceOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="filters">Filters (Optional)</Label>
            <Textarea
              id="filters"
              value={filters}
              onChange={(e) => setFilters(e.target.value)}
              placeholder="JSON filters, e.g., {&quot;status&quot;: &quot;active&quot;, &quot;created_after&quot;: &quot;2024-01-01&quot;}"
              rows={3}
            />
          </div>

          <Button 
            onClick={createExport} 
            disabled={creating || !exportName.trim() || !dataSource}
            className="w-full md:w-auto"
          >
            {creating ? 'Creating...' : 'Create Export'}
          </Button>
        </CardContent>
      </Card>

      {/* Export Jobs List */}
      <Card>
        <CardHeader>
          <CardTitle>Export History</CardTitle>
          <CardDescription>
            Recent data exports and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {exportJobs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No exports created yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {exportJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(job.status)}
                      <div>
                        <h3 className="font-medium">{job.name}</h3>
                        <p className="text-sm text-gray-600">
                          {job.dataSource} • {job.format.toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(job.status)}>
                      {job.status}
                    </Badge>
                    
                    {job.fileSize && (
                      <span className="text-sm text-gray-500">{job.fileSize}</span>
                    )}
                    
                    <span className="text-sm text-gray-500">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                    
                    {job.status === 'completed' && job.downloadUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadExport(job)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}