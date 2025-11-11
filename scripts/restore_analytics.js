import Database from 'better-sqlite3';
import fs from 'fs';

console.log('♻️  Restoring analytics infrastructure...\n');

const db = new Database('outputs/master_database/master_jobs.db');

// Create analytics tables
console.log('Creating analytics tables...');
db.exec(`
  CREATE TABLE IF NOT EXISTS subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    state TEXT,
    city TEXT,
    vehicle_type TEXT,
    certifications_uploaded INTEGER DEFAULT 0,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE TABLE IF NOT EXISTS subscriber_certifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subscriber_id INTEGER NOT NULL,
    certification_type TEXT NOT NULL,
    file_path TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subscriber_id) REFERENCES subscribers(id)
  );
  
  CREATE TABLE IF NOT EXISTS analytics_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    event_data TEXT,
    session_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
  CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id);
  CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at);
`);
console.log('✓ Analytics tables created\n');

// Find the most recent backup
const backupFiles = fs.readdirSync('backups').filter(f => f.startsWith('analytics_backup_'));
if (backupFiles.length === 0) {
  console.log('⚠️  No backup found, starting with clean analytics');
  db.close();
  process.exit(0);
}

const latestBackup = backupFiles.sort().reverse()[0];
const backupPath = `backups/${latestBackup}`;

console.log(`📂 Loading backup: ${latestBackup}`);
const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

// Restore subscribers
console.log(`\nRestoring ${backup.subscribers.length} subscribers...`);
const insertSubscriber = db.prepare(`
  INSERT INTO subscribers (id, email, state, city, vehicle_type, certifications_uploaded, subscribed_at)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

for (const sub of backup.subscribers) {
  insertSubscriber.run(
    sub.id,
    sub.email,
    sub.state,
    sub.city,
    sub.vehicle_type,
    sub.certifications_uploaded,
    sub.subscribed_at
  );
}
console.log('✓ Subscribers restored');

// Restore certifications
console.log(`\nRestoring ${backup.certifications.length} certifications...`);
const insertCert = db.prepare(`
  INSERT INTO subscriber_certifications (id, subscriber_id, certification_type, file_path, uploaded_at)
  VALUES (?, ?, ?, ?, ?)
`);

for (const cert of backup.certifications) {
  insertCert.run(
    cert.id,
    cert.subscriber_id,
    cert.certification_type,
    cert.file_path,
    cert.uploaded_at
  );
}
console.log('✓ Certifications restored');

// Restore analytics events (non-job events only - clean start for job analytics)
console.log(`\nRestoring ${backup.analyticsEvents.length} analytics events (non-job events)...`);
const insertEvent = db.prepare(`
  INSERT INTO analytics_events (id, event_type, event_data, session_id, created_at)
  VALUES (?, ?, ?, ?, ?)
`);

for (const event of backup.analyticsEvents) {
  insertEvent.run(
    event.id,
    event.event_type,
    event.event_data,
    event.session_id,
    event.created_at
  );
}
console.log('✓ Analytics events restored');

console.log('\n✅ Analytics infrastructure restored successfully!\n');

// Show summary
const counts = {
  subscribers: db.prepare('SELECT COUNT(*) as count FROM subscribers').get().count,
  certifications: db.prepare('SELECT COUNT(*) as count FROM subscriber_certifications').get().count,
  analytics: db.prepare('SELECT COUNT(*) as count FROM analytics_events').get().count,
  jobs: db.prepare('SELECT COUNT(*) as count FROM jobs').get().count
};

console.log('📊 Database Summary:');
console.log(`  Jobs: ${counts.jobs}`);
console.log(`  Subscribers: ${counts.subscribers}`);
console.log(`  Certifications: ${counts.certifications}`);
console.log(`  Analytics Events: ${counts.analytics}`);
console.log('\n✨ Ready for production with clean job analytics!\n');

db.close();
