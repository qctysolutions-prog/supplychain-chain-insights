import { drizzle } from "drizzle-orm/mysql2";
import { newsArticles } from "../drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

const freshArticles = [
  // Tariff Regulations & Trade Policies (4 articles)
  {
    category: "Tariff Regulations & Trade Policies",
    label: "COMPREHENSIVE TRACKER",
    title: "Trump 2.0 tariff tracker: Reciprocal and country-specific tariffs",
    date: "2026-01-14",
    bullets: JSON.stringify(["Comprehensive tracking of Trump administration tariffs including 10% baseline reciprocal tariff", "Plans to increase to 15-20% rate announced", "Country-specific tariff details and implementation timelines"]),
    link: "https://www.tradecomplianceresourcehub.com/2026/01/14/trump-2-0-tariff-tracker/"
  },
  {
    category: "Tariff Regulations & Trade Policies",
    label: "BUSINESS IMPACT",
    title: "Tariffs in 2026: How new trade rules impact your business",
    date: "2026-01-15",
    bullets: JSON.stringify(["Tariff policies may shift rapidly in 2026", "New trade rules and court decisions affecting businesses", "Guidance on preparation strategies for companies"]),
    link: "https://www.avalara.com/blog/en/north-america/2026/01/tariffs-2026-how-new-trade-rules-impact-business.html"
  },
  {
    category: "Tariff Regulations & Trade Policies",
    label: "USMCA UNDER THREAT",
    title: "Trump says trade agreement with Mexico, Canada 'irrelevant' to US",
    date: "2026-01-13",
    bullets: JSON.stringify(["Trump dismisses USMCA relevance to US interests", "Car makers urge extension of trade agreement", "Agreement crucial to US auto production and North American supply chains"]),
    link: "https://www.aljazeera.com/economy/2026/1/13/trump-says-trade-agreement-with-mexico-canada-irrelevant-to-us"
  },
  {
    category: "Tariff Regulations & Trade Policies",
    label: "INDUSTRY RESPONSE",
    title: "Automakers urge U.S. to stay in USMCA as Trump calls it 'irrelevant'",
    date: "2026-01-16",
    bullets: JSON.stringify(["Trump says USMCA offers 'no real advantage' to US", "Agreement up for review in 2026", "Domestic auto manufacturers say USMCA is vital to operations"]),
    link: "https://www.autonews.com/manufacturing/an-usmca-trump-farley-update-0116/"
  },

  // Logistics and Transportation (4 articles)
  {
    category: "Logistics and Transportation",
    label: "2026 TRENDS",
    title: "Trends shaping mobility, logistics and manufacturing in 2026",
    date: "2026-01-16",
    bullets: JSON.stringify(["Automation reshaping transport and logistics operations", "Electrification and mobility-as-a-service gaining traction", "Robo-taxi trials and EV-ready logistics hubs expanding"]),
    link: "https://www.shoosmiths.com/perspectives/stories/articles/trends-shaping-mobility-logistics-and-manufacturing-2026"
  },
  {
    category: "Logistics and Transportation",
    label: "SECTOR OUTLOOK",
    title: "The road haulage sector's recovery is set to stay in the slow lane",
    date: "2026-01-15",
    bullets: JSON.stringify(["Road transport sector presents mixed picture in 2026", "Industrial goods companies still face lagging demand", "Consumer sectors showing more traction and recovery"]),
    link: "https://think.ing.com/articles/road-haulage-sector-mixed-recovery-in-the-slow-lane/"
  },
  {
    category: "Logistics and Transportation",
    label: "EVOLUTION",
    title: "Supply Chain Chaos Meets Its Match in 2026",
    date: "2026-01-14",
    bullets: JSON.stringify(["2026 shaping up as pivotal year for supply chains", "Three key forces converging to transform logistics", "New technologies and strategies emerging to manage disruption"]),
    link: "https://www.supplychainbrain.com/blogs/1-think-tank/post/43206-chaos-meets-its-match-with-2026-being-the-year-supply-chains-evolve"
  },
  {
    category: "Logistics and Transportation",
    label: "TRADE ROUTES",
    title: "The Changing Landscape of Global Trade Routes in 2026",
    date: "2026-01-16",
    bullets: JSON.stringify(["International dynamics redefining trade routes in 2026", "New freight corridors emerging in response to geopolitical shifts", "Affordable and reliable solutions adapting to route changes"]),
    link: "https://blog.gettransport.com/news/global-trade-routes-2026-changes/"
  },

  // Materials Pricing (4 articles)
  {
    category: "Materials Pricing",
    label: "SUPPLIER OUTLOOK",
    title: "2026 Automotive Supplier Outlook: What top executives expect",
    date: "2026-01-14",
    bullets: JSON.stringify(["Interviews with 59 senior supply chain executives", "Suppliers navigating uncertainty and positioning for growth", "Cost pressures and material pricing strategies for 2026"]),
    link: "https://www.spglobal.com/automotive-insights/en/blogs/2026/01/2026-automotive-supplier-outlook"
  },
  {
    category: "Materials Pricing",
    label: "STEEL DEMAND",
    title: "US Auto Production Trends: EV Strategy and Changes",
    date: "2026-01-12",
    bullets: JSON.stringify(["Shifts towards hybrids impacting steel demand", "EV production trends affecting material requirements", "Steel pricing influenced by automotive production changes"]),
    link: "https://www.fastmarkets.com/insights/ev-pivot-by-automakers-will-likely-drive-2026-us-auto-production-trends-analysts/"
  },
  {
    category: "Materials Pricing",
    label: "LITHIUM SURGE",
    title: "Lithium Prices Surge Amid Strong Demand Forecasts",
    date: "2026-01-15",
    bullets: JSON.stringify(["Lithium carbonate prices expected between $15,000-$17,000 per ton", "Strong demand forecasts driving price increases", "Potential for prices to reach $28,000 per ton by late 2026"]),
    link: "https://carboncredits.com/lithium-prices-surge-amid-strong-demand-forecasts-could-reach-up-to-28000-ton-by-2026-nili/"
  },
  {
    category: "Materials Pricing",
    label: "PRICE UPDATE",
    title: "Lithium Market: Real-Time Price Data and Analysis",
    date: "2026-01-16",
    bullets: JSON.stringify(["Lithium at 158,000 CNY/T, down 0.63% from previous day", "Price risen 62.80% over past month", "Up 102.95% year-over-year showing strong market dynamics"]),
    link: "https://tradingeconomics.com/commodity/lithium"
  },

  // Supply Chain Risk Management (4 articles)
  {
    category: "Supply Chain Risk Management",
    label: "ANNUAL REPORT",
    title: "Sphera Supply Chain Risk Report 2026",
    date: "2026-01-15",
    bullets: JSON.stringify(["Report exposes gap between confidence and persistent disruption", "Data from 800 CPOs and CSCOs analyzed", "Key risk factors and mitigation strategies identified"]),
    link: "https://sphera.com/resources/report/sphera-supply-chain-risk-report-2026/"
  },
  {
    category: "Supply Chain Risk Management",
    label: "DISRUPTION PREP",
    title: "Are You Prepared for the Supply Chain Disruptions of 2026?",
    date: "2026-01-12",
    bullets: JSON.stringify(["Insights and strategies to navigate likely disruptions", "Everstream Analytics 2026 Annual Supply Chain Risk Report", "Proactive risk management approaches for automotive sector"]),
    link: "https://www.everstream.ai/articles/are-you-prepared-for-the-supply-chain-disruptions-of-2026/"
  },
  {
    category: "Supply Chain Risk Management",
    label: "FINANCIAL RISK",
    title: "Supplier Financial Distress: What It Means for Your Fleet in 2026",
    date: "2026-01-15",
    bullets: JSON.stringify(["Fleet parts supply risk rising as suppliers face distress", "Tariffs adding pressure to supplier financial health", "Strategies to protect uptime and manage costs in 2026"]),
    link: "https://alliancefleetsolutions.com/2026/01/15/supplier-financial-distress-what-it-means-for-your-fleet-in-2026/"
  },
  {
    category: "Supply Chain Risk Management",
    label: "INDUSTRY OUTLOOK",
    title: "Global Automotive Outlook: Predictions For 2026",
    date: "2026-01-15",
    bullets: JSON.stringify(["Top ten automotive industry trends for 2026", "Supply chain resilience strategies highlighted", "Risk management approaches for volatile environment"]),
    link: "https://www.forbes.com/sites/sarwantsingh/2026/01/15/global-automotive-outlook-predictions-for-2025/"
  },

  // Supplier Relationship Management (4 articles)
  {
    category: "Supplier Relationship Management",
    label: "TRUST GAP",
    title: "Gap Between Best And Worst Automaker-Supplier Trust Hits 17 Years",
    date: "2026-01-10",
    bullets: JSON.stringify(["Trust gap reaches 17-year high between top and bottom automakers", "Strong supplier relationships now a competitive advantage", "Working Relations Index study reveals widening divide"]),
    link: "https://www.forbes.com/sites/katevitasek/2026/01/10/trust-gap-between-best-and-worst-automaker-supplier-ties-hits-17-years/"
  },
  {
    category: "Supplier Relationship Management",
    label: "PARTNERSHIPS",
    title: "Strategic partnerships: 50% of suppliers pursuing OEM collaboration",
    date: "2026-01-14",
    bullets: JSON.stringify(["50% of suppliers actively pursuing strategic partnerships", "Collaboration with OEMs and technology firms increasing", "Partnerships aimed at enhancing innovation and market reach"]),
    link: "https://www.spglobal.com/automotive-insights/en/blogs/2026/01/2026-automotive-supplier-outlook"
  },
  {
    category: "Supplier Relationship Management",
    label: "NEW APPROACH",
    title: "Stop chasing annual productivity—rethinking supplier relationships",
    date: "2026-01-14",
    bullets: JSON.stringify(["OEMs moving away from adversarial yearly cost-down negotiations", "New approach focuses on enduring collaborative impact", "Long-term value creation replacing short-term productivity gains"]),
    link: "https://www.kearney.com/service/product-excellence-and-renewal-lab/article/stop-chasing-annual-productivity-rethinking-supplier-relationships-for-enduring-impact"
  },
  {
    category: "Supplier Relationship Management",
    label: "SURVIVAL STRATEGIES",
    title: "Navigating Stormy Seas - How Suppliers Survive Economic Uncertainty",
    date: "2026-01-16",
    bullets: JSON.stringify(["Working capital challenges forcing supplier adaptation", "Shipping costs and supply chain issues impacting relationships", "New strategies for supplier-OEM collaboration emerging"]),
    link: "https://michauto.org/navigating-stormy-seas-how-suppliers-survive-in-times-of-economic-uncertainty/"
  },

  // Sustainability and Green Supply Chain (4 articles)
  {
    category: "Sustainability and Green Supply Chain",
    label: "IEA REPORT",
    title: "IEA: What's Next for EVs, Sustainability & The Car Industry?",
    date: "2026-01-14",
    bullets: JSON.stringify(["Global car industry reshaped by EV growth", "China's dominance in EV manufacturing expanding", "Shifting supply chains redefining sustainability standards"]),
    link: "https://sustainabilitymag.com/news/iea-whats-next-for-evs-sustainability-the-car-industry"
  },
  {
    category: "Sustainability and Green Supply Chain",
    label: "REGULATION",
    title: "China implements strict EV battery recycling rules for 2026",
    date: "2026-01-16",
    bullets: JSON.stringify(["Strict EV battery recycling rules implemented in China", "Battery and NEV makers responsible for recycling", "New regulations take effect April 2026"]),
    link: "https://carnewschina.com/2026/01/16/china-implements-strict-ev-battery-recycling-rules-for-2026/"
  },
  {
    category: "Sustainability and Green Supply Chain",
    label: "US LEGISLATION",
    title: "To make EVs greener, Colorado lawmakers could require recycled batteries",
    date: "2026-01-14",
    bullets: JSON.stringify(["Colorado bill would mandate recycled battery content", "Carmakers would be responsible for battery end-of-life", "Legislation aims to keep EV batteries out of landfills"]),
    link: "https://www.cpr.org/2026/01/14/ev-recycled-batteries-bill/"
  },
  {
    category: "Sustainability and Green Supply Chain",
    label: "RECYCLING CENTER",
    title: "BMW and Encory Open Recycling Center to Recover Battery Materials",
    date: "2026-01-10",
    bullets: JSON.stringify(["Cell Recycling Competence Center (CRCC) opened", "Facility will recover raw materials from EV batteries", "Supports circular economy in automotive manufacturing"]),
    link: "https://www.assemblymag.com/articles/99756-bmw-and-encory-open-recycling-center-to-recover-battery-materials"
  },
];

async function seedFreshNews() {
  try {
    console.log("Starting fresh news seed...");
    
    for (const article of freshArticles) {
      await db.insert(newsArticles).values(article);
      console.log(`✓ Added: ${article.title}`);
    }
    
    console.log(`\n✅ Successfully seeded ${freshArticles.length} fresh news articles!`);
    console.log("\nBreakdown by category:");
    const categories = {};
    freshArticles.forEach(article => {
      categories[article.category] = (categories[article.category] || 0) + 1;
    });
    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`  - ${cat}: ${count} articles`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error("Error seeding fresh news:", error);
    process.exit(1);
  }
}

seedFreshNews();
