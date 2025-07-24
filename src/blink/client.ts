import { createClient } from '@blinkdotnew/sdk'

// Initialize Blink client with current project database
export const blink = createClient({
  projectId: 'licensehub-admin-dashboard-multi-company-intelligence-xac7ifka', // Current project database
  authRequired: true
})

export default blink