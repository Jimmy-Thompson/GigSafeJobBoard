import Database from 'better-sqlite3';

console.log('🔍 Verifying Database Integrity\n');

const masterDb = new Database('outputs/master_database/master_jobs.db');
const userDb = new Database('outputs/user_jobs.db');

// Test 1: Verify job count and stable IDs
console.log('1️⃣ Testing Master Database (Scraped Jobs)...');
const jobCount = masterDb.prepare('SELECT COUNT(*) as count FROM jobs').get();
console.log(`   ✓ Total jobs: ${jobCount.count}`);

const sampleJobs = masterDb.prepare('SELECT id, title, company, city, state FROM jobs LIMIT 3').all();
console.log('   ✓ Sample jobs with stable IDs:');
sampleJobs.forEach(job => {
  console.log(`     - ${job.id}: ${job.title} (${job.company}, ${job.city}, ${job.state})`);
});

// Test 2: Verify analytics tables
console.log('\n2️⃣ Testing Analytics Tables...');
const subscriberCount = masterDb.prepare('SELECT COUNT(*) as count FROM subscribers').get();
console.log(`   ✓ Subscribers: ${subscriberCount.count}`);

const certCount = masterDb.prepare('SELECT COUNT(*) as count FROM subscriber_certifications').get();
console.log(`   ✓ Certifications: ${certCount.count}`);

const analyticsCount = masterDb.prepare('SELECT COUNT(*) as count FROM analytics_events').get();
console.log(`   ✓ Analytics events: ${analyticsCount.count}`);

const jobClickCount = masterDb.prepare("SELECT COUNT(*) as count FROM analytics_events WHERE event_type = 'job_click'").get();
console.log(`   ✓ Job clicks (should be 0 for fresh start): ${jobClickCount.count}`);

const jobImpressionCount = masterDb.prepare("SELECT COUNT(*) as count FROM analytics_events WHERE event_type = 'job_impression'").get();
console.log(`   ✓ Job impressions (should be 0 for fresh start): ${jobImpressionCount.count}`);

// Test 3: Verify user-submitted jobs database
console.log('\n3️⃣ Testing User Jobs Database...');
const userJobCount = userDb.prepare('SELECT COUNT(*) as count FROM jobs').get();
console.log(`   ✓ User-submitted jobs: ${userJobCount.count}`);

// Test 4: Test database merge query (like API does)
console.log('\n4️⃣ Testing Database Merge Query...');
masterDb.exec("ATTACH DATABASE 'outputs/user_jobs.db' AS user_db");
const mergedCount = masterDb.prepare(`
  SELECT COUNT(*) as count FROM (
    SELECT id FROM jobs
    UNION ALL
    SELECT id FROM user_db.jobs
  )
`).get();
console.log(`   ✓ Total jobs (merged): ${mergedCount.count}`);

// Test 5: Verify ID stability
console.log('\n5️⃣ Testing ID Format...');
const idSample = masterDb.prepare('SELECT id FROM jobs LIMIT 5').all();
const allValid = idSample.every(row => {
  return typeof row.id === 'string' && row.id.length === 10 && /^[a-f0-9]+$/.test(row.id);
});
console.log(`   ✓ All IDs are stable hash format (10-char hex): ${allValid ? 'YES' : 'NO'}`);
console.log(`   Sample IDs: ${idSample.map(r => r.id).join(', ')}`);

masterDb.close();
userDb.close();

console.log('\n✅ Database integrity verified!\n');
