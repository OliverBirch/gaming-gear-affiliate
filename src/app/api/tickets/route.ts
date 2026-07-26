import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { freshnessTickets } from "@/data/freshness-tasks";
import type { TicketState } from "@/data/freshness-tasks";

/** In-memory fallback when Vercel KV isn't configured (dev mode). */
const fallbackStore = new Map<string, TicketState>();

const DEFAULT_STATE: TicketState = {
  status: "pending",
  answer: null,
  answeredAt: null,
  appliedAt: null,
};

async function getState(ticketId: string): Promise<TicketState> {
  try {
    const existing = await kv.get<TicketState>(`ticket:${ticketId}`);
    return existing ?? { ...DEFAULT_STATE };
  } catch {
    return fallbackStore.get(ticketId) ?? { ...DEFAULT_STATE };
  }
}

export async function GET() {
  const states: Record<string, TicketState> = {};
  for (const ticket of freshnessTickets) {
    states[ticket.id] = await getState(ticket.id);
  }
  return NextResponse.json(states);
}
