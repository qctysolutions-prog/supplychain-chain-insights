/**
 * Lightweight RSS fetching + parsing (no external deps).
 * Used to pull candidate news items from Google News RSS and industry feeds.
 */

export type RssItem = {
  title: string;
  link: string;
  pubDate: Date | null;
  source: string;
  description: string;
};

const FETCH_TIMEOUT_MS = 15000;

function decodeEntities(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)));
}

function stripTags(s: string): string {
  return s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function extractTag(block: string, tag: string): string {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return m ? decodeEntities(m[1].trim()) : "";
}

/** Parse an RSS 2.0 feed body into items. */
export function parseRss(xml: string): RssItem[] {
  const items: RssItem[] = [];
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || [];
  for (const block of blocks) {
    const title = stripTags(extractTag(block, "title"));
    let link = extractTag(block, "link");
    // Some feeds put the URL after the closing tag or inside guid
    if (!link || !/^https?:\/\//i.test(link)) {
      link = extractTag(block, "guid");
    }
    const pubDateRaw = extractTag(block, "pubDate") || extractTag(block, "dc:date");
    const pubDate = pubDateRaw ? new Date(pubDateRaw) : null;
    const source = stripTags(extractTag(block, "source"));
    const description = stripTags(extractTag(block, "description")).slice(0, 500);
    if (title && link) {
      items.push({
        title,
        link,
        pubDate: pubDate && !isNaN(pubDate.getTime()) ? pubDate : null,
        source,
        description,
      });
    }
  }
  return items;
}

/** Fetch a feed URL, returning [] on any failure (robustness first). */
export async function fetchFeed(url: string): Promise<RssItem[]> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "user-agent":
          "Mozilla/5.0 (compatible; OSKInsightsBot/1.0; supply-chain-brief)",
        accept: "application/rss+xml, application/xml, text/xml, */*",
      },
    });
    clearTimeout(timer);
    if (!res.ok) return [];
    const body = await res.text();
    return parseRss(body);
  } catch {
    return [];
  }
}

/** Build a Google News RSS search URL for a query, limited to the last N days. */
export function googleNewsUrl(query: string, days: number): string {
  const q = encodeURIComponent(`${query} when:${days}d`);
  return `https://news.google.com/rss/search?q=${q}&hl=en-US&gl=US&ceid=US:en`;
}
