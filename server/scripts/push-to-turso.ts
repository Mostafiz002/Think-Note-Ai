import { createClient } from '@libsql/client';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    console.error('Error: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set in .env');
    process.exit(1);
  }

  const client = createClient({ url, authToken });
  const migrationsPath = path.join(__dirname, '../prisma/migrations');

  // Get all migration directories, sorted by name (timestamp)
  const migrationDirs = fs.readdirSync(migrationsPath)
    .filter(name => fs.statSync(path.join(migrationsPath, name)).isDirectory())
    .sort();

  console.log(`Found ${migrationDirs.length} migrations. Syncing with Turso...`);

  for (const dir of migrationDirs) {
    const sqlPath = path.join(migrationsPath, dir, 'migration.sql');
    if (!fs.existsSync(sqlPath)) continue;

    console.log(`Applying migration: ${dir}...`);
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Split SQL by semicolons
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      try {
        await client.execute(statement);
      } catch (err: any) {
        // Ignore "already exists" errors
        if (err.message.includes('already exists') || err.message.includes('duplicate column name')) {
          // console.log(`  (Skipped existing: ${statement.substring(0, 30)}...)`);
        } else {
          console.error(`  Error in ${dir}: ${statement.substring(0, 50)}...`);
          console.error(`  Message: ${err.message}`);
        }
      }
    }
  }

  console.log('Turso synchronization completed!');
}

main().catch(console.error);
