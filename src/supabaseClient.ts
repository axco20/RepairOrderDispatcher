import { createClient } from '@supabase/supabase-js';

// Replace with your Supabase project details
const SUPABASE_URL = 'https://pqjomphjukbacvtjjnkt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxam9tcGhqdWtiYWN2dGpqbmt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5NjIwMTcsImV4cCI6MjA1NjUzODAxN30.91gemsTO-lvWAlHD1Qup6e9nWvqsWRMMpXcI5fQIoYk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
