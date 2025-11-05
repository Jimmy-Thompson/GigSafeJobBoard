import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'outputs', 'master_database', 'master_jobs.db');
const JSON_PATH = path.join(__dirname, 'outputs', 'master_database', 'master_jobs_all_1762300276375.json');

console.log('Starting database import...');

const db = new Database(DB_PATH);

const jsonData = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
console.log(`Loaded ${jsonData.length} jobs from JSON file`);

db.exec('BEGIN TRANSACTION');

try {
  db.exec('DELETE FROM jobs');
  console.log('Cleared existing jobs from database');

  const insertStmt = db.prepare(`
    INSERT INTO jobs (
      id, job_url, title, company, city, state, address, description,
      general_requirements, pay, benefits, vehicle_requirements,
      insurance_requirement, certifications_required, schedule_details,
      source_company, scraped_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let imported = 0;
  for (const job of jsonData) {
    insertStmt.run(
      job.id,
      job.job_url,
      job.title,
      job.company,
      job.city,
      job.state,
      job.address,
      job.description,
      job.general_requirements,
      job.pay,
      job.benefits,
      job.vehicle_requirements,
      job.insurance_requirement,
      job.certifications_required,
      job.schedule_details,
      job.source_company,
      job.scraped_at
    );
    imported++;
    if (imported % 1000 === 0) {
      console.log(`Imported ${imported} jobs...`);
    }
  }

  db.exec('COMMIT');
  console.log(`Successfully imported ${imported} jobs!`);

  const count = db.prepare('SELECT COUNT(*) as count FROM jobs').get();
  console.log(`Total jobs in database: ${count.count}`);

  const withCerts = db.prepare('SELECT COUNT(*) as count FROM jobs WHERE certifications_required IS NOT NULL AND certifications_required != ""').get();
  console.log(`Jobs with certifications: ${withCerts.count}`);

} catch (error) {
  db.exec('ROLLBACK');
  console.error('Error importing data:', error);
  process.exit(1);
} finally {
  db.close();
}
