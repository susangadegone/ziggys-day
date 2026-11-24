import { NextResponse } from "next/server";
import { callJson, provider } from "@/lib/llm";
import { FINAL_SYSTEM, transcript, type SpokenLine } from "@/lib/personas";

export const dynamic = "force-dynamic";

// GET: is a live model available?
export async function GET() {
  return NextResponse.json({ live: provider() !== null, provider: provider() });
}

// POST: summarize the decision the agents reached.
export async function POST(req: Request) {
  const { twist, history } = (await req.json()) as { twist: string; history: SpokenLine[] };
  try {
    const r = await callJson<{ plan: string; timeline: { time: string; what: string }[]; winner: string; why: string }>(
      FINAL_SYSTEM,
      `Opening event: ${twist}\n\nWhat happened:\n${transcript(history)}`,
    );
    return NextResponse.json(r);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
