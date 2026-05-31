/**
 * Home Page - Mobility & Auto Supply Chain Brief
 * Executive Dashboard Elegance Design
 */

import { Calendar, TrendingUp, AlertCircle, Loader2, DollarSign, ChevronDown, MessageSquare } from "lucide-react";

import { useState } from "react";
import CategorySection from "@/components/CategorySection";
import { CATEGORIES, SO_WHAT_INSIGHTS } from "@/data/newsData";
import { trpc } from "@/lib/trpc";

export default function Home() {
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [dashboardDropdownOpen, setDashboardDropdownOpen] = useState(false);
  const { data: newsArticles, isLoading, error } = trpc.news.getAll.useQuery();

  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 13);

  const weekOfLabel = today.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const dateRangeLabel = `${startDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })} - ${today.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;

  // Group articles by category
  const articlesByCategory = CATEGORIES.map((category) => ({
    category,
    articles: (newsArticles || []).filter((article) => article.category === category),
  }));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Loading supply chain brief...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <p className="text-lg text-foreground mb-2">Failed to load news articles</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-16 shadow-2xl">
        <div className="container">
          <div className="text-center space-y-4">
            <div className="text-sm uppercase tracking-widest text-slate-300 font-medium">
              Mobility & Auto Supply Chain Brief
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Mobility & Auto Supply Chain Brief: Materials, Policy, Risk
            </h1>
            <div className="text-lg text-slate-300 flex items-center justify-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>Week of {weekOfLabel}</span>
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              {/* Jump to Category Dropdown */}
              <div className="relative w-full sm:w-auto">
                <button 
                  onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl"
                >                <TrendingUp className="w-5 h-5" />
                  Jump to Category
                  <ChevronDown className="w-4 h-4" />
                </button>
                {categoryDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl z-50">
                    <div className="py-2">
                      {CATEGORIES.map((category, index) => (
                        <a
                          key={category}
                          href={`#category-${index + 1}`}
                          onClick={() => setCategoryDropdownOpen(false)}
                          className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          {index + 1}. {category}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Supply Chain Dashboard Dropdown */}
              <div className="relative w-full sm:w-auto">
                <button 
                  onClick={() => setDashboardDropdownOpen(!dashboardDropdownOpen)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl"
                >
                  <TrendingUp className="w-5 h-5" />
                  Supply Chain Dashboard
                  <ChevronDown className="w-4 h-4" />
                </button>
                {dashboardDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-xl z-50">
                    <div className="py-2">
                      <a
                        href="/dashboard/tariff-policy"
                        onClick={() => setDashboardDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        Tariff/Policy Risk (Leading)
                      </a>
                      <a
                        href="/dashboard/landed-cost"
                        onClick={() => setDashboardDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        Landed-cost Reality Check (Lagging)
                      </a>
                      <a
                        href="/dashboard/materials"
                        onClick={() => setDashboardDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        Materials (Direct)
                      </a>
                      <a
                        href="/dashboard/logistics"
                        onClick={() => setDashboardDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        Logistics (Surcharges)
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Aluminum Pricing Index */}
              <a href="/aluminum-pricing" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl">
                  <DollarSign className="w-5 h-5" />
                  Aluminum Pricing Index
                </button>
              </a>

              {/* ChatGPT Link */}
              <a
                href="https://chatgpt.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl"
              >
                <MessageSquare className="w-5 h-5" />
                Ask ChatGPT
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        {/* Introduction */}
        <div className="glass-card rounded-xl p-8 mb-12 border-l-4 border-l-primary shadow-lg">
          <div className="flex items-start gap-4">
            <TrendingUp className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <p className="text-base leading-relaxed text-foreground">
                Fresh developments from the last 14 days ({dateRangeLabel}) across policy,
                logistics, materials, risk, supplier relationships, and sustainability — all links
                below were published in the last 14 days and are relevant to mobility technology
                &amp; automotive manufacturing. All news sources have been verified for
                accessibility.
              </p>
            </div>
          </div>
        </div>

        {/* Category Sections */}
        {articlesByCategory.map((item, index) => (
          <CategorySection
            key={item.category}
            category={item.category}
            articles={item.articles}
            index={index}
          />
        ))}

        {/* Cross-Cutting Strategic Takeaways */}
        <section className="glass-card rounded-xl p-8 border border-border shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <AlertCircle className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">
              Cross-Cutting Strategic Takeaways
            </h2>
          </div>
          <ul className="space-y-4 text-sm text-foreground/90 leading-relaxed">
            <li className="flex items-start gap-3">
              <span className="text-primary mt-1 flex-shrink-0">→</span>
              <span>
                <strong>Tariff volatility is the new normal:</strong> Build flexible sourcing
                strategies, model multiple tariff scenarios, and maintain optionality across North
                American, European, and Asian supply bases.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary mt-1 flex-shrink-0">→</span>
              <span>
                <strong>Logistics variability remains a production risk:</strong> Use control-tower
                visibility, diversify routing, and maintain pre-approved expedite playbooks for
                constrained lanes and ports.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary mt-1 flex-shrink-0">→</span>
              <span>
                <strong>Commodity exposure needs governance:</strong> Strengthen index-linked
                pricing, re-opener clauses, and hedging guidance across steel, aluminum, copper,
                lithium, and battery materials.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary mt-1 flex-shrink-0">→</span>
              <span>
                <strong>Cyber, geopolitical and chip risks are converging:</strong> Map tier-n
                suppliers, harden cybersecurity requirements, and diversify critical component
                sources for high-value components.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary mt-1 flex-shrink-0">→</span>
              <span>
                <strong>Sustainability is now a supply-chain input:</strong> Carbon border policies
                and low-carbon materials partnerships make traceability and emissions data
                operational necessities.
              </span>
            </li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 mt-16">
        <div className="container text-center text-sm">
          <p>
            Coverage: {dateRangeLabel} • {newsArticles?.length || 0} verified articles • All
            sources accessible and within 14 days
          </p>
          <div className="mt-3">
            <a
              href="/admin"
              className="text-slate-600 hover:text-slate-400 text-xs transition-colors"
            >
              Admin
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
