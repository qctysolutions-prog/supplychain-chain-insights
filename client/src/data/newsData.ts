/**
 * Mobility & Auto Supply Chain Brief - News Data
 * All articles within 14-day window (Dec 30, 2025 - Jan 13, 2026)
 * All URLs verified for accessibility
 */

export interface NewsArticle {
  label: string;
  title: string;
  date: string; // yyyy-mm-dd format
  bullets: string[];
  link: string;
  category: string;
}

export const NEWS_DATA: NewsArticle[] = [
  // Category 1: Tariff Regulations & Trade Policies
  {
    category: "Tariff Regulations & Trade Policies",
    label: "Comprehensive Tracker",
    title: "Trump 2.0 tariff tracker: Reciprocal and country-specific tariffs",
    date: "2026-01-10",
    bullets: [
      "Comprehensive tracking of Trump administration tariffs including 10% baseline reciprocal tariff with threatened increase to 15-20%.",
      "25% automobile surtax threatened; 40% transshipment penalty implemented for goods evading duties.",
      "Multiple country-specific tariffs ranging from 10-30% affecting automotive supply chains across North America and globally."
    ],
    link: "https://www.tradecomplianceresourcehub.com/2026/01/10/trump-2-0-tariff-tracker/"
  },
  {
    category: "Tariff Regulations & Trade Policies",
    label: "USMCA Violation",
    title: "Volkswagen argues Trump auto tariffs violate USMCA commitments",
    date: "2026-01-12",
    bullets: [
      "VW stated that Trump's 25% tariffs on Mexican and Canadian automotive goods violate USMCA commitments negotiated during first term.",
      "Automaker urged U.S. trade officials to prioritize tariff relief over stricter rules of origin during 2026 USMCA review.",
      "Warned that tightening content requirements could further strain affordability by driving up vehicle production costs."
    ],
    link: "https://www.cbtnews.com/volkswagen-says-trump-tariffs-violate-usmca/"
  },
  {
    category: "Tariff Regulations & Trade Policies",
    label: "Mexico Tariffs",
    title: "Mexico introduces new tariffs on cars and auto parts from non-FTA countries",
    date: "2026-01-12",
    bullets: [
      "Mexico implemented tariffs of up to 50% on passenger cars and 15-35% on auto parts from non-FTA countries effective January 1, 2026.",
      "Targets imports from China, Brazil, South Korea, India and Russia to protect Mexican strategic industries and boost local production.",
      "China was Mexico's second-biggest trading partner in 2024; measures align Mexico with U.S. ahead of USMCA review."
    ],
    link: "https://www.automotivelogistics.media/supply-chain/mexico-introduces-new-tariffs-on-cars-and-auto-parts-for-countries-without-a-trade-agreement/2585186"
  },
  {
    category: "Tariff Regulations & Trade Policies",
    label: "Policy Update",
    title: "Foley Automotive Update: Tariff postponement and industry M&A trends",
    date: "2026-01-12",
    bullets: [
      "U.S. Trade Representative postponed imposing new tariffs on Chinese semiconductor imports until June 23, 2027.",
      "PwC highlights supplier consolidation in response to rising costs and subdued end-market demand as key 2026 M&A theme.",
      "Automotive industry faces continued tariff uncertainty alongside margin pressure and regulatory shifts."
    ],
    link: "https://www.jdsupra.com/legalnews/foley-automotive-update-january-2026-9186309/"
  },
  
  // Category 2: Logistics & Transportation
  {
    category: "Logistics & Transportation",
    label: "Freight Market",
    title: "Automotive logistics faces chip shortages and policy shifts",
    date: "2026-01-08",
    bullets: [
      "Legal disputes disrupting Nexperia chip supplier leading to production delays and shutdowns at major automakers; further plant shutdowns planned for 2026.",
      "U.S. proposed lowering fuel efficiency standard to 34.5 mpg by 2031 from current 50 mpg, creating uncertainty for automotive supply chains.",
      "Mexico's new 25-50% tariff on cars and auto parts from China and non-FTA countries went into effect January 1, 2026."
    ],
    link: "https://www.chrobinson.com/en-us/resources/insights-and-advisories/north-america-freight-insights/jan-2026-freight-market-update/industry-insights/automotive/"
  },
  {
    category: "Logistics & Transportation",
    label: "Supply Chain Outlook",
    title: "In 2026, logistics buyers will realize that outcomes matter, not AI",
    date: "2026-01-09",
    bullets: [
      "Anticipated demand resurgence in late 2026 will test logistics capacity; systems underutilized in 2024-2025 could suddenly be overrun.",
      "Logistics buyers shifting focus from AI hype to measurable outcomes and operational resilience.",
      "Supply-demand imbalance driving spot rates higher into first week of 2026 across multiple freight modes."
    ],
    link: "https://www.supplychainbrain.com/blogs/1-think-tank/post/43064-in-2026-logistics-buyers-will-finally-realize-that-outcomes-matter-not-ai"
  },
  {
    category: "Logistics & Transportation",
    label: "Global Freight",
    title: "Global logistics update: Businesses brace for potential IEEPA impacts",
    date: "2026-01-08",
    bullets: [
      "Spot rates continued to rise into first week of 2026 driven by supply-demand imbalance.",
      "Asia-North Europe rates maintaining upward momentum; businesses preparing for potential tariff impacts under IEEPA authority.",
      "Freight market volatility expected to continue through Q1 2026 affecting automotive and manufacturing sectors."
    ],
    link: "https://www.flexport.com/global-logistics-update/january-8-2026-businesses-brace-for-a-potential-ieepa/"
  },
  {
    category: "Logistics & Transportation",
    label: "Market Growth",
    title: "Automotive logistics market expected to reach $634.26 billion by 2030",
    date: "2026-01-07",
    bullets: [
      "Global automotive logistics market projected to grow at 6.3% CAGR from 2024 to 2030, reaching $634.26 billion.",
      "Growth driven by increasing vehicle production, e-commerce expansion, and need for efficient supply chain management.",
      "Advanced technologies including IoT, AI, and blockchain transforming automotive logistics operations and visibility."
    ],
    link: "https://www.globenewswire.com/news-release/2026/01/07/3214664/0/en/Automotive-Logistics-Market-is-expected-to-generate-a-revenue-of-USD-634-26-Billion-by-2030-Globally-at-6-3-CAGR-Verified-Market-Research.html"
  },
  
  // Category 3: Materials Pricing
  {
    category: "Materials Pricing",
    label: "Lithium Surge",
    title: "Lithium soars as China to revoke battery export tax rebates",
    date: "2026-01-12",
    bullets: [
      "Lithium prices in China soared 167% from last year's low, bolstered by Beijing's pledge to crack down on overcapacity.",
      "China's decision to revoke battery export tax rebates driving prices higher; lithium carbonate futures hitting upper limits.",
      "Rising prices signal tightening markets as EV and energy storage demand accelerates into 2026."
    ],
    link: "https://www.reuters.com/world/asia-pacific/lithium-soars-china-revoke-battery-export-tax-rebates-2026-01-12/"
  },
  {
    category: "Materials Pricing",
    label: "Battery Materials",
    title: "Lithium carbonate surplus to narrow as energy storage drives growth",
    date: "2026-01-09",
    bullets: [
      "Surplus in global lithium carbonate market expected to narrow in 2026 with both demand and supply set to grow.",
      "Energy storage demand forecast to drive significant growth; analysts project lithium demand to grow 17-30% in 2026.",
      "Prices could range 80,000-200,000 yuan per ton as energy storage demand may rise 55% in 2026."
    ],
    link: "https://www.spglobal.com/energy/en/news-research/latest-news/metals/010926-commodities-2026-lithium-carbonate-surplus-to-narrow-energy-storage-to-drive-growth"
  },
  {
    category: "Materials Pricing",
    label: "Metals Outlook",
    title: "2026 metals outlook: 4 trends to watch including aluminum and structural deficit",
    date: "2026-01-10",
    bullets: [
      "Strategic rise of aluminum driven by data center and infrastructure builds creating structural deficit in metals markets.",
      "Tariffs and low stocks propelling aluminum costs to records for U.S. consumers; costs up 40% since June 2025.",
      "U.S. aluminum premium should be around 86 cents/lb; inventories plummeted during 2025 creating supply constraints."
    ],
    link: "https://threedmetals.com/blog/2026-metals-outlook-4-trends-to-watch/"
  },
  {
    category: "Materials Pricing",
    label: "Aluminum Pricing",
    title: "Aluminum raw material price trends in January 2026",
    date: "2026-01-07",
    bullets: [
      "Upward yet stable trend in aluminum raw material prices in January 2026 signals vibrant future for wheels industry.",
      "Aluminum at core of automotive lightweighting and efficiency initiatives; pricing stability supporting production planning.",
      "Mexican aluminum prices poised to rise after atypical year; robust market activity and infrastructure demand driving trends."
    ],
    link: "https://www.jastooforgedwheel.com/news/aluminum-raw-material-price-trends-in-january-85380139.html"
  },
  
  // Category 4: Supply Chain Risk Management
  {
    category: "Supply Chain Risk Management",
    label: "Trend Analysis",
    title: "5 supply chain management trends to watch in 2026",
    date: "2026-01-08",
    bullets: [
      "Geopolitical tumult heating up in 2026; supply chain managers should expect major trends and risks across retail and manufacturing.",
      "Focus on continuous vulnerability-detection tools, multi-factor authentication, and supplier interface security.",
      "Companies reducing dependence on single large offshore suppliers; 'China-plus-one' strategies gaining momentum."
    ],
    link: "https://www.supplychaindive.com/news/supply-chain-trends-risks-2026-retail-manufacturing/808797/"
  },
  {
    category: "Supply Chain Risk Management",
    label: "Chip Crisis",
    title: "Chip scarcity assaults auto industry amid worsening Nexperia and DRAM crisis",
    date: "2026-01-05",
    bullets: [
      "Legal disputes disrupting Nexperia, one of automotive industry's main chip suppliers, leading to production delays and shutdowns.",
      "DRAM makers focusing on AI data centers fuel auto chip shortage risk; Samsung, SK Hynix and Micron shifting capacity.",
      "Automakers could face another chip shortage as suppliers chase higher margins in AI markets; premium vehicles particularly vulnerable."
    ],
    link: "https://www.tomshardware.com/tech-industry/chip-scarcity-assaults-auto-industry-amid-the-worsening-nexperia-and-dram-crisis"
  },
  {
    category: "Supply Chain Risk Management",
    label: "Cyber Threats",
    title: "Cyber risks grow as manufacturers turn to AI and cloud systems",
    date: "2026-01-08",
    bullets: [
      "Biggest cybersecurity risk in manufacturing comes from connectivity being introduced into environments never designed for it.",
      "Manufacturers increasingly vulnerable as they adopt AI-based automation and cloud systems without adequate security hardening.",
      "Supply chain vulnerabilities create additional weaknesses; attackers often target vendors and partners to gain access."
    ],
    link: "https://www.supplychaindive.com/news/manufacturing-cyber-risks-grow-ai-and-cloud-systems/809010/"
  },
  {
    category: "Supply Chain Risk Management",
    label: "Threat Report",
    title: "Everstream warns cyberattacks, hybrid warfare set to disrupt supply chains in 2026",
    date: "2026-01-08",
    bullets: [
      "2026 Annual Supply Chain Risk Report documents 2,526 cyber incidents across all industries between Jan. 1 and Nov. 30, 2025.",
      "Cyberattacks, hybrid warfare, and trade policy weaponization identified as top disruptors for 2026 supply chains.",
      "Automotive sector particularly vulnerable; JLR cyberattack caused 43% drop in wholesale volumes highlighting financial impact."
    ],
    link: "https://industrialcyber.co/supply-chain-security/everstream-warns-cyberattacks-hybrid-warfare-and-trade-policy-weaponization-set-to-disrupt-supply-chains-in-2026/"
  },
  
  // Category 5: Supplier Relationship Management
  {
    category: "Supplier Relationship Management",
    label: "CES Partnerships",
    title: "Auto industry touts partnerships with tech giants at CES 2026",
    date: "2026-01-08",
    bullets: [
      "Relationships between automakers, suppliers and tech companies shifting as partnerships become the norm at CES 2026.",
      "Traditional OEM-supplier relationship evolving; both parties leveraging AI and new forms of collaboration to drive innovation.",
      "Partnerships spanning autonomous vehicles, software development, and electrification technologies reshaping industry dynamics."
    ],
    link: "https://www.autonews.com/manufacturing/suppliers/an-ces-2026-supply-chain-0108/"
  },
  {
    category: "Supplier Relationship Management",
    label: "Autonomous Tech",
    title: "Nvidia and auto suppliers roll out partnerships to rekindle self-driving push",
    date: "2026-01-09",
    bullets: [
      "Nvidia and auto suppliers announcing deals to support commercial rollout of self-driving technology at CES 2026.",
      "Partnerships aim to accelerate deployment of autonomous vehicles using advanced AI and computing platforms.",
      "Collaboration highlights growing convergence between semiconductor, software, and automotive manufacturing sectors."
    ],
    link: "https://www.reuters.com/business/autos-transportation/nvidia-auto-suppliers-roll-out-partnerships-rekindle-self-driving-push-2026-01-09/"
  },
  {
    category: "Supplier Relationship Management",
    label: "Open-Source Alliance",
    title: "Auto industry expands open-source pact to boost development and cut costs",
    date: "2026-01-07",
    bullets: [
      "More than 30 companies across automotive supply chain agreed to collaborate on open-source software for next-generation cars.",
      "Collaboration aims to cut software development costs by up to 40% and slash time-to-market by 30%.",
      "Standardized software platforms will accelerate innovation and reduce integration costs across supply base."
    ],
    link: "https://www.rte.ie/news/business/2026/0107/1551918-auto-industry-expands-open-source-pact-to-cut-costs/"
  },
  {
    category: "Supplier Relationship Management",
    label: "M&A Trends",
    title: "Automotive M&A outlook: Supplier consolidation and carve-outs dominate 2026",
    date: "2026-01-09",
    bullets: [
      "PwC's key themes for automotive M&A in 2026 include supplier consolidation in response to rising costs and subdued demand.",
      "AI-driven efficiency gains and margin pressure driving strategic dealmaking across automotive supply chain.",
      "Supplier carve-outs and portfolio optimization expected to accelerate as OEMs and Tier 1 suppliers restructure operations."
    ],
    link: "https://www.foley.com/insights/publications/2026/01/foley-automotive-update-01-09/"
  },
  
  // Category 6: Sustainability & Green Supply Chain
  {
    category: "Sustainability & Green Supply Chain",
    label: "Battery Recycling",
    title: "Toyota Tsusho strengthens EV-battery recycling from collection to recycle stages",
    date: "2026-01-07",
    bullets: [
      "Toyota Tsusho acquired Radius Recycling with 100+ North American sites to scale EV battery collection and recycling capacity.",
      "Strategy links 'vein' (collection) and 'artery' (supply) chains, recovering high-purity lithium, nickel, cobalt and rare-earth metals.",
      "Positions recycling as stable-profit business supporting carbon neutrality by supplying recovered materials back into batteries."
    ],
    link: "https://autorecyclingworld.com/toyota-tsusho-strengthens-ev-battery-recycling-from-collection-to-recycle-stages/"
  },
  {
    category: "Sustainability & Green Supply Chain",
    label: "Circular Economy",
    title: "Clean energy supply chains need circular economy for critical minerals",
    date: "2026-01-07",
    bullets: [
      "Circular economy could create second supply source for critical minerals used in clean energy technologies for global energy transition.",
      "Battery recycling and material recovery essential for reducing dependence on primary mining and overseas resource imports.",
      "Automotive and energy storage sectors driving demand for circular supply chain models to ensure mineral security."
    ],
    link: "https://www.weforum.org/stories/2026/01/circular-economy-clean-energy-supply-chain-critical-minerals/"
  },
  {
    category: "Sustainability & Green Supply Chain",
    label: "Industry Transformation",
    title: "Automotive industry prepares for connected and circular economy",
    date: "2026-01-06",
    bullets: [
      "Numerous OEMs including BMW, Ford, Renault, Volkswagen and Volvo part of Catena-X circular economy initiative.",
      "Standardized, auditable CO₂ tracking and reporting across suppliers and products becoming operational necessity.",
      "End-to-end traceability and collaborative quality management supporting sustainability compliance and carbon reduction goals."
    ],
    link: "https://www.assemblymag.com/articles/99737-automotive-industry-prepares-for-connected-and-circular-economy"
  },
  {
    category: "Sustainability & Green Supply Chain",
    label: "ESG Trends",
    title: "4 trends that will shape ESG in 2026",
    date: "2026-01-09",
    bullets: [
      "2026 holds further regulatory changes and growing disclosure landscape as companies navigate sustainability reporting requirements.",
      "Automotive sector facing increased pressure on carbon reporting, supply chain emissions, and circular economy benchmarks.",
      "Companies balancing ESG commitments with economic pressures; focus shifting from announcements to measurable implementation."
    ],
    link: "https://www.esgdive.com/news/esg-trends-outlook-2026/809129/"
  }
];

export const CATEGORIES = [
  "Tariff Regulations & Trade Policies",
  "Logistics & Transportation",
  "Materials Pricing",
  "Supply Chain Risk Management",
  "Supplier Relationship Management",
  "Sustainability & Green Supply Chain"
];

export const CATEGORY_COLORS: Record<string, string> = {
  "Tariff Regulations & Trade Policies": "sapphire",
  "Logistics & Transportation": "sky",
  "Materials Pricing": "amber",
  "Supply Chain Risk Management": "rose",
  "Supplier Relationship Management": "violet",
  "Sustainability & Green Supply Chain": "emerald"
};

export const SO_WHAT_INSIGHTS: Record<string, string[]> = {
  "Tariff Regulations & Trade Policies": [
    "<strong>Model multiple tariff scenarios:</strong> Build flexible sourcing strategies and maintain optionality across North American, European, and Asian supply bases.",
    "<strong>Monitor USMCA renegotiation:</strong> 2026 review could reshape automotive trade landscape; prepare for potential changes to rules of origin and content requirements.",
    "<strong>Assess Mexico tariff impact:</strong> New 50% tariffs on vehicles and 15-35% on parts from non-FTA countries affect China, Brazil, South Korea, and India sourcing."
  ],
  "Logistics & Transportation": [
    "<strong>Prepare for capacity constraints:</strong> Anticipated demand resurgence in late 2026 will test logistics capacity; secure carrier relationships and expedite playbooks.",
    "<strong>Diversify routing and modes:</strong> Use control-tower visibility and maintain pre-approved alternatives for constrained lanes and ports.",
    "<strong>Monitor chip supply disruptions:</strong> Nexperia legal disputes and DRAM shortages affecting production; build buffer inventory where feasible."
  ],
  "Materials Pricing": [
    "<strong>Strengthen commodity governance:</strong> Lithium prices up 167% from 2025 low; implement index-linked pricing, re-opener clauses, and hedging guidance.",
    "<strong>Monitor aluminum and metals:</strong> Aluminum costs up 40% since June 2025; tariffs and infrastructure demand creating structural deficit.",
    "<strong>Plan for battery material volatility:</strong> Energy storage demand driving lithium carbonate market tightening; secure long-term supply agreements."
  ],
  "Supply Chain Risk Management": [
    "<strong>Harden cybersecurity requirements:</strong> 2,526 cyber incidents documented in 2025; implement continuous vulnerability detection and multi-factor authentication.",
    "<strong>Map tier-n suppliers:</strong> Chip shortages and cyberattacks highlighting supplier concentration risk; diversify critical component sources.",
    "<strong>Prepare for AI-driven threats:</strong> Manufacturers adopting AI and cloud systems creating new attack surfaces; ensure security hardening before deployment."
  ],
  "Supplier Relationship Management": [
    "<strong>Embrace partnership models:</strong> Traditional OEM-supplier relationships evolving; leverage AI and collaborative platforms to drive innovation.",
    "<strong>Join open-source initiatives:</strong> 30+ companies collaborating on open-source software to cut development costs by 40% and time-to-market by 30%.",
    "<strong>Monitor M&A activity:</strong> Supplier consolidation accelerating in response to rising costs and margin pressure; assess portfolio optimization opportunities."
  ],
  "Sustainability & Green Supply Chain": [
    "<strong>Build circular supply chains:</strong> Battery recycling and material recovery essential for reducing dependence on primary mining and overseas imports.",
    "<strong>Implement CO₂ tracking:</strong> Standardized, auditable carbon tracking across suppliers becoming operational necessity for compliance and customer requirements.",
    "<strong>Prepare for ESG disclosure:</strong> Growing regulatory landscape requiring measurable implementation beyond announcements; focus on supply chain emissions."
  ]
};
