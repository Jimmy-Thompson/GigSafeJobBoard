import Database from 'better-sqlite3';
import fs from 'fs';

console.log('📦 Backing up analytics data...\n');

const db = new Database('outputs/master_database/master_jobs.db');

// Export subscribers
const subscribers = db.prepare('SELECT * FROM subscribers').all();
console.log(`✓ Backed up ${subscribers.length} subscribers`);

// Export subscriber_certifications
const certifications = db.prepare('SELECT * FROM subscriber_certifications').all();
console.log(`✓ Backed up ${certifications.length} certifications`);

// Export analytics_events (non-job events only, for clean start)
const analyticsEvents = db.prepare("SELECT * FROM analytics_events WHERE event_type NOT IN ('job_click', 'job_impression')").all();
console.log(`✓ Backed up ${analyticsEvents.length} non-job analytics events`);

db.close();

// Save to JSON file
const backup = {
  timestamp: new Date().toISOString(),
  subscribers,
  certifications,
  analyticsEvents
};

const backupPath = `backups/analytics_backup_${Date.now()}.json`;
fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));

console.log(`\n✅ Analytics backup saved to: ${backupPath}\n`);
console.log('📊 Backup Summary:');
console.log(`  Subscribers: ${subscribers.length}`);
console.log(`  Certifications: ${certifications.length}`);
console.log(`  Analytics Events: ${analyticsEvents.length}`);
