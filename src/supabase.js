import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://bfznyxfjuhiymcnkfcga.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmem55eGZqdWhpeW1jbmtmY2dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MDEzMDMsImV4cCI6MjEwMDI3NzMwM30.4qUC_kLPs8Fylyz9FtCntmKZlhSddIpaw4_zr8AuJ6A'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
