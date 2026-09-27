import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Parse .env manually without external dotenv dependency
const envFile = fs.readFileSync('.env', 'utf-8');
const env = {};
envFile.split(/\r?\n/).forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...values] = trimmed.split('=');
    env[key.trim()] = values.join('=').trim().replace(/^["']|["']$/g, '');
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

console.log('--- SUPABASE CONNECTIVITY TEST ---');
console.log('URL provided:', supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'NONE');
console.log('Key provided:', supabaseAnonKey ? 'Present (length: ' + supabaseAnonKey.length + ')' : 'NONE');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERROR: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  const results = {};

  // 1. Test Companies Table
  try {
    const { data, error, count } = await supabase.from('companies').select('*', { count: 'exact' });
    if (error) throw error;
    results.companies = { success: true, count: data.length, sample: data[0]?.name };
  } catch (err) {
    results.companies = { success: false, error: err.message };
  }

  // 2. Test Placement Drives Table
  try {
    const { data, error } = await supabase.from('placement_drives').select('*');
    if (error) throw error;
    results.placement_drives = { success: true, count: data.length, sample: data[0]?.job_role };
  } catch (err) {
    results.placement_drives = { success: false, error: err.message };
  }

  // 3. Test Questions Table
  try {
    const { data, error } = await supabase.from('questions').select('*');
    if (error) throw error;
    results.questions = { success: true, count: data.length, sample: data[0]?.question?.substring(0, 30) + '...' };
  } catch (err) {
    results.questions = { success: false, error: err.message };
  }

  // 4. Test Profiles Table
  try {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) throw error;
    results.profiles = { success: true, count: data.length };
  } catch (err) {
    results.profiles = { success: false, error: err.message };
  }

  // 5. Test Applications Table
  try {
    const { data, error } = await supabase.from('applications').select('*');
    if (error) throw error;
    results.applications = { success: true, count: data.length };
  } catch (err) {
    results.applications = { success: false, error: err.message };
  }

  console.log('\n--- TEST RESULTS SUMMARY ---');
  console.log(JSON.stringify(results, null, 2));

  const allPassed = Object.values(results).every(r => r.success);
  if (allPassed) {
    console.log('\n✅ ALL DATABASE TABLES ARE ACCESSIBLE & WORKING PROPERLY!');
  } else {
    console.log('\n⚠️ SOME TABLES ENCOUNTERED ERRORS (CHECK ABOVE)');
  }
}

testConnection();
