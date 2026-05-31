/**
 * NewsCard Component - Executive Dashboard Elegance Design
 * Glass-morphism card with smooth hover interactions
 */

import { ExternalLink } from "lucide-react";
import type { NewsArticle } from "@/data/newsData";

interface NewsCardProps {
  article: NewsArticle;
  index: number;
}

export default function NewsCard({ article, index }: NewsCardProps) {
  return (
    <div
      className="glass-card rounded-xl p-6 h-full flex flex-col transition-all duration-300 hover:scale-[1.02] hover:shadow-xl animate-fade-in-up"
      style={{
        animationDelay: `${index * 50}ms`,
      }}
    >
      {/* Label */}
      <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
        {article.label}
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-foreground leading-tight mb-2 line-clamp-3">
        {article.title}
      </h3>

      {/* Date */}
      <div className="text-sm text-muted-foreground font-mono mb-4">
        {article.date}
      </div>

      {/* Bullets */}
      <ul className="space-y-2 mb-4 flex-grow text-sm text-foreground/90 leading-relaxed">
        {article.bullets.map((bullet, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className="text-primary mt-1.5 flex-shrink-0">•</span>
            <span>{bullet}</span>
          </li>
        ))}
      </ul>

      {/* Read More Link */}
      <a
        href={article.link}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all duration-200 group"
      >
        <span>Read more</span>
        <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
      </a>
    </div>
  );
}
