import Database from 'better-sqlite3';

const db = new Database('outputs/master_database/master_jobs.db');

console.log('🚗 COMPLETE VEHICLE REQUIREMENTS REPORT\n');
console.log('='.repeat(90));

// Get all vehicle requirements ranked by frequency
const results = db.prepare(`
  SELECT vehicle_requirements, COUNT(*) as count 
  FROM jobs 
  WHERE vehicle_requirements IS NOT NULL 
  GROUP BY vehicle_requirements 
  ORDER BY count DESC
`).all();

// Get NULL count
const nullResult = db.prepare(`
  SELECT COUNT(*) as count 
  FROM jobs 
  WHERE vehicle_requirements IS NULL
`).get();

const totalJobs = 2766;
let jobsWithVehicle = 0;

console.log('\nALL VEHICLE REQUIREMENTS (Ranked by Frequency):\n');

results.forEach((r, i) => {
  jobsWithVehicle += r.count;
  const percentage = ((r.count / totalJobs) * 100).toFixed(2);
  const bar = '█'.repeat(Math.ceil(r.count / 20));
  
  console.log(`${(i+1).toString().padStart(3)}. [${r.count.toString().padStart(4)} jobs | ${percentage.padStart(6)}%] ${r.vehicle_requirements}`);
  console.log(`     ${bar}`);
});

console.log('\n' + '='.repeat(90));
console.log('\n📊 SUMMARY STATISTICS:\n');
console.log(`   Total jobs in database:              ${totalJobs.toString().padStart(5)}`);
console.log(`   Jobs WITH vehicle requirements:      ${jobsWithVehicle.toString().padStart(5)} (${((jobsWithVehicle/totalJobs)*100).toFixed(1)}%)`);
console.log(`   Jobs with NULL vehicle requirements: ${nullResult.count.toString().padStart(5)} (${((nullResult.count/totalJobs)*100).toFixed(1)}%)`);
console.log(`   Unique vehicle requirement types:    ${results.length.toString().padStart(5)}`);

console.log('\n' + '='.repeat(90));
console.log('\n🔍 CATEGORY BREAKDOWN:\n');

// Categorize by single vs multi-vehicle
const singleVehicle = results.filter(r => !r.vehicle_requirements.includes(','));
const multiVehicle = results.filter(r => r.vehicle_requirements.includes(','));

let singleCount = 0;
let multiCount = 0;

singleVehicle.forEach(r => singleCount += r.count);
multiVehicle.forEach(r => multiCount += r.count);

console.log(`Single Vehicle Type (no commas):`);
console.log(`   Count: ${singleVehicle.length} unique types`);
console.log(`   Jobs:  ${singleCount} jobs (${((singleCount/jobsWithVehicle)*100).toFixed(1)}% of jobs with vehicles)`);

console.log(`\nMulti-Vehicle Type (comma-separated):`);
console.log(`   Count: ${multiVehicle.length} unique combinations`);
console.log(`   Jobs:  ${multiCount} jobs (${((multiCount/jobsWithVehicle)*100).toFixed(1)}% of jobs with vehicles)`);

console.log('\n' + '='.repeat(90));
console.log('\n⚠️  JOBS WITH NULL VEHICLE REQUIREMENTS:\n');

// Sample some jobs with NULL vehicle requirements
const nullJobs = db.prepare(`
  SELECT id, title, company, city, state, source_company
  FROM jobs 
  WHERE vehicle_requirements IS NULL 
  LIMIT 20
`).all();

console.log(`Total: ${nullResult.count} jobs\n`);
console.log(`Sample of first 20:\n`);
nullJobs.forEach((job, i) => {
  console.log(`${(i+1).toString().padStart(2)}. ${job.title}`);
  console.log(`    Company: ${job.company} | Source: ${job.source_company} | Location: ${job.city}, ${job.state}`);
});

if (nullResult.count > 20) {
  console.log(`\n... and ${nullResult.count - 20} more jobs with NULL vehicle requirements`);
}

// Check which source companies have the most NULL vehicle requirements
console.log('\n' + '='.repeat(90));
console.log('\n📍 NULL VEHICLE REQUIREMENTS BY SOURCE COMPANY:\n');

const nullBySource = db.prepare(`
  SELECT source_company, COUNT(*) as count
  FROM jobs 
  WHERE vehicle_requirements IS NULL 
  GROUP BY source_company
  ORDER BY count DESC
`).all();

nullBySource.forEach(s => {
  console.log(`   ${s.source_company.padEnd(20)} → ${s.count.toString().padStart(4)} jobs`);
});

db.close();
