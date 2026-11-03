import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

// Run one statement at a time
const statements = sql
  .split(';')
  .map((s) => s.trim())
  .filter(Boolean);

try {
  for (const statement of statements) {
    await pool.query(statement);
  }
  console.log(`Done. Ran ${statements.length} statements.`);

  const [tables] = await pool.query('SHOW TABLES');
  console.log('Tables:', tables);
} catch (err) {
  console.error('Migration failed:', err.message);
  process.exitCode = 1;
} finally {
  await pool.end(); // fine here, because this script exits afterward
}