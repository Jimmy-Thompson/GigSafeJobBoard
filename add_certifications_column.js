import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'outputs', 'master_database', 'master_jobs.db');

console.log('Adding certifications_required column to master database...');

const db = new Database(DB_PATH);

try {
  db.exec('ALTER TABLE jobs ADD COLUMN certifications_required TEXT');
  console.log('Successfully added certifications_required column!');
} catch (error) {
  if (error.message.includes('duplicate column name')) {
    console.log('Column already exists, skipping...');
  } else {
    console.error('Error adding column:', error);
    process.exit(1);
  }
} finally {
  db.close();
}
