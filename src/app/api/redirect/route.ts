import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, context: { params?: Promise<{ id?: string }> }) {
  const url = new URL(request.url);
  const redirectPath = url.searchParams.get("url") || url.pathname;

  return NextResponse.redirect(redirectPath, {
    status: 302,
    headers: {
      "cache-control": "no-store",
    },
  });
}
