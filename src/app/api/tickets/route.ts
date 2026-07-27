import { NextResponse } from "next/server";
import { redisGet } from "@/lib/redis";
import { freshnessTickets } from "@/data/freshness-tasks";
import type { TicketState } from "@/data/freshness-tasks";

const DEFAULT_STATE: TicketState = {
  status: "pending",
  answer: null,
  answeredAt: null,
  appliedAt: null,
};

async function getState(ticketId: string): Promise<TicketState> {
  const existing = await redisGet<TicketState>(`ticket:${ticketId}`);
  return existing ?? { ...DEFAULT_STATE };
}

export async function GET() {
  const states: Record<string, TicketState> = {};
  for (const ticket of freshnessTickets) {
    states[ticket.id] = await getState(ticket.id);
  }
  return NextResponse.json(states);
}
