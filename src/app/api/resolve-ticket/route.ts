import { NextRequest, NextResponse } from "next/server";
import { redisGet, redisSet } from "@/lib/redis";
import type { TicketState } from "@/data/freshness-tasks";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ticketId, answer } = body as { ticketId: string; answer: string };

    if (!ticketId || !answer?.trim()) {
      return NextResponse.json({ error: "ticketId and answer are required" }, { status: 400 });
    }

    const state: TicketState = {
      status: "answered",
      answer: answer.trim(),
      answeredAt: new Date().toISOString(),
      appliedAt: null,
    };

    await redisSet(`ticket:${ticketId}`, state);

    return NextResponse.json({ ok: true, ticketId, answer: answer.trim() });
  } catch {
    return NextResponse.json({ error: "invalid request body" }, { status: 400 });
  }
}
