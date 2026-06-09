import type { MatchData } from "@/lib/types";

export const SITE_URL = "https://myteampredictions.com";

/**
 * Renders a JSON-LD <script>. Escapes "<" so a stray "</script>" or "<" inside
 * the data can't break out of the script context (XSS-safe).
 */
export function JsonLd({ data }: { data: object }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

/** Site-wide WebSite schema (rendered globally in the root layout). */
export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "MyTeamPredictions",
  url: SITE_URL,
  description: "Predict every match at the 2026 FIFA World Cup.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

/**
 * Builds a SportsEvent schema from a match. Driven by the same data rendered on
 * the page so the structured data always matches the visible content.
 */
export function sportsEventSchema(match: MatchData) {
  const event: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: `${match.team1} vs ${match.team2}`,
    startDate: match.matchDate,
    sport: "Soccer",
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    homeTeam: { "@type": "SportsTeam", name: match.team1 },
    awayTeam: { "@type": "SportsTeam", name: match.team2 },
    organizer: {
      "@type": "Organization",
      name: "FIFA",
      url: "https://www.fifa.com",
    },
  };
  if (match.venue) {
    event.location = { "@type": "Place", name: match.venue };
  }
  return event;
}

/** Builds a BreadcrumbList schema from an ordered list of {name, path}. */
export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
