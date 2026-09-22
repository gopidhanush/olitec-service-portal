import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

export const supabaseConfigError = !supabaseUrl || !supabasePublishableKey
  ? 'Supabase environment variables are missing. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in Vercel.'
  : ''

let client: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (client) return client
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(supabaseConfigError || 'Supabase configuration is missing')
  }
  client = createClient(supabaseUrl, supabasePublishableKey)
  return client
}

// Lazy proxy: importing this module during Next.js rendering no longer calls
// createClient(). The client is created only when a browser-side query uses it.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, property) {
    const value = (getClient() as any)[property]
    return typeof value === 'function' ? value.bind(getClient()) : value
  },
})
