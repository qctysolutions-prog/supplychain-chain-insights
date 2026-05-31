/**
 * CategorySection Component
 * Displays news articles for a category with "So What?" insights
 */

import NewsCard from "./NewsCard";
import CategoryFeedback from "./CategoryFeedback";
import type { NewsArticle } from "@/data/newsData";
import { SO_WHAT_INSIGHTS } from "@/data/newsData";

interface CategorySectionProps {
  category: string;
  articles: NewsArticle[];
  index: number;
}

export default function CategorySection({ category, articles, index }: CategorySectionProps) {
  const insights = SO_WHAT_INSIGHTS[category] || [];

  return (
    <section id={`category-${index + 1}`} className="mb-16 animate-fade-in-up scroll-mt-24" style={{ animationDelay: `${index * 100}ms` }}>
      {/* Category Header */}
      <div className="mb-6 pb-4 border-b border-border">
        <h2 className="text-2xl font-bold text-foreground tracking-tight">
          <span className="text-muted-foreground mr-3">{index + 1}.</span>
          {category}
        </h2>
      </div>

      {/* News Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {articles.map((article, idx) => (
          <NewsCard key={idx} article={article} index={idx} />
        ))}
      </div>

      {/* So What? Insights */}
      <div className="glass-card rounded-xl p-6 border-l-4 border-l-primary/50 bg-primary/5">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">
          So What? — {category}
        </h3>
        <ul className="space-y-3 text-sm text-foreground/90 leading-relaxed">
          {insights.map((insight, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <span className="text-primary mt-1 flex-shrink-0">→</span>
              <span dangerouslySetInnerHTML={{ __html: insight }} />
            </li>
          ))}
        </ul>
      </div>

      {/* Feedback Section */}
      <CategoryFeedback category={category} />
    </section>
  );
}
