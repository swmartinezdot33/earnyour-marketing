const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local file
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  try {
    const envFile = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
    envFile.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        if (key === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = value;
        if (key === 'SUPABASE_SERVICE_ROLE_KEY') supabaseKey = value;
      }
    });
  } catch (e) {
    console.error('Could not read .env.local file');
  }
}

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✅ Set' : '❌ Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('🔍 Checking Supabase connection...\n');

  // Check if users table exists and has correct schema
  try {
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (usersError) {
      console.error('❌ Error querying users table:', usersError.message);
      console.error('   Code:', usersError.code);
      console.error('   Hint:', usersError.hint);
      console.error('   Details:', usersError.details);
      
      if (usersError.code === '42P01') {
        console.error('\n⚠️  The users table does not exist!');
        console.error('   Run the migrations from supabase/migrations/ in your Supabase SQL Editor.');
      }
      return;
    }

    console.log('✅ Users table exists and is accessible');
    console.log(`   Found ${users?.length || 0} user(s)\n`);

    // Try to insert a test user (will fail if schema is wrong, but that's ok)
    const testEmail = `test-${Date.now()}@example.com`;
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        email: testEmail,
        role: 'student',
        status: 'active',
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error inserting test user:', insertError.message);
      console.error('   Code:', insertError.code);
      console.error('   Hint:', insertError.hint);
      
      if (insertError.code === '42703') {
        console.error('\n⚠️  Missing required columns in users table!');
        console.error('   The schema may be outdated. Check your migrations.');
      }
    } else {
      console.log('✅ Test user created successfully');
      
      // Clean up test user
      await supabase.from('users').delete().eq('email', testEmail);
      console.log('✅ Test user cleaned up\n');
    }

    // Check other important tables
    const tables = ['courses', 'modules', 'lessons', 'enrollments'];
    for (const table of tables) {
      const { error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.error(`❌ Table '${table}' error:`, error.message);
        if (error.code === '42P01') {
          console.error(`   Table '${table}' does not exist!`);
        }
      } else {
        console.log(`✅ Table '${table}' exists`);
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.error(error.stack);
  }
}

checkDatabase().then(() => {
  console.log('\n✅ Database check complete');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

