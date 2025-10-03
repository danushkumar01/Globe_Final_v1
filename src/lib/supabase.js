import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Please check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database table names (adjust according to your Supabase schema)
export const TABLES = {
  COUNTRIES: 'countries',
  NEWS: 'news',
  SENTIMENT_DATA: 'sentiment_data'
}