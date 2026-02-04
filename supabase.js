import { createClient } from 
'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl="https://wbfnlqgovxbezelyprgn.supabase.co"
const supabaseKey="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiZm5scWdvdnhiZXplbHlwcmduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMjYzOTMsImV4cCI6MjA4NTYwMjM5M30.RzYboZut1IaOc7zc5hx9mEU2VhO-1gL5b71c5f8xoXc"

export const supabase=createClient(supabaseUrl,supabaseKey)
