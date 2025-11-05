import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'outputs', 'master_database', 'master_jobs.db');
const db = new Database(DB_PATH);

const withCerts = db.prepare('SELECT COUNT(*) as count FROM jobs WHERE certifications_required IS NOT NULL AND certifications_required != \'\'').get();
console.log('Jobs with certifications:', withCerts.count);

const sample = db.prepare('SELECT title, company, certifications_required FROM jobs WHERE certifications_required IS NOT NULL AND certifications_required != \'\' LIMIT 5').all();
console.log('\nSample jobs with certifications:');
sample.forEach(j => console.log(`  - ${j.title} at ${j.company}: ${j.certifications_required}`));

db.close();
