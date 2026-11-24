import { NextResponse } from "next/server";
import { callJson } from "@/lib/llm";
import { systemPrompt, userPrompt, type SpokenLine } from "@/lib/personas";
import { asPlace } from "@/lib/world";
import { ADULT_ACTIONS, DOG_ACTIONS, type Action, type AgentId } from "@/lib/script";

export const dynamic = "force-dynamic";

interface Reply {
  text: string;
  stance: string;
  agreement: number;
  action: string;
  place: string;
}

// One agent takes one turn. Each call only knows that agent's goal and what
// has been said/done, so the agents genuinely negotiate with each other.
export async function POST(req: Request) {
  const { agent, twist, turn, history } = (await req.json()) as {
    agent: AgentId;
    twist: string;
    turn: number;
    history: SpokenLine[];
  };
  try {
    const r = await callJson<Reply>(systemPrompt(agent), userPrompt(agent, twist, turn, history));
    const allowed: readonly string[] = agent === "ziggy" ? DOG_ACTIONS : ADULT_ACTIONS;
    const action = (allowed.includes(r.action) ? r.action : allowed[0]) as Action;
    return NextResponse.json({
      text: String(r.text ?? "…"),
      stance: String(r.stance ?? "").slice(0, 60),
      agreement: Math.max(0, Math.min(1, Number(r.agreement) || 0)),
      action,
      place: asPlace(r.place),
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
