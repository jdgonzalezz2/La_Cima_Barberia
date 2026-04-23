
import { createClient } from '@insforge/sdk'

async function checkSchema() {
  const insforge = createClient({
    baseUrl: 'https://c77uuqn4.us-east.insforge.app',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0Mzc0ODd9.ZpQ_CEIIWNJ2XszuV8pcmFsaL17whkgGBo9_FQueKPg'
  })

  const cols = ['phone', 'whatsapp', 'instagram', 'facebook', 'tiktok']
  console.log('--- Checking tenants table columns ---')
  for (const col of cols) {
    const { error } = await insforge.database.from('tenants').select(col).limit(1)
    if (error) {
      console.log(`Column [${col}] does NOT exist or Access Denied:`, error.message)
    } else {
      console.log(`Column [${col}] EXISTS.`)
    }
  }
}

checkSchema()
