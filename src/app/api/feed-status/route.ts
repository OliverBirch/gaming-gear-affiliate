import { NextResponse } from "next/server";
import { getFeedCandidates, getFeedRuns } from "@/lib/feed-sync/admin-data";

export async function GET() {
  const [runs, candidates] = await Promise.all([getFeedRuns(), getFeedCandidates()]);
  return NextResponse.json({ runs, candidates });
}
