/**
 * Ticket definitions for manual-verification questions.
 *
 * These are static definitions built at SSG time. Ticket state
 * (status: pending/answered/applied, answer text) is stored in
 * Vercel KV under key `ticket:{id}`.
 *
 * Agent writes ticket definitions here when it needs help.
 * User answers at /admin/tickets → POST /api/resolve-ticket → KV.
 * Agent reads KV on next run, applies resolutions, marks applied.
 */

export interface FreshnessTicket {
  id: string;
  type: "slug-mismatch" | "team-change" | "retired-pro" | "free-agent";
  slug: string;
  label: string;
  question: string;
  context: {
    esport?: string;
    storedTeam?: string;
    liquipediaTeam?: string | null;
    liquipediaStatus?: string | null;
    liquipediaUrl?: string;
    sourceUrl?: string;
    instructions: string;
  };
  createdAt: string;
}

export interface TicketState {
  status: "pending" | "answered" | "applied";
  answer: string | null;
  answeredAt: string | null;
  appliedAt: string | null;
}

export const freshnessTickets: FreshnessTicket[] = [
  {
    id: "cned-slug-mismatch-2026-07-23",
    type: "slug-mismatch",
    slug: "cned",
    label: "cned — Liquipedia returned 404 for page \"Cned\"",
    question: "What is the correct Liquipedia Valorant page title for cned? The slug \"Cned\" returned a 404.",
    context: {
      esport: "valorant",
      storedTeam: "PCIFIC Esports",
      liquipediaUrl: "https://liquipedia.net/valorant/?search=cned",
      instructions: "Search Liquipedia for cned, find the correct page title, then tell the agent: \"resolve cned-slug-mismatch — the correct page is {title}\"",
    },
    createdAt: "2026-07-23",
  },
];
