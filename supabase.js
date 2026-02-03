import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

const SUPABASE_URL = "https://wbfnlqgovxbezelyprgn.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiZm5scWdvdnhiZXplbHlwcmduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMjYzOTMsImV4cCI6MjA4NTYwMjM5M30.RzYboZut1IaOc7zc5hx9mEU2VhO-1gL5b71c5f8xoXc"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Auth helpers
export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

export async function getUser() {
  return supabase.auth.getUser()
}

export async function signUpProfile(email, password, callsign, name, cm_type, aircraft) {
  const { data: authData, error: authError } = await supabase.auth.signUp({ email, password })
  if (authError) return { error: authError }

  const { data, error } = await supabase.from('users').insert([{ 
    email, callsign, name, cm_type, aircraft, role: 'Pilot', balance: 0
  }])
  return { data, error, authData }
}