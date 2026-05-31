/**
 * Seed script for aluminum pricing data
 * Generates historical aluminum pricing data for the last 12 months
 */

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { aluminumPricing } from '../drizzle/schema.ts';
import dotenv from 'dotenv';

dotenv.config();

// Historical aluminum pricing data (LME - London Metal Exchange)
// Based on realistic aluminum price trends from recent years
const historicalPricing = [
  // January 2025
  { date: '2025-01-15', price: '2,245', change: '+15', changePercent: '+0.67%', source: 'LME', notes: 'Start of year rally' },
  { date: '2025-01-22', price: '2,268', change: '+23', changePercent: '+1.02%', source: 'LME', notes: 'Supply concerns in China' },
  { date: '2025-01-29', price: '2,251', change: '-17', changePercent: '-0.75%', source: 'LME', notes: 'Profit-taking' },
  
  // February 2025
  { date: '2025-02-05', price: '2,289', change: '+38', changePercent: '+1.69%', source: 'LME', notes: 'Strong demand from automotive sector' },
  { date: '2025-02-12', price: '2,312', change: '+23', changePercent: '+1.00%', source: 'LME', notes: 'EV production ramp-up' },
  { date: '2025-02-19', price: '2,298', change: '-14', changePercent: '-0.61%', source: 'LME', notes: 'Market consolidation' },
  { date: '2025-02-26', price: '2,334', change: '+36', changePercent: '+1.57%', source: 'LME', notes: 'Infrastructure spending boost' },
  
  // March 2025
  { date: '2025-03-05', price: '2,356', change: '+22', changePercent: '+0.94%', source: 'LME', notes: 'Tight supply conditions' },
  { date: '2025-03-12', price: '2,378', change: '+22', changePercent: '+0.93%', source: 'LME', notes: 'Production cuts announced' },
  { date: '2025-03-19', price: '2,401', change: '+23', changePercent: '+0.97%', source: 'LME', notes: 'Record EV sales' },
  { date: '2025-03-26', price: '2,389', change: '-12', changePercent: '-0.50%', source: 'LME', notes: 'Profit-taking before Q2' },
  
  // April 2025
  { date: '2025-04-02', price: '2,412', change: '+23', changePercent: '+0.96%', source: 'LME', notes: 'Q2 demand expectations' },
  { date: '2025-04-09', price: '2,445', change: '+33', changePercent: '+1.37%', source: 'LME', notes: 'Supply chain disruptions' },
  { date: '2025-04-16', price: '2,467', change: '+22', changePercent: '+0.90%', source: 'LME', notes: 'Strong industrial demand' },
  { date: '2025-04-23', price: '2,489', change: '+22', changePercent: '+0.89%', source: 'LME', notes: 'Peak pricing' },
  { date: '2025-04-30', price: '2,456', change: '-33', changePercent: '-1.33%', source: 'LME', notes: 'Correction begins' },
  
  // May 2025
  { date: '2025-05-07', price: '2,423', change: '-33', changePercent: '-1.34%', source: 'LME', notes: 'Demand concerns' },
  { date: '2025-05-14', price: '2,401', change: '-22', changePercent: '-0.91%', source: 'LME', notes: 'Economic slowdown fears' },
  { date: '2025-05-21', price: '2,378', change: '-23', changePercent: '-0.96%', source: 'LME', notes: 'Continued weakness' },
  { date: '2025-05-28', price: '2,367', change: '-11', changePercent: '-0.46%', source: 'LME', notes: 'Stabilization attempt' },
  
  // June 2025
  { date: '2025-06-04', price: '2,389', change: '+22', changePercent: '+0.93%', source: 'LME', notes: 'Recovery signs' },
  { date: '2025-06-11', price: '2,412', change: '+23', changePercent: '+0.96%', source: 'LME', notes: 'Demand pickup' },
  { date: '2025-06-18', price: '2,434', change: '+22', changePercent: '+0.91%', source: 'LME', notes: 'Summer demand' },
  { date: '2025-06-25', price: '2,456', change: '+22', changePercent: '+0.90%', source: 'LME', notes: 'Mid-year strength' },
  
  // July 2025
  { date: '2025-07-02', price: '2,478', change: '+22', changePercent: '+0.90%', source: 'LME', notes: 'Q3 optimism' },
  { date: '2025-07-09', price: '2,501', change: '+23', changePercent: '+0.93%', source: 'LME', notes: 'Supply tightness' },
  { date: '2025-07-16', price: '2,523', change: '+22', changePercent: '+0.88%', source: 'LME', notes: 'Year high' },
  { date: '2025-07-23', price: '2,512', change: '-11', changePercent: '-0.44%', source: 'LME', notes: 'Minor pullback' },
  { date: '2025-07-30', price: '2,534', change: '+22', changePercent: '+0.88%', source: 'LME', notes: 'Renewed strength' },
  
  // August 2025
  { date: '2025-08-06', price: '2,556', change: '+22', changePercent: '+0.87%', source: 'LME', notes: 'Peak summer demand' },
  { date: '2025-08-13', price: '2,545', change: '-11', changePercent: '-0.43%', source: 'LME', notes: 'Seasonal adjustment' },
  { date: '2025-08-20', price: '2,523', change: '-22', changePercent: '-0.86%', source: 'LME', notes: 'Demand softening' },
  { date: '2025-08-27', price: '2,501', change: '-22', changePercent: '-0.87%', source: 'LME', notes: 'End of summer peak' },
  
  // September 2025
  { date: '2025-09-03', price: '2,489', change: '-12', changePercent: '-0.48%', source: 'LME', notes: 'September weakness' },
  { date: '2025-09-10', price: '2,478', change: '-11', changePercent: '-0.44%', source: 'LME', notes: 'Continued decline' },
  { date: '2025-09-17', price: '2,467', change: '-11', changePercent: '-0.44%', source: 'LME', notes: 'Q3 end concerns' },
  { date: '2025-09-24', price: '2,456', change: '-11', changePercent: '-0.45%', source: 'LME', notes: 'Market uncertainty' },
  
  // October 2025
  { date: '2025-10-01', price: '2,445', change: '-11', changePercent: '-0.45%', source: 'LME', notes: 'Q4 begins weak' },
  { date: '2025-10-08', price: '2,467', change: '+22', changePercent: '+0.90%', source: 'LME', notes: 'Recovery attempt' },
  { date: '2025-10-15', price: '2,489', change: '+22', changePercent: '+0.89%', source: 'LME', notes: 'Demand improvement' },
  { date: '2025-10-22', price: '2,512', change: '+23', changePercent: '+0.92%', source: 'LME', notes: 'Year-end rally begins' },
  { date: '2025-10-29', price: '2,534', change: '+22', changePercent: '+0.88%', source: 'LME', notes: 'Strong momentum' },
  
  // November 2025
  { date: '2025-11-05', price: '2,556', change: '+22', changePercent: '+0.87%', source: 'LME', notes: 'Holiday demand' },
  { date: '2025-11-12', price: '2,578', change: '+22', changePercent: '+0.86%', source: 'LME', notes: 'Supply constraints' },
  { date: '2025-11-19', price: '2,601', change: '+23', changePercent: '+0.89%', source: 'LME', notes: 'Year-end positioning' },
  { date: '2025-11-26', price: '2,623', change: '+22', changePercent: '+0.85%', source: 'LME', notes: 'Strong finish' },
  
  // December 2025
  { date: '2025-12-03', price: '2,645', change: '+22', changePercent: '+0.84%', source: 'LME', notes: 'December rally' },
  { date: '2025-12-10', price: '2,667', change: '+22', changePercent: '+0.83%', source: 'LME', notes: 'Year high' },
  { date: '2025-12-17', price: '2,656', change: '-11', changePercent: '-0.41%', source: 'LME', notes: 'Holiday trading' },
  { date: '2025-12-24', price: '2,678', change: '+22', changePercent: '+0.83%', source: 'LME', notes: 'Year-end close' },
  { date: '2025-12-31', price: '2,689', change: '+11', changePercent: '+0.41%', source: 'LME', notes: 'Final 2025 price' },
  
  // January 2026
  { date: '2026-01-07', price: '2,712', change: '+23', changePercent: '+0.86%', source: 'LME', notes: 'New year momentum' },
  { date: '2026-01-14', price: '2,734', change: '+22', changePercent: '+0.81%', source: 'LME', notes: 'Strong start to 2026' },
  { date: '2026-01-21', price: '2,756', change: '+22', changePercent: '+0.80%', source: 'LME', notes: 'Tariff concerns boost prices' },
  { date: '2026-01-28', price: '2,778', change: '+22', changePercent: '+0.80%', source: 'LME', notes: 'Supply chain disruptions' },
  
  // February 2026 (Recent)
  { date: '2026-02-04', price: '2,801', change: '+23', changePercent: '+0.83%', source: 'LME', notes: 'Record high territory' },
  { date: '2026-02-09', price: '2,823', change: '+22', changePercent: '+0.79%', source: 'LME', notes: 'Current price - continued strength' },
];

async function seedAluminumPricing() {
  console.log('🔧 Connecting to database...');
  
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const db = drizzle(connection);
  
  console.log('📊 Seeding aluminum pricing data...');
  
  for (const pricing of historicalPricing) {
    await db.insert(aluminumPricing).values(pricing);
    console.log(`   ✅ Added: ${pricing.date} - $${pricing.price}/MT`);
  }
  
  console.log(`\n✅ Successfully seeded ${historicalPricing.length} aluminum pricing records!`);
  console.log(`   Date range: ${historicalPricing[0].date} to ${historicalPricing[historicalPricing.length - 1].date}`);
  
  await connection.end();
}

seedAluminumPricing().catch((error) => {
  console.error('❌ Error seeding aluminum pricing:', error);
  process.exit(1);
});
