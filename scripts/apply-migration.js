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
    process.exit(1);
  }
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  console.log('🔧 Applying migration 004_user_status.sql...\n');

  // Read the migration file
  const migrationSQL = fs.readFileSync(
    path.join(__dirname, '..', 'supabase', 'migrations', '004_user_status.sql'),
    'utf8'
  );

  // Split into individual statements
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--'));

  for (const statement of statements) {
    if (!statement) continue;
    
    try {
      // Use RPC to execute SQL (if available) or use direct query
      const { error } = await supabase.rpc('exec_sql', { sql: statement }).catch(async () => {
        // If RPC doesn't exist, try using the REST API directly
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({ sql: statement }),
        });
        return { error: response.ok ? null : { message: await response.text() } };
      });

      if (error) {
        console.log(`⚠️  Statement may have already been applied or RPC not available`);
        console.log(`   ${statement.substring(0, 60)}...`);
      } else {
        console.log(`✅ Applied: ${statement.substring(0, 60)}...`);
      }
    } catch (e) {
      console.log(`⚠️  Could not execute via API: ${e.message}`);
    }
  }

  console.log('\n📝 Note: If the above shows errors, you may need to run the SQL manually.');
  console.log('   Go to: https://supabase.com/dashboard/project/tmhetngbdqklqddueugo/sql');
  console.log('   And run the contents of: supabase/migrations/004_user_status.sql\n');

  // Verify the migration was applied
  console.log('🔍 Verifying migration...');
  const { error: testError } = await supabase
    .from('users')
    .insert({
      email: `test-verify-${Date.now()}@example.com`,
      role: 'student',
      status: 'active',
    })
    .select()
    .single();

  if (testError) {
    if (testError.code === 'PGRST204') {
      console.error('❌ Migration not applied - status column still missing');
      console.error('   Please run the SQL manually in Supabase SQL Editor');
    } else {
      console.error('❌ Error:', testError.message);
    }
  } else {
    console.log('✅ Migration verified! Status column exists.');
    // Clean up test user
    await supabase.from('users').delete().eq('email', testError ? '' : `test-verify-${Date.now()}@example.com`);
  }
}

applyMigration().catch(console.error);




