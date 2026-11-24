import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Appends one finished run to decisions.jsonl in the project root, so Bruin
// can compare runs. Local dev only: a hosted filesystem is read-only, so this
// simply returns an error there.
export async function POST(req: Request) {
  try {
    const entries: unknown[] = await req.json();
    const lines = entries.map((e) => JSON.stringify(e)).join("\n") + "\n";
    await fs.appendFile(path.join(process.cwd(), "decisions.jsonl"), lines);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
