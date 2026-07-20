const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load environment variables
const envPath = path.join(__dirname, '../../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      process.env[key] = value;
    }
  });
}

// Check for database credentials
const connectionString = process.env.SUPABASE_DB_CONNECTION_STRING;
if (!connectionString) {
  console.error('\n❌ ERROR: SUPABASE_DB_CONNECTION_STRING is not defined inside .env.local.');
  console.log('\n💡 Please add the connection string to your .env.local like this:');
  console.log('SUPABASE_DB_CONNECTION_STRING=postgresql://postgres:[YOUR-PASSWORD]@db.hhxnvdpzfbbwptaxevrg.supabase.co:5432/postgres\n');
  process.exit(1);
}

// Dynamically ensure 'pg' is installed
try {
  require.resolve('pg');
} catch (e) {
  console.log('Installing "pg" database connector package...');
  execSync('npm install pg --no-save', { stdio: 'inherit' });
}

const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to Supabase PostgreSQL database...');
    await client.connect();
    console.log('✅ Connected successfully!');

    // Read and apply sentinel_architecture.sql
    console.log('Applying database architecture schema (sentinel_architecture.sql)...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'sentinel_architecture.sql'), 'utf8');
    await client.query(schemaSql);
    console.log('✅ Database architecture schema applied successfully!');

    // Read and apply sentinel_seed.sql
    console.log('Applying seed data (sentinel_seed.sql)...');
    const seedSql = fs.readFileSync(path.join(__dirname, 'sentinel_seed.sql'), 'utf8');
    await client.query(seedSql);
    console.log('✅ Seed data applied successfully!');

  } catch (err) {
    console.error('❌ Database migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('Database connection closed.');
  }
}

main();
