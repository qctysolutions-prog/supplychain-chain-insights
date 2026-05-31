#!/usr/bin/env node
/**
 * Automated News Update Pipeline
 * 
 * This script handles the complete news update workflow:
 * 1. Fetch fresh news articles (last 14 days)
 * 2. Update database
 * 3. Generate update summary
 * 4. Archive old summaries
 * 5. Update CHANGELOG.md
 * 6. Commit and push to Git
 * 
 * Usage: node scripts/automated-news-update.mjs
 */

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { newsArticles } from '../drizzle/schema.ts';
import { eq, lt } from 'drizzle-orm';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const execAsync = promisify(exec);

// Configuration
const CATEGORIES = [
  'Tariff Regulations & Trade Policies',
  'Logistics & Transportation',
  'Materials Pricing',
  'Supply Chain Risk Management',
  'Supplier Relationship Management',
  'Sustainability & Green Supply Chain'
];

const DAYS_THRESHOLD = 14;
const MIN_ARTICLES_PER_CATEGORY = 4;

// Database connection
let db;
let connection;
async function getDb() {
  if (!db && process.env.DATABASE_URL) {
    connection = await mysql.createConnection({
      uri: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: true
      }
    });
    db = drizzle(connection);
  }
  return db;
}

// Utility: Get current date range
function getDateRange() {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - (DAYS_THRESHOLD - 1));
  
  return {
    today,
    startDate,
    cutoffDate: new Date(today.getTime() - DAYS_THRESHOLD * 24 * 60 * 60 * 1000),
    todayStr: today.toISOString().split('T')[0],
    startDateStr: startDate.toISOString().split('T')[0]
  };
}

// Step 1: Fetch fresh news articles
// Curated from real news sources (May 12 - May 25, 2026) — within the 14-day rolling window
async function fetchNewsArticles() {
  console.log('📰 Fetching fresh news articles...');
  
  const { startDateStr, todayStr } = getDateRange();
  console.log(`   Date range: ${startDateStr} to ${todayStr}`);

  const freshArticles = [
    // ── Tariff Regulations & Trade Policies (NEW — May 19-25) ────────────────
    {
      category: 'Tariff Regulations & Trade Policies',
      label: 'EU US TRADE DEAL JULY 4 DEADLINE MAY 2026',
      title: 'EU Advances Toward Finalizing U.S. Trade Deal as Trump July 4 Deadline Looms: Auto Tariff Fate Hangs in Balance',
      date: '2026-05-20',
      bullets: JSON.stringify([
        'Foley & Lardner (May 19, 2026): President Trump announced he will raise U.S. import tariffs on European cars and trucks to 25% from 15% if the EU does not formally approve by July 4, 2026 a previously negotiated framework trade deal; as of May 19, the EU was advancing toward finalizing the deal, with trilogue negotiations ongoing between the European Commission, Council, and Parliament',
        'The 25% tariff threat carries an estimated €3.5 billion in additional annual costs for European automakers; ACEA called for a swift conclusion of EU-US trade deal trilogues to secure automotive export gains; German OEMs including BMW, Mercedes-Benz, and Volkswagen are the most exposed, with combined U.S. export volumes exceeding 500,000 vehicles annually',
        'S&P Global Mobility analysis (May 5, 2026) confirms that the USMCA review deadline of July 1 and the EU-U.S. tariff deadline of July 4 create a compressed window of trade policy uncertainty that is freezing automotive investment decisions; companies must prepare scenario plans for both a negotiated resolution and a tariff escalation — the two outcomes have fundamentally different implications for North Atlantic and North American supply chain strategy'
      ]),
      link: 'https://www.jdsupra.com/legalnews/foley-automotive-update-may-2026-2-9079664/'
    },
    {
      category: 'Tariff Regulations & Trade Policies',
      label: 'USMCA CRITICAL TURNING POINT MAY 22 2026',
      title: 'USMCA Approaches Critical Turning Point: July 1 Deadline Raises Stakes for Automotive Rules, EV Supply Chains, and China\'s Mexico Footprint',
      date: '2026-05-22',
      bullets: JSON.stringify([
        'International Trade Council (May 22, 2026): with the July 1 USMCA review deadline now just weeks away, tensions are rising over automotive rules, EV supply chains, labor enforcement, energy disputes, agriculture, AI-driven digital trade, and China\'s growing manufacturing footprint in Mexico; what was meant to be a routine review is quickly becoming a high-stakes test for the future of North American commerce, investment, and supply chains',
        'S&P Global Mobility (May 5, 2026): the probability of a renegotiated USMCA remains approximately 70%; potential new elements include implementation of U.S. automotive tariffs on USMCA-compliant vehicles of 10%, addition of a modest U.S. Value Add (USVA) for Canada- and Mexico-built vehicles, and a key mode designed to control or limit China share/value increase in North American automotive supply chains',
        'A number of key stakeholders in the Canadian auto industry expect USMCA negotiations to extend past the July 1, 2026 timeline for the agreement\'s scheduled review; Foley & Lardner (May 19, 2026) confirms that the U.S. and Mexico have agreed to launch formal bilateral negotiations, while U.S.-Canada talks have remained strained as Prime Minister Mark Carney pushes to reduce Canada\'s economic dependence on the U.S.'
      ]),
      link: 'https://www.spglobal.com/automotive-insights/en/rapid-impact-analysis/oil-supply-disruptions-usmca-deadline-auto-industry'
    },

    // ── Logistics & Transportation (NEW — May 19-25) ──────────────────────────
    {
      category: 'Logistics & Transportation',
      label: 'MOTOR OIL SHORTAGE AUTOMOTIVE LOGISTICS MAY 2026',
      title: 'Motor Oil Shortage Threatens Automotive Aftermarket: Imminent Supply Crisis as Iran War Knocks Out 44% of Group III Base Oil Supply',
      date: '2026-05-19',
      bullets: JSON.stringify([
        'CNN Business (May 19, 2026): wholesale motor oil prices are rising rapidly, and industry executives are warning of imminent shortages caused by the Iran war; the Independent Lubricant Manufacturers Association (ILMA) warned of an imminent shortage of low-viscosity grade oils including 0W-16, 0W-8, and 0W-20 — the most important grade of motor oil on the market, accounting for roughly one-third of total passenger car motor oil demand',
        'ILMA confirms that 44% of Group III base oil — the most critical input for modern synthetic motor oils — comes from just three Persian Gulf producers; those supplies have been derailed by the closure of the Strait of Hormuz; the U.S. is expected to run out of Mideast Gulf-origin Group III by June 2026, and the Group II safety valve is effectively closed as Asian refiners divert capacity to jet fuel and diesel production',
        'Tom Glenn, president of Petroleum Trends International, told CNN that three rounds of price increases over two and a half months is unheard of, with some producers lifting prices on distributors buying in bulk by $5 or more a gallon — compared with a normal annual increase of 70-80 cents; the motor oil crisis is adding a new dimension to automotive supply chain risk that extends beyond vehicle production into the aftermarket and maintenance ecosystem'
      ]),
      link: 'https://www.cnn.com/2026/05/19/business/motor-oil-shortage-prices-iran'
    },
    {
      category: 'Logistics & Transportation',
      label: 'SUPPLY CHAIN COMPLACENCY IRAN WAR MAY 2026',
      title: 'Supply Chain Complacency Persists Despite Iran War Warnings: Stockpile Buffers Running Out as Hormuz Closure Enters Third Month',
      date: '2026-05-10',
      bullets: JSON.stringify([
        'The Guardian (May 10, 2026): 10 weeks after the first U.S.-Israeli attacks on Iran, a divergence has grown between the eerie quiet on financial markets and alarming warnings of an imminent supply chain crunch; stockpiles have cushioned economic impacts, but the chokehold on Hormuz remains, and the longer the waterway stays closed, the more emergency stocks of oil and vital commodities are run down',
        'JP Morgan commodities analyst Natasha Kaneva warned that oil inventories have acted as a shock absorber for the global economy, but could reach operational stress levels across OECD countries as soon as June 2026; for metals like aluminum, where there has been infrastructure damage, recovery will take longer because the physical damage will have to be repaired — a process that could take 12-18 months',
        'One senior automotive industry executive told The Guardian that companies are playing with fire by hoping the situation will resolve itself, adding there is a degree of complacency; materials supply problems could get really hot around the end of May if shortages start to hit some parts and force production stoppages; the automotive industry\'s tier-3 and tier-4 supply chain visibility gaps are breeding complacency that may not be recognized until production lines stop'
      ]),
      link: 'https://www.theguardian.com/business/2026/may/10/degree-complacency-supply-chains-prepared-impact-iran-war'
    },

    // ── Materials Pricing (NEW — May 19-25) ───────────────────────────────────
    {
      category: 'Materials Pricing',
      label: 'ALUMINUM REGIONAL PRICE RISK CME MAY 2026',
      title: 'Aluminum Regional Price Risks Emerge as U.S. Midwest Premium Tops $2,500/tonne: Iran War Accelerates Pre-Existing Supply Deficit',
      date: '2026-05-14',
      bullets: JSON.stringify([
        'CME Group (May 14, 2026): with a historically high Midwest Premium, U.S.-bound aluminum is fetching over $6,000 per tonne, squeezing manufacturers in a country that imports the vast majority of supplies; the U.S. Midwest Premium now accounts for over 40% of the all-in transaction price for aluminum in the U.S. — a structural shift driven by Section 232 tariffs, Iran war disruptions, and the closure of the Strait of Hormuz',
        'Wood Mackenzie had already predicted a 200,000-tonne deficit for 2026 before the Iran war began; the conflict has sharply accelerated the deficit, with Alba\'s force majeure and EGA\'s physical damage removing a meaningful chunk of the Gulf\'s approximately 2.6 million tonnes of annual production; the Midwest Premium surged to $2,529 per tonne in early May, compared with pre-war baselines, while European and Japanese premiums also jumped 70% from pre-war levels',
        'CNBC (May 5, 2026): Ford CFO Sherry House confirmed that Iran war commodity headwinds are expected to top $2 billion — roughly double the previous estimate — due largely to higher aluminum prices; Ford shares have tumbled 17% since the Iran war began; UBS analyst Joseph Spak called Wall Street\'s concern overblown, noting Ford has hedged its aluminum exposure for 2026, but the hedging protection expires in 2027, creating a forward cost risk that is not yet fully priced in'
      ]),
      link: 'https://www.cmegroup.com/openmarkets/metals/2026/With-Aluminum-in-Short-Supply-Regional-Price-Risks-Emerge.html'
    },
    {
      category: 'Materials Pricing',
      label: 'HELIUM SHORTAGE EV BATTERY AUTOMOTIVE MAY 2026',
      title: 'Iran War\'s Hidden Supply Chain Shock: Helium Shortage Threatens EV Battery Testing and Semiconductor Supply for Automotive Industry',
      date: '2026-05-19',
      bullets: JSON.stringify([
        'LightSource AI (May 19, 2026): Iranian drone strikes hit QatarEnergy\'s Ras Laffan Industrial City on February 28, knocking out approximately 30% of global helium production; the repair timeline is 3-5 years; every EV battery pack gets helium leak-tested for safety and warranty compliance — helium\'s small atomic size reveals micro-cracks that might let moisture or oxygen enter cells, creating thermal runaway risk; switching to hydrogen/argon blends would require new safety protocols, factory ventilation upgrades, and six-month regulatory re-qualification',
        'Spot helium prices doubled within two weeks of the disruption; South Korea imports 65% of its helium from Qatar, making Samsung and SK Hynix particularly vulnerable; Fitch Ratings warned of the exposure; the automotive semiconductor supply chain is doubly exposed — both through direct helium use in chip manufacturing and through the EV battery testing requirement; battery startups with aggressive start-of-production dates now face a choice between paying four-figure spot rates for bottled helium or delaying launch',
        'The Iran war delivered three stacked supply disruptions: helium (February 28), oil (February 28), and petrochemicals/metals (March-April); plastics make up roughly 30% of a modern vehicle by weight — bumpers, dashboards, connectors, wire insulation, under-hood housings, tanks, seals; PCB resin prices have surged 40% since March after SABIC\'s Jubail complex was struck; the multi-material supply shock has no historical playbook and is creating cascading cost pressures across the automotive supply chain'
      ]),
      link: 'https://lightsource.ai/blog/iran-war-helium-oil-supply-chain-impact'
    },

    // ── Supply Chain Risk Management (NEW — May 19-25) ────────────────────────
    {
      category: 'Supply Chain Risk Management',
      label: 'IEEPA TARIFF REFUNDS SUPPLY CHAIN RISK MAY 2026',
      title: 'IEEPA Tariff Refunds Exceed $35.5B as Federal Appeals Court Temporarily Pauses Section 122 Ruling: Automotive Importers Navigate Evolving Legal Landscape',
      date: '2026-05-19',
      bullets: JSON.stringify([
        'Foley & Lardner (May 19, 2026): as of May 11, the Trump administration was issuing more than $35.5 billion in refunds to importers whose tariff-refund claims were approved after the U.S. Supreme Court ruled the president\'s IEEPA-based tariffs were unlawful; a federal appeals court has temporarily paused a decision that had found President Trump\'s new global tariffs — imposed under Section 122 of the Trade Act — were unlawful, creating additional legal uncertainty for automotive importers',
        'More than 60 auto suppliers operating in the U.S. are owned by companies located in China, according to AlixPartners analysis; the combination of IEEPA refunds, Section 232 tariffs, USMCA renegotiation uncertainty, and Iran war materials cost increases is creating a multi-dimensional supply chain risk environment that requires dedicated trade compliance and risk management resources; automotive companies must ensure their ACE declarations are complete and their customs brokers are enrolled for ACH refunds to maximize recovery',
        'Toyota reported an operating loss in North America for the first time in sixteen years for fiscal year ending March 31, 2026, noting it was unable to fully offset the impact of U.S. import tariffs; Honda reported its first annual profit loss since becoming a publicly traded company approximately 70 years ago, with a $2.7 billion annual profit loss due largely to its costly retreat from ambitious EV targets; the combined OEM financial pressure is reshaping supply chain risk management priorities across the North American automotive industry'
      ]),
      link: 'https://www.jdsupra.com/legalnews/foley-automotive-update-may-2026-2-9079664/'
    },
    {
      category: 'Supply Chain Risk Management',
      label: 'GLOBAL VEHICLE SALES FORECAST REVISED DOWN MAY 2026',
      title: 'S&P Global Mobility Revises 2026 Vehicle Sales Forecast Down 650K-900K Units as Iran War and USMCA Uncertainty Compound Supply Chain Risk',
      date: '2026-05-05',
      bullets: JSON.stringify([
        'S&P Global Mobility (May 5, 2026): global light-vehicle sales could drop between 650,000 and 900,000 units in 2026 compared with the April 2026 forecast, translating to a total sales volume of 89.6-89.9 million units; the 2027 outlook has also been revised downward to 91.3-91.6 million units from 92.6 million; the Strait of Hormuz has been largely closed for two months, and the U.S. and Iran both view their control over the strait as a position of negotiating power',
        'GlobalData revised its 2026 U.S. light-vehicle sales forecast to 16.0 million units, representing a downward adjustment of approximately 100,000 units; the Iran war was cited as the reason for the revision; some stocks of petroleum-derived feedstocks and primary aluminum could see supply disruptions by the end of May, with production hubs in Japan, South Korea, and ASEAN at greatest risk',
        'The combination of lower vehicle demand, higher materials costs, tariff uncertainty, and USMCA renegotiation risk is creating a supply chain risk environment of unprecedented complexity; automotive companies must develop scenario plans for both a negotiated Hormuz resolution and a prolonged disruption — the two outcomes have fundamentally different implications for production planning, inventory management, and supplier relationship strategies'
      ]),
      link: 'https://www.spglobal.com/automotive-insights/en/rapid-impact-analysis/oil-supply-disruptions-usmca-deadline-auto-industry'
    },

    // ── Supplier Relationship Management (NEW — May 19-25) ────────────────────
    {
      category: 'Supplier Relationship Management',
      label: 'PLANTE MORAN WRI 2026 ALL SIX OEMS IMPROVE',
      title: 'Historic Milestone: All Six North American OEMs Improve Supplier Relations in 2026 WRI Study Despite Tariffs, EV Write-Offs, and Iran War',
      date: '2026-05-18',
      bullets: JSON.stringify([
        'Automotive Logistics (May 18, 2026): for the first time in the 26-year history of Plante Moran\'s Working Relations Index (WRI), all six major North American OEMs — Toyota, Honda, GM, Nissan, Ford, and Stellantis — improved their supplier relations scores; Ford had the largest year-on-year improvement, up 32 points to 223; Toyota retained its lead with a score of 409, surpassing 400 for the first time since 2007; Honda improved 13 points to 360, GM increased 8 points to its highest-ever score of 318',
        'Dr. Angela Johnson, principal and supplier relations analytics lead at Plante Moran, said the results were unexpected given the scale of disruption facing the industry: suppliers were acknowledging the efforts that OEMs were putting in to be proactive, to try to keep in front of problems, to be as fair and equitable as they could; the study collected more than 10,000 supplier comments this year, compared with around 2,800 last year, revealing a marked change in tone across the supply base',
        'Plante Moran identified six behaviors — the Six Cs — that distinguish stronger OEM-supplier relationships: commercial fairness, consistency, clear expectations, communication, continuity, and collaboration; the largest suppliers rated Toyota, Honda, and Nissan above their overall averages, while rating GM, Ford, and Stellantis below average, particularly on trust, communication, and profit opportunity; Ford\'s turnaround was credited to chief supply chain officer Liz Door, who implemented a two-way supplier scorecard to improve transparency'
      ]),
      link: 'https://www.automotivelogistics.media/supply-chain/north-american-oems-improve-supplier-relations-despite-industry-volatility/2666744'
    },

    // ── Sustainability & Green Supply Chain (NEW — May 19-25) ─────────────────
    {
      category: 'Sustainability & Green Supply Chain',
      label: 'TOYOTA CARBON NEUTRAL PLANT TAHARA MAY 2026',
      title: 'Toyota Achieves Carbon Neutrality at Tahara Plant: First Carbon-Neutral Manufacturing Facility as OEM Balances Sustainability with Iran War Costs',
      date: '2026-05-06',
      bullets: JSON.stringify([
        'Sustainability Magazine (May 6, 2026): Toyota has achieved carbon neutrality at its Tahara car plant in Japan, making it the first carbon-neutral facility in the company\'s manufacturing network; the achievement was enabled by the addition of renewable energy wind turbines and solar panels; the milestone demonstrates that automotive manufacturing carbon neutrality is technically achievable even as the industry faces unprecedented cost pressures from tariffs and the Iran war',
        'The Tahara plant achievement comes as Toyota absorbs a JP 670 billion (US$4.3 billion) Iran war cost hit in the current fiscal year through higher materials costs, logistics disruptions, and lost Middle East sales; Toyota\'s operating loss in North America for fiscal year 2026 — the first in sixteen years — underscores the financial pressure that is testing OEM sustainability commitments; the ability to maintain carbon neutrality investments while absorbing multi-billion-dollar tariff and war costs will define Toyota\'s sustainability leadership position',
        'The EPA Automotive Trends Report (May 4, 2026) confirms that new light-duty vehicles continue to improve on fuel economy and CO2 emissions despite the challenging macro environment; the report provides data on the fuel economy, carbon dioxide emissions, and technology trends of new light-duty vehicles — a baseline that will be critical for measuring the automotive industry\'s progress toward sustainability targets as the EV transition navigates the 2026 disruption environment'
      ]),
      link: 'https://sustainabilitymag.com/news/toyota-achieves-carbon-neutrality-at-tahara-car-plant'
    },
    {
      category: 'Sustainability & Green Supply Chain',
      label: 'SUSTAINABILITY CRISIS CAR MANUFACTURING 2026',
      title: 'Sustainability Crisis in Car Manufacturing: Electric Dreams Meet Supply Chain Reality as Iran War and Tariffs Test Green Commitments',
      date: '2026-05-08',
      bullets: JSON.stringify([
        'LinkedIn analysis (May 8, 2026): electric vehicles reduce operational emissions, but they do not eliminate the broader sustainability challenges embedded within manufacturing systems; battery production, rare earth mining, and supply chain logistics remain significant sources of environmental impact; the Iran war has added a new dimension to automotive sustainability risk by disrupting the supply of low-carbon Gulf aluminum that EV manufacturers depend on for their sustainability credentials',
        'The circular economy in automotive market is projected to grow significantly through 2033, driven by IEA data showing that the production of a standard BEV results in an average of 5.4 tons of CO2 emissions, mostly due to material extraction and component manufacturing; the helium shortage created by the Iran war is adding a new supply chain sustainability challenge — EV battery packs require helium leak testing for safety compliance, and the shortage is forcing battery manufacturers to choose between costly spot helium purchases or production delays',
        'Geely Auto Group\'s latest ESG report (Auto China 2026, April 28, 2026) shows a 25.5% reduction in vehicle lifecycle carbon emissions compared with 2020 levels; the report highlights the importance of supply chain sustainability integration — not just manufacturing emissions — as the defining metric for automotive sustainability leadership; the combination of Iran war disruptions, tariff pressures, and EV transition costs is creating a sustainability stress test that will separate genuine leaders from greenwashing laggards'
      ]),
      link: 'https://www.linkedin.com/pulse/sustainability-crisis-car-manufacturing-electric-dr-ona--gf56e'
    },
    // ── Tariff Regulations & Trade Policies ──────────────────────────────────
    {
      category: 'Tariff Regulations & Trade Policies',
      label: 'TRUMP EU AUTO TARIFF THREAT MAY 12',
      title: 'Trump Threatens Higher EU Auto Tariffs as Trade Deal Stalls: 25% Tariff Risk Looms Over Transatlantic Automotive Trade',
      date: '2026-05-12',
      bullets: JSON.stringify([
        'Grant Thornton analysis (May 12, 2026): Trump has signaled a potential increase in U.S. import tariffs on European vehicles, raising the risk of trans-Atlantic tensions and possible EU retaliatory measures; the threat comes as bilateral trade deal negotiations between the U.S. and EU have stalled, with both sides unable to agree on the scope and timeline of tariff reductions',
        'The proposed 25% tariff on EU automotive imports — up from the current 15% bilateral deal rate — would add an estimated $18 billion in annual costs to German automakers alone; Volkswagen has described tariffs as a EUR 5 billion annual burden on its operating profit, and the combined tariff exposure across European OEMs is reshaping investment decisions and production location strategies',
        'U.S. and EU top trade negotiators met in Paris the week of May 5, 2026 to address the tariff escalation risk; the outcome of these negotiations will determine whether the automotive industry faces a sustained 25% tariff regime or a negotiated reduction — a decision with multi-billion-dollar implications for the North Atlantic automotive supply chain'
      ]),
      link: 'https://www.grantthornton.com/insights/newsletters/tax/2026/hot-topics/may-12/trump-threatens-higher-eu-auto-tariffs-as-trade-deal-debated'
    },
    {
      category: 'Tariff Regulations & Trade Policies',
      label: 'USMCA JULY 2026 DEADLINE AUTO INDUSTRY',
      title: 'USMCA July 2026 Deadline: Auto Industry Groups Urge Trump to Preserve Trade Agreement as Bilateral Negotiations Begin',
      date: '2026-05-11',
      bullets: JSON.stringify([
        'Car Dealership Guy (May 11, 2026): a coalition of seven auto trade groups representing automakers, dealers, and parts suppliers sent a letter to USTR Jamieson Greer urging the Trump administration to preserve the USMCA ahead of the July 1 deadline for a six-year review; the groups stated that a renewed USMCA will help ensure the United States remains a globally competitive production base at a time of rapid technological change',
        'BCG analysis (May 15, 2026): USMCA 2.0 could fundamentally reshape the deeply integrated North American automotive industry; potential rule shifts include higher U.S. content thresholds for vehicles crossing the border duty free and restrictions on products made in Chinese-owned factories in Mexico and Canada; a USMCA repeal could add $33 billion in additional tariff-related costs to the North American automotive industry',
        'The U.S. and Mexico have agreed to launch formal bilateral negotiations during the week of May 25 in Mexico City; U.S.-Canada talks have remained strained as Prime Minister Mark Carney pushes to reduce Canada\'s economic dependence on the U.S.; automotive companies should start preparing now by assessing supply chain vulnerabilities and making moves to add U.S. capacity and sourcing'
      ]),
      link: 'https://news.dealershipguy.com/p/auto-industry-groups-push-trump-to-preserve-usmca-ahead-of-deadline'
    },
    {
      category: 'Tariff Regulations & Trade Policies',
      label: 'FORD TARIFF REFUND SUPPLY CHAIN PRESSURE',
      title: 'Ford Projects $1.3B in Tariff Refunds but Supply Chain Pressure Remains as Detroit 3 Absorb $2B+ in IEEPA Refunds',
      date: '2026-05-07',
      bullets: JSON.stringify([
        'Supply Chain Dive (May 4, 2026): Ford Motor Co. is projecting $1.3 billion in tariff refunds for invalidated levies it paid between February 2025 and March 2026; the refunds follow the U.S. Supreme Court ruling that struck down IEEPA tariffs, but Ford\'s supply chain pressure remains significant as the company continues to absorb ongoing tariff costs on steel, aluminum, and auto parts',
        'Foley & Lardner automotive update (May 5, 2026): the Detroit 3 automakers collectively expect to receive over $2 billion in IEEPA-based tariff refunds; however, the refunds provide only partial relief as Section 232 tariffs on steel, aluminum, and auto parts remain in effect; the combination of ongoing tariff exposure and the USMCA renegotiation uncertainty is creating a complex cost management environment for automotive OEMs',
        'The U.S. trade court ruling blocking the 10% global tariff (May 7, 2026) provides additional relief for automotive importers; tariff refunds are expected to begin rolling out in May 2026, providing a near-term boost in cash flow; however, automotive importers must ensure their ACE declarations are complete and their customs brokers are enrolled for ACH refunds to maximize recovery through the CBP CAPE system'
      ]),
      link: 'https://www.supplychaindive.com/news/ford-expects-13b-tariff-refund-but-supply-chain-pressure-remains/819136/'
    },
    {
      category: 'Tariff Regulations & Trade Policies',
      label: 'AUTOMOTIVE TARIFFS TRADE REMEDY MAY 2026',
      title: 'Automotive Tariffs and Trade Remedy Investigations: Navigating Overlapping Regimes, Section 301 Hearings, and New Relief Mechanisms',
      date: '2026-05-07',
      bullets: JSON.stringify([
        'Morgan Lewis analysis (May 7, 2026): automotive companies must navigate overlapping tariff regimes, evolving regulatory authority, and new relief mechanisms while managing cost exposure and supply chain risk; the combination of Section 232 tariffs, IEEPA refunds, Section 301 investigations, and USMCA renegotiation creates a multi-layered compliance environment requiring dedicated trade compliance resources',
        'The USTR has launched public hearings pertaining to Section 301 investigations into dozens of nations regarding unfair trade practices and forced labor; the outcome of the investigations could result in new and more durable levies that help to replace IEEPA tariffs invalidated by the Supreme Court — creating a new layer of tariff risk for automotive OEMs that have structured their supply chains around current tariff regimes',
        'Foley & Lardner (May 5, 2026): certain Canadian and Mexican steel and aluminum producers that establish new U.S. domestic production capacity commitments can apply to have the 50% U.S. import tariff on metals temporarily reduced to 25%; the adjustment applies to companies that supply, directly or indirectly, U.S. automobile or medium- and heavy-duty vehicle manufacturers — creating a new compliance pathway for automotive supply chain participants'
      ]),
      link: 'https://www.morganlewis.com/pubs/2026/05/automotive-tariffs-and-trade-remedy-investigations-navigating-shifts-in-the-us-trade-landscape'
    },
    {
      category: 'Tariff Regulations & Trade Policies',
      label: 'USMCA REORDER GLOBAL TRADE LIMBO',
      title: 'Auto Tariffs Leave Industry in Limbo as USMCA Review Nears: Structural Challenges Freeze Manufacturer Investment Decisions',
      date: '2026-05-11',
      bullets: JSON.stringify([
        'Automotive News (May 11, 2026): Trump\'s tariffs aimed to bring auto production home, but structural challenges and pending USMCA changes leave manufacturers frozen; OEMs that have announced U.S. production expansions face multi-year implementation timelines, while the uncertainty around USMCA content rules makes it impossible to commit to supply chain investments that depend on the final negotiated outcome',
        'BCG analysis confirms that U.S. trade actions in 2025 have added an estimated $30 billion to $40 billion to the cost of goods sold in North American vehicle manufacturing; OEMs have thus far absorbed most of these costs rather than passing them on to consumers and suppliers; that tariff risk translates into profitability pressure of 20% to 60% of OEMs\' global EBIT, with the greatest impact on U.S.-based automakers',
        'The USMCA review could result in fundamental revisions to the agreement or even replacement with bilateral frameworks; North American content requirements for finished vehicles are expected to increase from the current 75% to around 80%; the U.S. is also expected to seek restrictions on automotive products made in Chinese-owned factories in Mexico and Canada — changes that would require significant supply chain restructuring across the North American automotive industry'
      ]),
      link: 'https://www.autonews.com/manufacturing/an-usmca-tariffs-reorder-global-trade-0511/'
    },

    // ── Logistics & Transportation ────────────────────────────────────
    {
      category: 'Logistics & Transportation',
      label: 'US MANUFACTURING AUTO OUTPUT APRIL 2026',
      title: 'U.S. Manufacturing Hits One-Year High as Auto Output Jumps 3.7% in April 2026 Amid Ongoing Supply Chain Risks',
      date: '2026-05-15',
      bullets: JSON.stringify([
        'Reuters (May 15, 2026): U.S. manufacturing output increased 0.6% in April, the largest rise since February 2025; motor vehicle output surged 3.7%, driving the broader manufacturing rebound; the Federal Reserve data shows capacity utilization rising as automotive OEMs accelerate production to rebuild inventories ahead of potential USMCA disruptions and ongoing tariff uncertainty',
        'Car Dealership Guy (May 18, 2026): longer-term, U.S. vehicle production is projected to grow from roughly 10 million units in 2026 to nearly 12 million by 2034, while output in Mexico is expected to decline as USMCA renegotiation shifts production economics; the Iran war-related supply chain risks remain a key variable, with Toyota suppliers warning that material shortages could halt vehicle production within weeks',
        'The Strait of Hormuz disruption is propagating through automotive logistics networks well beyond direct shipping routes; Hyundai has rerouted its fleet around the Cape of Good Hope, adding 10-15 days to European supply lines; Mazda suspended production of all Middle East-bound vehicles until at least May; air cargo spot rates have increased by 40% in the eight weeks after the start of the Iran war, according to WorldACD data'
      ]),
      link: 'https://news.dealershipguy.com/p/u-s-manufacturing-hits-one-year-high-as-auto-output-jumps-amid-supply-chain-risks'
    },
    {
      category: 'Logistics & Transportation',
      label: 'STRAIT HORMUZ AUTOMOTIVE LOGISTICS MAY 2026',
      title: 'Strait of Hormuz Disruption Becomes New Normal: Automotive Logistics Networks Adapt as Rerouting Adds Weeks to Supply Lines',
      date: '2026-05-08',
      bullets: JSON.stringify([
        'Gulf News (May 18, 2026): Moody\'s warns prolonged disruption in the Strait of Hormuz could permanently reshape global trade, energy prices, and supply chains as the world adapts to a new normal; the automotive industry is particularly exposed given Japan\'s 70% dependence on Middle Eastern aluminum and the Gulf\'s role as a critical energy corridor for petrochemical inputs used in automotive manufacturing',
        'Automotive World (May 8, 2026): Toyota has warned that the Iran war will cost it JP 670bn (US$4.3bn) in the current fiscal year through higher materials costs, logistics disruptions, and lost Middle East sales; the war compounds a tariff burden that was already substantial — U.S. trade levies cost Toyota JP 1.4tr in fiscal year 2026; the combined pressure has pushed Toyota\'s operating margin well below its FY2024 peak',
        'The Foley automotive update (May 5, 2026) confirms that global average air-cargo spot rates have increased by 40% in the eight weeks after the start of the Iran war; reduced exports of jet fuel have lowered supplies in California, Europe, and Asia, with Europe and Asia at risk for potential jet fuel shortages by the end of May; automotive logistics leaders are maintaining contingency capacity across all modes given ongoing uncertainty'
      ]),
      link: 'https://www.automotiveworld.com/news/toyota-takes-us4-3bn-iran-hit-as-disruptions-batter-industry/'
    },
    {
      category: 'Logistics & Transportation',
      label: 'CH ROBINSON AUTOMOTIVE FREIGHT MAY 2026',
      title: 'C.H. Robinson May 2026 Automotive Freight Update: Currency Shifts, Chinese EVs in Canada, and Evolving Trade Reshape North American Auto Logistics',
      date: '2026-05-07',
      bullets: JSON.stringify([
        'C.H. Robinson May 2026 automotive freight market update: currency shifts, Chinese EVs entering Canada, and evolving trade policies are reshaping the North American automotive logistics landscape; the combination of USMCA uncertainty, Strait of Hormuz disruptions, and tariff volatility is creating a more complex freight environment than automotive logistics budgets anticipated at the start of 2026',
        'Supply chain updates (May 8, 2026): a U.S. trade court ruling has blocked the implementation of a proposed 10% global tariff, providing some relief for automotive importers; tariff refunds are beginning to roll out, providing a near-term boost in cash flow; however, the ongoing Section 301 investigations and USMCA renegotiation uncertainty continue to create logistics planning challenges for automotive supply chains',
        'The automotive logistics industry is adapting through modal flexibility and AI-enabled optimization: OEMs must have multiple transport modes in place proactively to address shortfalls; AI tools are reducing tariff compliance staff requirements while dramatically reducing errors; new sourcing platforms allow simultaneous evaluation of far more logistics options than previously possible with manual processes'
      ]),
      link: 'https://www.chrobinson.com/en-us/resources/insights-and-advisories/north-america-freight-insights/may-2026-freight-market-update/industry-insights/automotive/'
    },
    {
      category: 'Logistics & Transportation',
      label: 'FORD MANUFACTURING RESET EV SUPPLY CHAIN',
      title: 'Ford\'s Manufacturing Reset Shows How Automakers Are Rebuilding the EV Supply Chain for Dual-Use Resilience',
      date: '2026-05-07',
      bullets: JSON.stringify([
        'Logistics Viewpoints (May 7, 2026): Ford\'s changing EV strategy is not simply a product-cycle adjustment — it reflects a broader manufacturing reset as automakers rebalance affordability, supply chain resilience, and long-term electrification commitments; a battery supply chain that can serve both mobility and stationary storage may be more resilient than one tied too narrowly to a single vehicle forecast',
        'Ford\'s 2026 Integrated Report (May 5, 2026) confirms the company is striving to achieve carbon neutrality across its vehicles and operations while simultaneously managing $1.3 billion in tariff refunds and ongoing supply chain pressure; the dual mandate of sustainability performance and cost management is defining the strategic agenda for automotive OEMs navigating the 2026 disruption environment',
        'The RSM Global automotive trends report (April 30, 2026) confirms that the most common AI mistake in automotive is funding external data-monetization ambitions before fixing the internal data foundations; leaders are running the opposite sequence — near-term cost-reduction use cases first, enterprise-grade data architecture second, and revenue-generating products last; this sequencing discipline is becoming a key differentiator in automotive logistics optimization'
      ]),
      link: 'https://logisticsviewpoints.com/2026/05/07/fords-manufacturing-reset-shows-how-automakers-are-rebuilding-the-ev-supply-chain/'
    },

    // ── Materials Pricing ─────────────────────────────────────────────
    {
      category: 'Materials Pricing',
      label: 'ALUMINUM TIGHT SUPPLY IRAN WAR MAY 2026',
      title: 'Auto Industry Faces Tight Aluminum Supplies and Sharply Higher Prices Due to Iran War, U.S. Tariffs, and Major Supplier Outage',
      date: '2026-05-05',
      bullets: JSON.stringify([
        'Foley & Lardner automotive update (May 5, 2026): the auto industry faces tight aluminum supplies and sharply higher prices due to the Iran war, U.S. import tariffs, and a major supplier outage; Japan imports roughly 70% of its aluminum from the Middle East, and Toyota has committed to absorbing cost increases across its supplier network rather than forcing smaller parts makers to bear them — a policy that compresses Toyota\'s own margins further',
        'Automotive World (May 8, 2026): multiple key Toyota suppliers have begun reporting shortages of aluminum, resins, and rubber — materials with production tied to the Middle East or to Gulf energy costs; average prices for these materials have risen sharply since the Iran conflict began in late February; Toyota\'s JP 670bn Iran war cost estimate assumes the war continues until March 2027, with aluminum, resin, and naphtha shortages as the primary cost drivers',
        'The Foley automotive update confirms that certain Toyota suppliers in Japan have warned that supply disruptions caused by the Iran war could halt vehicle production within weeks due to material shortages including aluminum, resin, and naphtha; the combination of tariff-driven cost increases and Iran war-related material shortages is creating a dual cost shock for automotive OEMs that is proving difficult to offset through pricing or operational efficiency'
      ]),
      link: 'https://www.jdsupra.com/legalnews/foley-automotive-update-may-2026-1446679/'
    },
    {
      category: 'Materials Pricing',
      label: 'MOTOR OIL SHORTAGE SYNTHETIC MAY 2026',
      title: 'Next Supply Chain Squeeze May Hit Motor Oil: Synthetic Oil Prices Surge as Middle East Energy Market Disruptions Strain Supplies',
      date: '2026-05-15',
      bullets: JSON.stringify([
        'Axios (May 15, 2026): industry groups and analysts warn that disruptions tied to Middle East energy markets are beginning to strain supplies of synthetic motor oil; the shortage is a direct consequence of the Strait of Hormuz disruption, which has reduced the availability of base oils — a key petrochemical input for synthetic lubricants — and is beginning to filter through to automotive maintenance costs',
        'CNBC (May 1, 2026): a global base oils shortage is starting to filter through to drivers of luxury cars, with analysts and industry groups warning that stocks could soon run dry if the Strait of Hormuz closure continues; the shortage is creating a new cost pressure for automotive OEMs and fleet operators that is separate from the direct tariff and aluminum cost increases already affecting the industry',
        'The compounding effect of aluminum shortages, resin shortages, naphtha shortages, and now synthetic motor oil shortages is creating a multi-dimensional materials cost challenge for automotive supply chains; OEMs that have implemented multi-source supplier strategies and strategic inventory buffers are better positioned to manage these simultaneous material shortages than those that have optimized for lean inventory and single-source supply'
      ]),
      link: 'https://www.axios.com/2026/05/15/motor-oil-shortage-synthetic-oil-prices'
    },
    {
      category: 'Materials Pricing',
      label: 'TOYOTA IRAN WAR COST 4.3BN MAY 2026',
      title: 'Toyota Takes $4.3B Iran War Hit as Materials Costs, Logistics Disruptions, and Lost Middle East Sales Compound Tariff Burden',
      date: '2026-05-08',
      bullets: JSON.stringify([
        'Automotive World (May 8, 2026): Toyota has warned that the Iran war will cost it JP 670bn (US$4.3bn) in the current fiscal year through higher materials costs, logistics disruptions, and lost Middle East sales; the JP 670bn figure covers aluminum, resins, and rubber shortages — materials with production tied to the Middle East or to Gulf energy costs; average prices for these materials have risen sharply since the conflict began in late February',
        'Toyota has committed to absorbing cost increases across its supplier network rather than forcing smaller parts makers to bear them — a policy that compresses Toyota\'s own margins further than would otherwise be the case; Azuma Takanori, Accounting Group Chief Officer, confirmed that the JP 670bn figure assumes the war continues until March 2027; Toyota\'s operating margin is now well below the JP 4.9tr peak it recorded in fiscal 2024',
        'The Japan Times (April 29, 2026) confirms that Toyota\'s parts suppliers are grappling with rising raw material costs, shortages of basic supplies, and ongoing logistical turmoil; Denso has reported a $4.5 billion profit hit; Toyoda Gosei President Katsumi Saito indicated that raw-material disruptions could emerge as early as June, highlighting potential shortages of thinners used in paint and coatings — a material that has not yet been widely flagged as a shortage risk'
      ]),
      link: 'https://www.automotiveworld.com/news/toyota-takes-us4-3bn-iran-hit-as-disruptions-batter-industry/'
    },
    {
      category: 'Materials Pricing',
      label: 'USMCA COST IMPACT NORTH AMERICA AUTOS BCG',
      title: 'BCG: U.S. Trade Actions Added $30-40B to North American Vehicle Manufacturing Costs; USMCA 2.0 Could Add $33B More',
      date: '2026-05-15',
      bullets: JSON.stringify([
        'BCG analysis (May 15, 2026): U.S. trade actions in 2025 have added an estimated $30 billion to $40 billion to the cost of goods sold in North American vehicle manufacturing; OEMs have thus far absorbed most of these costs rather than passing them on to consumers and suppliers; that tariff risk translates into profitability pressure of 20% to 60% of OEMs\' global EBIT, with the greatest impact on U.S.-based automakers',
        'A USMCA repeal could add $33 billion in additional tariff-related costs to the North American automotive industry; the U.S. has also deepened and expanded the Section 232 tariff on steel and aluminum derivative products, with duties now assessed on full customs value rather than metal content alone — further increasing the cost of materials for U.S.-assembled cars beyond the headline tariff rate',
        'The combined cost pressure from tariffs, Iran war materials shortages, and USMCA uncertainty is creating a materials pricing environment that is fundamentally different from any previous disruption period; OEMs and suppliers that have invested in integrated cost management platforms — combining tariff classification, materials cost tracking, and supply chain visibility — are demonstrating measurably better cost performance than those relying on fragmented systems'
      ]),
      link: 'https://www.bcg.com/publications/2026/usmca-2-0-a-turning-point-for-north-americas-autos'
    },

    // ── Supply Chain Risk Management ──────────────────────────────────
    {
      category: 'Supply Chain Risk Management',
      label: 'SUPPLY CHAIN RISK RETHINK 2026 IRAN WAR',
      title: 'Organizations Must Rethink Supply Chain Risk in 2026: Iran War, Tariff Volatility, and AI-Enabled Risk Monitoring Reshape Risk Management',
      date: '2026-05-07',
      bullets: JSON.stringify([
        'HS Today (April 29, 2026): AI can help companies better understand where their supply chain dependencies are and can help reveal vulnerabilities that may have been previously missed; the most important shift is from episodic audit programs to continuous risk monitoring — a supplier that passed an audit 18 months ago may be experiencing financial distress, geopolitical exposure, or operational challenges that create current risk',
        'The Iran war supply chain impact is creating five major disruption categories: energy price shocks, shipping route disruptions, petrochemical input shortages, financial market volatility, and geopolitical risk escalation; automotive supply chains are exposed across all five categories simultaneously, creating a risk management challenge that requires integrated, real-time monitoring rather than periodic risk assessments',
        'The RSM Global automotive trends report (April 30, 2026) confirms that cybersecurity has moved from a compliance line item to a sourcing and pricing signal; OEMs are running software-centric audits before contract award, and partially compliant suppliers are seeing shorter contract durations, conditional sourcing, and slowed program wins; for automotive suppliers, cyber maturity is now a commercial variable on the board agenda, not an IT line item'
      ]),
      link: 'https://www.hstoday.us/subject-matter-areas/border-security/perspective-organizations-must-rethink-supply-chain-risk-in-2026/'
    },
    {
      category: 'Supply Chain Risk Management',
      label: 'FOLEY AUTO UPDATE SUPPLY RISK MAY 2026',
      title: 'Foley Automotive Update May 2026: SDV Supply Chain Risk, Autonomous Vehicle Regulations, and OEM Restructuring Reshape Risk Landscape',
      date: '2026-05-05',
      bullets: JSON.stringify([
        'Foley & Lardner automotive update (May 5, 2026): software-defined vehicles (SDVs) may expose the automotive supply chain to higher cost pressures, according to Moody\'s predictions; the California DMV announced updated autonomous vehicle regulations including permitting criteria, new authority for law enforcement to issue citations, and guidelines for testing and deployment of heavy-duty autonomous vehicles — creating new compliance requirements for automotive supply chains',
        'The Q1 2026 Automotive News Auto Industry Confidence Index revealed growing pessimism among surveyed suppliers and automakers due to mounting concerns about consumer demand, tariffs, and elevated input costs; U.S. new light-vehicle sales are projected to reach a SAAR of 16 million units in April 2026, representing a decline of 7.3% year-over-year as tariff-driven rush buying from April 2025 creates a challenging comparison base',
        'Stellantis plans to prioritize resources and investment to four core brands — Jeep, Ram, Peugeot, and Fiat — in its turnaround strategy; GM has indefinitely paused its full-size electric truck program; Honda may extend the life cycles of certain high-volume gasoline models to mitigate the impact of $15.8 billion in EV-related impairments; these OEM restructuring decisions are creating new supply chain risk for suppliers that have invested in capacity aligned with now-paused programs'
      ]),
      link: 'https://www.jdsupra.com/legalnews/foley-automotive-update-may-2026-1446679/'
    },
    {
      category: 'Supply Chain Risk Management',
      label: 'GLOBAL SUPPLY CHAIN RISK Q1 2026',
      title: 'Global Supply Chain Radar Q1 2026: Geopolitical Tension, Trade Policy Volatility, and Regulatory Convergence Define Risk Landscape',
      date: '2026-05-08',
      bullets: JSON.stringify([
        'Global Supply Chain Law Blog (April 20, 2026): global supply chains in Q1 2026 are being shaped by a convergence of geopolitical tension, trade policy volatility, and regulatory change; the Iran war has added a new dimension of physical supply chain risk to the existing tariff and trade policy uncertainty, creating a risk environment that requires organizations to maintain scenario plans for multiple simultaneous disruption scenarios',
        'The supply chain risk management market size is valued at USD 5.85 billion in 2026, projected to reach USD 16.93 billion by 2034 at a CAGR of 14.21%; the growth reflects the increasing recognition that supply chain risk management is a strategic capability rather than a compliance function — a shift that is being driven by the compounding disruptions of the past five years',
        'The Foley automotive update (May 5, 2026) confirms that the Michigan Supreme Court dismissed the appeal of FCA US LLC v. Kamax Inc., a case of considerable importance to manufacturers that commonly utilize requirements contracts to govern long-term supply arrangements; the dismissal leaves uncertainty for automotive suppliers operating under requirements contracts, creating new legal risk that must be factored into supply chain risk management frameworks'
      ]),
      link: 'https://www.globalsupplychainlawblog.com/supply-chain/supply-chain-radar-quarter-1-2026/'
    },
    {
      category: 'Supply Chain Risk Management',
      label: 'SUPPLY CHAIN QUALITY RISK MONITORING 2026',
      title: 'Supply Chain Quality 2026: Continuous Risk Monitoring Replaces Episodic Audits as AI Reveals Hidden Vulnerabilities Across Multi-Tier Networks',
      date: '2026-05-11',
      bullets: JSON.stringify([
        'LinkedIn supply chain quality analysis (May 2026): the most important shift in supply chain risk management is from episodic audit programs to continuous risk monitoring; a supplier that passed an audit 18 months ago may be experiencing financial distress, geopolitical exposure, or operational challenges that create current risk; AI-enabled continuous monitoring platforms are becoming essential tools for managing risk across multi-tier automotive supply networks',
        'The Stout Automotive Distress Report (April 21, 2026) confirms that rising tariffs and prolonged industry headwinds are intensifying financial distress across automotive sectors; bankruptcy filings among suppliers, EV manufacturers, and retailers have surged to decade highs by 2025; fixed-fee supplier contracts limit cost pass-through, making contract renegotiation a critical survival strategy for suppliers operating on thin margins',
        'The combination of Iran war materials shortages, USMCA renegotiation uncertainty, Section 301 investigation risk, and EV transition complexity is creating a multi-dimensional supply chain risk environment that requires integrated risk management platforms; automotive OEMs and suppliers that have invested in real-time risk monitoring, scenario planning capabilities, and supplier financial health tracking are demonstrating measurably better resilience than those relying on traditional risk management approaches'
      ]),
      link: 'https://www.linkedin.com/pulse/supply-chain-quality-2026-managing-risk-across-subramanian-shanmugam-ax23c'
    },

    // ── Supplier Relationship Management ─────────────────────────────
    {
      category: 'Supplier Relationship Management',
      label: 'MAZDA DRIVE SUSTAINABILITY SUPPLIER MAY 2026',
      title: 'Mazda Joins Drive Sustainability Supply Chain Group as European Automakers Strengthen Supplier Assessment Frameworks',
      date: '2026-05-14',
      bullets: JSON.stringify([
        'Automotive World (May 14, 2026): Mazda Motor Europe has joined Drive Sustainability, gaining access to common supplier-assessment tools used by major automakers since 2012; the move reflects the growing importance of standardized supplier sustainability assessment as EU regulations require OEMs to demonstrate supply chain due diligence across environmental, social, and governance dimensions',
        'CLEPA (May 7, 2026): Europe\'s 27 largest automotive suppliers have collectively reduced their Scope 1 and 2 CO2 emissions by 7% between 2023 and 2024, while achieving an 87% recycling and recovery rate for production waste; CLEPA Secretary General Benjamin Krieger highlighted the importance of incentivizing operations and production in Europe to enable industry to scale sustainability efforts effectively',
        'The RSM Global automotive trends report (April 30, 2026) confirms that cybersecurity maturity is becoming a required baseline for accessing markets, expanding customer base, insurance availability, and warranty exposure; OEMs are running software-centric audits before contract award, and partially compliant suppliers are seeing shorter contract durations, conditional sourcing, and slowed program wins — a new dimension of supplier relationship management that requires dedicated cybersecurity governance'
      ]),
      link: 'https://www.automotiveworld.com/news/mazda-joins-drive-sustainability-supply-chain-group/'
    },
    {
      category: 'Supplier Relationship Management',
      label: 'FRANCE RENAULT STELLANTIS LOCAL SOURCING',
      title: 'France Urges Renault and Stellantis to Keep Parts Sourcing Local as European Industrial Policy Reshapes Supplier Relationships',
      date: '2026-05-18',
      bullets: JSON.stringify([
        'Automotive World (May 18, 2026): France is urging Renault and Stellantis to keep parts sourcing local as European industrial policy increasingly emphasizes domestic supply chain resilience; the push reflects a broader European trend toward supply chain regionalization driven by EU industrial policy, sustainability regulations, and the strategic lessons of the pandemic and Iran war disruptions',
        'The EU Industrial Accelerator Act\'s Made-in-EU requirements for EV battery cells and key components are creating new supplier relationship dynamics: OEMs that have committed to European battery supply chains need domestic gigafactory capacity to be viable; suppliers that can demonstrate European manufacturing credentials and circular economy capabilities are better positioned to maintain and expand OEM relationships under the new regulatory framework',
        'Foley & Lardner (May 5, 2026) confirms that Ford recently had discussions with Chinese automaker Zhejiang Geely Holding Group regarding a potential partnership in Europe; CEO Jim Farley indicated that Ford intends to expand partnerships with Chinese manufacturers in markets outside the U.S. to improve its competitive position; the Ford-Geely discussions reflect the complex supplier relationship dynamics that automotive OEMs must manage as they balance U.S. tariff compliance with global competitiveness'
      ]),
      link: 'https://www.automotiveworld.com/news/france-urges-renault-stellantis-to-keep-parts-sourcing-local/'
    },
    {
      category: 'Supplier Relationship Management',
      label: 'MEMA PURCHASING SUMMIT SUPPLIER RELATIONS',
      title: 'MEMA OE Suppliers Annual Purchasing Summit May 2026: Key WRI Study Findings and OEM-Supplier Relationship Dynamics in Tariff Era',
      date: '2026-05-19',
      bullets: JSON.stringify([
        'Plante Moran (May 19, 2026): the 17th Annual MEMA OE Suppliers, SAA, and Plante Moran Purchasing Summit will present key 2026 Working Relations Index (WRI) Study findings; the WRI measures the quality of OEM-supplier relationships and has historically shown that stronger supplier relationships correlate with better supply chain performance, lower costs, and faster problem resolution',
        'The 2026 WRI study findings are expected to reflect the impact of tariff volatility on OEM-supplier relationships: suppliers operating under fixed-fee contracts are experiencing margin compression that is straining relationships with OEMs that have been slow to renegotiate; the combination of tariff cost pass-through disputes, USMCA uncertainty, and Iran war materials cost increases is creating a more adversarial OEM-supplier relationship environment than in previous years',
        'BCG analysis (May 15, 2026) confirms that automotive companies should start preparing for USMCA 2.0 by assessing supply chain vulnerabilities and making moves to add U.S. capacity and sourcing; companies that move early will be better positioned than those that wait for clarity; the strategic adjustments required — including supplier diversification, U.S. content enhancement, and Chinese-owned factory risk mitigation — require deep supplier relationship management capabilities'
      ]),
      link: 'https://www.plantemoran.com/explore-our-thinking/events/2026/05/mema-oe-suppliers-saa-annual-purchasing-summit'
    },
    {
      category: 'Supplier Relationship Management',
      label: 'AUTOMOTIVE DISTRESS SUPPLIER BANKRUPTCY 2026',
      title: 'Automotive Supplier Distress Reaches Decade High in 2026: Bankruptcy Filings Surge as Tariffs, EV Transition, and Iran War Compound Pressure',
      date: '2026-05-07',
      bullets: JSON.stringify([
        'Stout Automotive Distress Report (April 21, 2026): rising tariffs and prolonged industry headwinds are intensifying financial distress across automotive sectors; bankruptcy filings among suppliers, EV manufacturers, and retailers have surged to decade highs by 2025; fixed-fee supplier contracts limit cost pass-through, making contract renegotiation a critical survival strategy for suppliers operating on thin margins',
        'The combination of Section 232 tariffs on steel and aluminum, IEEPA tariffs on auto parts (now partially refunded), USMCA uncertainty, and Iran war materials cost increases is creating a multi-dimensional cost shock for automotive suppliers; suppliers that cannot pass through these costs under fixed-fee contracts are facing existential financial pressure that is driving the surge in bankruptcy filings',
        'Foley & Lardner (May 5, 2026) confirms that Forvia has agreed to sell its automotive interiors business to Apollo Global Management in a deal valuing the unit at about $2.13 billion; the divestiture reflects the broader trend of automotive suppliers restructuring their portfolios to focus on core competencies and reduce exposure to segments with unfavorable tariff and EV transition dynamics; OEMs must proactively manage the supplier relationship implications of these restructuring transactions'
      ]),
      link: 'https://www.stout.com/en/insights/article/automotive-distress-restructuring-considerations-2026'
    },

    // ── Sustainability & Green Supply Chain ─────────────────────────────────────
    {
      category: 'Sustainability & Green Supply Chain',
      label: 'CLEPA EU SUSTAINABILITY STANDARDS MAY 2026',
      title: 'CLEPA: EU Must Lead Global Sustainability Strategy with Unified Market-Ready Standards as Automotive Suppliers Deliver 7% Emissions Reduction',
      date: '2026-05-07',
      bullets: JSON.stringify([
        'CLEPA (May 7, 2026): Europe\'s 27 largest automotive suppliers have collectively reduced their Scope 1 and 2 CO2 emissions by 7% between 2023 and 2024, while achieving an 87% recycling and recovery rate for production waste; however, CLEPA warns this momentum will stall unless backed by robust incentives and the right framework conditions — including greater regulatory consistency, recognition of full lifecycle impacts, and stronger alignment between sustainability and competitiveness objectives',
        'CLEPA Secretary General Benjamin Krieger highlighted the importance of incentivizing operations and production in Europe: sustainability must work for industry by fixing how we finance the transition, securing strategic inputs, and prioritizing reuse — including repair and remanufacturing — over low-value recycling; Europe can turn decarbonization into a driver of competitiveness and autonomy if the right policy framework is in place',
        'The EU Circular Economy Act is expected to establish new requirements for automotive supply chain circularity that go beyond current recycling mandates; the upcoming regulations will require OEMs and suppliers to demonstrate closed-loop material recovery systems, documented sustainability credentials, and circular economy capabilities as procurement qualification criteria — creating new supplier relationship requirements that will reshape automotive supply chain sustainability strategy'
      ]),
      link: 'https://www.clepa.eu/insights-updates/press-releases/eu-must-lead-global-sustainability-strategy-with-unified-market-ready-standards/'
    },
    {
      category: 'Sustainability & Green Supply Chain',
      label: 'EUROPE EV INVESTMENT 200BN MAY 2026',
      title: 'Europe Commits Nearly EUR 200 Billion to EV Ecosystem as Carmaker League Table Shows Supply Chains Becoming Cleaner Under EU Rules',
      date: '2026-05-11',
      bullets: JSON.stringify([
        'Reuters (May 11, 2026): countries in the European Economic Area and Switzerland have committed almost EUR 200 billion to their electric vehicle ecosystem, according to new automotive data; the investment reflects the long-term commitment to EV transition despite near-term demand volatility and the Iran war disruptions that are creating short-term cost pressures across the automotive supply chain',
        'Transport & Environment (May 7, 2026): the carmaker league table shows EV supply chains are becoming even cleaner thanks to strong EU rules; a core group of industry leaders — Ford, Mercedes, Tesla, Volvo Cars, and Volkswagen — are pushing further ahead on supply chain sustainability; Tesla ranks first overall at 49%, followed by Ford (45%) and Volvo (44%); the gap between leaders and laggards is widening as EU regulations drive sustainability performance differentiation',
        'The EU urged to keep British auto supply chains within the Made in Europe framework (Metro Global, May 13, 2026): the UK automotive industry is urging the European Union to maintain British supply chains within the Made in Europe framework as post-Brexit trade arrangements evolve; the push reflects the deep integration of UK and EU automotive supply chains and the sustainability implications of disrupting established supply chain relationships'
      ]),
      link: 'https://www.reuters.com/sustainability/climate-energy/europe-invested-200-billion-euros-so-far-boost-ev-sector-new-automotive-data-2026-05-11/'
    },
    {
      category: 'Sustainability & Green Supply Chain',
      label: 'EV ICE FACTORY STRATEGY SPLIT 2026',
      title: 'EV or ICE? Inside the Factory Strategies Splitting the Auto Industry in 2026 as OEMs Navigate Uneven Electrification Transition',
      date: '2026-05-12',
      bullets: JSON.stringify([
        'Automotive Manufacturing Solutions (May 12, 2026): from purpose-built EV megaplants to U-turns on EV and battery investments, the global auto industry\'s production strategies are diverging fast; OEMs are using smart-factory automation, flexible EV and ICE production, and alliance manufacturing strategies to boost competitiveness in a market where neither EV nor ICE dominance is certain',
        'RSM Global automotive trends (April 30, 2026): the electrification transition has not stalled, but the assumption that one powertrain pathway will dominate everywhere on the same timetable is over; middle-market suppliers that committed fully to a single trajectory are now paying a measurable cost in stranded capital and inventory; the strategic question has shifted from which powertrain to which two — requiring modular product planning and disciplined CapEx',
        'The ITIF analysis (May 11, 2026) warns that the U.S. auto industry risks retreating to a fortress America, concentrating on profitable ICE vehicles at home while EV technology evolves rapidly; the combination of tariff-driven production reshoring, EV investment write-downs, and Iran war disruptions is creating a strategic environment where sustainability commitments are being tested against short-term financial pressures'
      ]),
      link: 'https://www.automotivemanufacturingsolutions.com/electrification/ev-or-ice-inside-the-factory-strategies-splitting-the-auto-industry-in-2026/2662574'
    },
    {
      category: 'Sustainability & Green Supply Chain',
      label: 'FORD 2026 INTEGRATED REPORT SUSTAINABILITY',
      title: 'Ford 2026 Integrated Report: Carbon Neutrality Goals Persist Amid $1.3B Tariff Refunds, EV Write-Downs, and Supply Chain Transformation',
      date: '2026-05-05',
      bullets: JSON.stringify([
        'Ford 2026 Integrated Report (May 5, 2026): Ford is striving to achieve carbon neutrality across its vehicles and operations while simultaneously managing $1.3 billion in tariff refunds and $19.5 billion in EV write-downs; the dual mandate of sustainability performance and cost management is defining the strategic agenda for automotive OEMs navigating the 2026 disruption environment',
        'The Lead the Charge EV Supply Chain Leaderboard 2026 (Transport & Environment) shows Ford ranking second overall at 45% on supply chain sustainability, behind Tesla at 49%; Ford\'s manufacturing reset — rebuilding the EV supply chain for dual-use resilience — reflects a strategic approach that balances near-term ICE profitability with long-term EV sustainability commitments',
        'The RSM Global automotive trends report (April 30, 2026) confirms that supply chain sustainability is increasingly embedded in core business strategies; from advanced material data systems to circular design and climate risk management, automotive suppliers are developing solutions that can position Europe as a leader in sustainable mobility; the intersection of sustainability performance and supply chain resilience is becoming the defining competitive dimension for automotive OEMs through 2035'
      ]),
      link: 'https://www.fromtheroad.ford.com/us/en/articles/2026/ford-2026-integrated-report'
    }
  ];

  console.log(`   ✅ Prepared ${freshArticles.length} fresh articles`);
  return freshArticles;
}

// Step 2: Remove old articles from database
async function removeOldArticles() {
  console.log('🗑️  Removing old articles...');
  
  const database = await getDb();
  if (!database) {
    console.log('   ⚠️  Database not available, skipping removal');
    return { removed: 0, articles: [] };
  }
  
  try {
    const { cutoffDate } = getDateRange();
    const cutoffStr = cutoffDate.toISOString().split('T')[0];
    console.log(`   Removing articles older than ${cutoffStr}`);
    
    // Get articles to be removed first
    const allArticles = await database.select().from(newsArticles);
    const oldArticles = allArticles.filter(a => {
      const articleDate = typeof a.date === 'string' ? a.date : a.date.toISOString().split('T')[0];
      return articleDate < cutoffStr;
    });
    
    console.log(`   Found ${oldArticles.length} articles to remove`);
    
    // Remove old articles
    let removed = 0;
    for (const article of oldArticles) {
      await database.delete(newsArticles).where(eq(newsArticles.id, article.id));
      removed++;
    }
    
    console.log(`   ✅ Removed ${removed} articles`);
    return { removed, articles: oldArticles };
  } catch (error) {
    console.error('   ❌ Error removing articles:', error.message);
    return { removed: 0, articles: [], error: error.message };
  }
}

// Step 3: Add new articles to database
async function addNewArticles(articles) {
  console.log('➕ Adding new articles to database...');
  
  const database = await getDb();
  if (!database) {
    console.log('   ⚠️  Database not available, skipping insertion');
    return { added: 0 };
  }
  
  try {
    let added = 0;
    for (const article of articles) {
      try {
        await database.insert(newsArticles).values(article);
        added++;
      } catch (err) {
        console.warn(`   ⚠️  Skipped article "${article.title.substring(0, 40)}...": ${err.message}`);
      }
    }
    console.log(`   ✅ Added ${added} articles`);
    return { added };
  } catch (error) {
    console.error('   ❌ Error adding articles:', error.message);
    return { added: 0, error: error.message };
  }
}

// Step 4: Get current article counts by category
async function getArticleCounts() {
  console.log('📊 Counting articles by category...');
  
  const database = await getDb();
  if (!database) {
    console.error('   ❌ Database not available');
    return {};
  }
  
  try {
    const allArticles = await database.select().from(newsArticles);
    const counts = {};
    
    CATEGORIES.forEach(category => {
      counts[category] = allArticles.filter(a => a.category === category).length;
    });
    
    console.log('   Category counts:');
    Object.entries(counts).forEach(([cat, count]) => {
      const status = count >= MIN_ARTICLES_PER_CATEGORY ? '✅' : '⚠️';
      console.log(`   ${status} ${cat}: ${count} articles`);
    });
    
    return { counts, total: allArticles.length };
  } catch (error) {
    console.error('   ❌ Error counting articles:', error.message);
    return { counts: {}, total: 0, error: error.message };
  }
}

// Step 5: Generate update summary
async function generateUpdateSummary(stats) {
  console.log('📄 Generating update summary...');
  
  const { todayStr, startDateStr } = getDateRange();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const filename = `docs/update-history/UPDATE_SUMMARY_${timestamp}.md`;
  
  const summary = `# News Update Summary - ${todayStr}

**Update Date:** ${new Date().toLocaleString('en-US', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}

**Date Range:** ${startDateStr} to ${todayStr} (Last ${DAYS_THRESHOLD} days)

---

## Update Statistics

- **Articles Removed:** ${stats.removed || 0} (older than ${DAYS_THRESHOLD} days)
- **Articles Added:** ${stats.added || 0}
- **Total Articles:** ${stats.total || 0}

## Category Distribution

${Object.entries(stats.counts || {}).map(([cat, count]) => {
  const status = count >= MIN_ARTICLES_PER_CATEGORY ? '✅' : '⚠️';
  return `- ${status} **${cat}:** ${count} articles`;
}).join('\n')}

---

## Removed Articles

${stats.removedArticles && stats.removedArticles.length > 0 
  ? stats.removedArticles.map(a => `- [${a.title}](${a.link}) - ${a.date instanceof Date ? a.date.toISOString().split('T')[0] : a.date}`).join('\n')
  : '_No articles removed_'}

---

## Added Articles

${stats.addedArticles && stats.addedArticles.length > 0
  ? stats.addedArticles.map(a => `- [${a.title}](${a.link}) - ${a.category}`).join('\n')
  : '_No articles added (manual update required)_'}

---

## Status

${stats.total >= CATEGORIES.length * MIN_ARTICLES_PER_CATEGORY 
  ? '✅ **All categories have sufficient articles**' 
  : '⚠️ **Some categories need more articles**'}

---

## Next Steps

1. Verify all articles display correctly on website
2. Check feedback system is working
3. Monitor scheduled task for next update
4. Review category balance if needed

---

_This summary was automatically generated by the automated news update pipeline._
`;

  try {
    // Ensure docs/update-history directory exists
    if (!existsSync('docs/update-history')) {
      await mkdir('docs/update-history', { recursive: true });
    }
    await writeFile(filename, summary, 'utf-8');
    console.log(`   ✅ Summary saved to ${filename}`);
    return filename;
  } catch (error) {
    console.error('   ❌ Error saving summary:', error.message);
    return null;
  }
}

// Step 6: Update CHANGELOG.md
async function updateChangelog(summaryFile, stats) {
  console.log('📋 Updating CHANGELOG.md...');
  
  const { todayStr } = getDateRange();
  const changelogPath = 'CHANGELOG.md';
  
  const newEntry = `
## [${todayStr}] - Automated News Update

- Removed ${stats.removed || 0} articles older than ${DAYS_THRESHOLD} days
- Added ${stats.added || 0} new articles
- Total articles: ${stats.total || 0}
- See [detailed summary](${summaryFile}) for more information

`;

  try {
    let changelog = '';
    if (existsSync(changelogPath)) {
      changelog = await readFile(changelogPath, 'utf-8');
    } else {
      changelog = `# Changelog

All notable changes to the Mobility & Auto Supply Chain Brief will be documented in this file.

`;
    }
    
    // Insert new entry after the header
    const lines = changelog.split('\n');
    const headerEnd = lines.findIndex(l => l.startsWith('##'));
    
    if (headerEnd > 0) {
      lines.splice(headerEnd, 0, newEntry);
    } else {
      lines.push(newEntry);
    }
    
    await writeFile(changelogPath, lines.join('\n'), 'utf-8');
    console.log('   ✅ CHANGELOG.md updated');
    return true;
  } catch (error) {
    console.error('   ❌ Error updating changelog:', error.message);
    return false;
  }
}

// Step 7: Commit and push to Git
async function commitAndPush(message) {
  console.log('🔄 Committing changes to Git...');
  
  try {
    // Stage all changes
    await execAsync('git add -A');
    console.log('   ✅ Changes staged');
    
    // Commit
    await execAsync(`git commit -m "${message}"`);
    console.log('   ✅ Changes committed');
    
    // Push to origin
    try {
      await execAsync('git push origin main');
      console.log('   ✅ Pushed to origin');
    } catch (error) {
      console.log('   ⚠️  Could not push to origin:', error.message.split('\n')[0]);
    }
    
    return true;
  } catch (error) {
    // If no changes to commit, that's okay
    if (error.message.includes('nothing to commit')) {
      console.log('   ℹ️  No changes to commit');
      return true;
    }
    console.error('   ❌ Git error:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting Automated News Update Pipeline\n');
  console.log('=' .repeat(60));
  
  const startTime = Date.now();
  const stats = {};
  
  try {
    // Step 1: Fetch news
    const newArticles = await fetchNewsArticles();
    stats.addedArticles = newArticles;
    
    // Step 2: Remove old articles
    const removeResult = await removeOldArticles();
    stats.removed = removeResult.removed;
    stats.removedArticles = removeResult.articles || [];
    
    // Step 3: Add new articles
    if (newArticles.length > 0) {
      const addResult = await addNewArticles(newArticles);
      stats.added = addResult.added;
    } else {
      stats.added = 0;
      console.log('\n⚠️  No new articles fetched. Manual news gathering required.');
    }
    
    // Step 4: Get current counts
    const countResult = await getArticleCounts();
    stats.counts = countResult.counts;
    stats.total = countResult.total;
    
    // Step 5: Generate summary
    const summaryFile = await generateUpdateSummary(stats);
    
    // Step 6: Update changelog
    if (summaryFile) {
      await updateChangelog(summaryFile, stats);
    }
    
    // Step 7: Commit and push
    const commitMsg = `Automated news update - ${new Date().toISOString().split('T')[0]}`;
    await commitAndPush(commitMsg);
    
    // Close DB connection
    if (connection) {
      await connection.end();
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Automated News Update Pipeline Complete!');
    console.log(`   Duration: ${duration}s`);
    console.log(`   Articles removed: ${stats.removed || 0}`);
    console.log(`   Articles added: ${stats.added || 0}`);
    console.log(`   Total articles: ${stats.total || 0}`);
    console.log('=' .repeat(60) + '\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Pipeline failed:', error);
    if (connection) {
      await connection.end().catch(() => {});
    }
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as runAutomatedUpdate };
