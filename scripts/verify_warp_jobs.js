import Database from 'better-sqlite3';

console.log('🔍 Verifying WARP Jobs Vehicle Requirements\n');

const db = new Database('outputs/master_database/master_jobs.db');

// Count total WARP jobs
const totalWarp = db.prepare("SELECT COUNT(*) as count FROM jobs WHERE company = 'WARP Freight'").get();
console.log(`📊 Total WARP Freight jobs: ${totalWarp.count}`);

// Count WARP jobs with vehicle_requirements
const warpWithVehicle = db.prepare(`
  SELECT COUNT(*) as count 
  FROM jobs 
  WHERE company = 'WARP Freight' 
  AND vehicle_requirements IS NOT NULL
`).get();
console.log(`✅ WARP jobs with vehicle_requirements: ${warpWithVehicle.count}`);

// Count WARP jobs without vehicle_requirements
const warpWithoutVehicle = db.prepare(`
  SELECT COUNT(*) as count 
  FROM jobs 
  WHERE company = 'WARP Freight' 
  AND vehicle_requirements IS NULL
`).get();
console.log(`❌ WARP jobs without vehicle_requirements: ${warpWithoutVehicle.count}`);

// Show vehicle type breakdown
console.log('\n🚚 WARP Vehicle Type Breakdown:');
const vehicleTypes = db.prepare(`
  SELECT vehicle_requirements, COUNT(*) as count 
  FROM jobs 
  WHERE company = 'WARP Freight' 
  AND vehicle_requirements IS NOT NULL
  GROUP BY vehicle_requirements
  ORDER BY count DESC
`).all();

vehicleTypes.forEach(v => {
  console.log(`  ${v.vehicle_requirements}: ${v.count} jobs`);
});

// Show sample WARP jobs
console.log('\n📋 Sample WARP Jobs:');
const samples = db.prepare(`
  SELECT title, city, state, vehicle_requirements 
  FROM jobs 
  WHERE company = 'WARP Freight' 
  LIMIT 5
`).all();

samples.forEach((job, idx) => {
  console.log(`\n${idx + 1}. ${job.title}`);
  console.log(`   Location: ${job.city}, ${job.state}`);
  console.log(`   Vehicle: ${job.vehicle_requirements || 'NOT SET'}`);
});

db.close();

console.log('\n✅ WARP verification complete!\n');
