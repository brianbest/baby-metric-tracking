#!/usr/bin/env node

/**
 * Verification script for production Supabase deployment
 * Tests database connectivity, schema, and basic data operations
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing environment variables:');
  console.error('  VITE_SUPABASE_URL');
  console.error('  VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function verifyProduction() {
  console.log('🔍 Verifying production Supabase deployment...');
  console.log(`📡 URL: ${SUPABASE_URL}`);
  
  let allChecksPass = true;

  // Test 1: Check table existence
  console.log('\n1. Testing table schema...');
  const tables = ['baby', 'user', 'entry', 'caregiver_relationship'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.error(`❌ Table '${table}': ${error.message}`);
        allChecksPass = false;
      } else {
        console.log(`✅ Table '${table}': exists and accessible`);
      }
    } catch (err) {
      console.error(`❌ Table '${table}': ${err.message}`);
      allChecksPass = false;
    }
  }

  // Test 2: Check if sample data exists
  console.log('\n2. Testing sample data...');
  try {
    const { data: babies, error } = await supabase
      .from('baby')
      .select('*');
    
    if (error) {
      console.error(`❌ Failed to fetch babies: ${error.message}`);
      allChecksPass = false;
    } else if (babies && babies.length > 0) {
      console.log(`✅ Sample data: ${babies.length} babies found`);
    } else {
      console.log(`⚠️  Sample data: No babies found (may need seeding)`);
    }
  } catch (err) {
    console.error(`❌ Sample data check failed: ${err.message}`);
    allChecksPass = false;
  }

  // Test 3: Test authentication endpoint
  console.log('\n3. Testing authentication...');
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error(`❌ Auth test failed: ${error.message}`);
      allChecksPass = false;
    } else {
      console.log(`✅ Authentication: endpoint accessible`);
    }
  } catch (err) {
    console.error(`❌ Auth test failed: ${err.message}`);
    allChecksPass = false;
  }

  // Test 4: Check RLS policies (this will fail if not authenticated, which is expected)
  console.log('\n4. Testing Row Level Security...');
  try {
    const { data, error } = await supabase
      .from('baby')
      .insert({ name: 'Test Baby', birth_date: '2024-01-01', preferred_units: 'metric' });
    
    if (error && error.message.includes('new row violates row-level security policy')) {
      console.log(`✅ RLS: Properly blocking unauthorized access`);
    } else if (error) {
      console.error(`❌ RLS test failed: ${error.message}`);
      allChecksPass = false;
    } else {
      console.log(`⚠️  RLS: Insert succeeded (may indicate missing policies)`);
    }
  } catch (err) {
    console.error(`❌ RLS test failed: ${err.message}`);
    allChecksPass = false;
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  if (allChecksPass) {
    console.log('✅ All checks passed! Production database is ready.');
  } else {
    console.log('❌ Some checks failed. Please review the errors above.');
    console.log('\nTroubleshooting:');
    console.log('1. Ensure migrations have been run: npm run db:push');
    console.log('2. Ensure database has been seeded: npm run db:seed');
    console.log('3. Check environment variables are correct');
    console.log('4. Verify RLS policies are enabled in Supabase dashboard');
  }
  
  console.log('\n📖 For detailed setup instructions, see: PRODUCTION_DEPLOYMENT.md');
}

verifyProduction().catch(console.error);