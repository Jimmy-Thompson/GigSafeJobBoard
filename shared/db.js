import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '..', 'outputs', 'master_database', 'master_jobs.db');

let dbInstance = null;

export function getDb() {
  if (!dbInstance) {
    dbInstance = new Database(DB_PATH);
  }

  return dbInstance;
}

export function closeDb() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
