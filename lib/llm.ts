// Server-only. Calls whichever model has a key in .env.local:
// GEMINI_API_KEY (preferred) or OPENAI_API_KEY. Returns parsed JSON.

export type Provider = "gemini" | "openai" | null;

export function provider(): Provider {
  if (process.env.GEMINI_API_KEY) return "gemini";
  if (process.env.OPENAI_API_KEY) return "openai";
  return null;
}

export async function callJson<T>(system: string, user: string): Promise<T> {
  const p = provider();
  if (!p) throw new Error("No GEMINI_API_KEY or OPENAI_API_KEY in .env.local");
  // Busy, rate-limited or slow? Move on to the next model in the list.
  const attempts =
    p === "gemini"
      ? [process.env.GEMINI_MODEL, ...GEMINI_FALLBACKS].filter((m): m is string => !!m)
      : [process.env.OPENAI_MODEL || "gpt-4o-mini", process.env.OPENAI_MODEL || "gpt-4o-mini"];
  let last: Error = new Error("unknown");
  for (const model of attempts) {
    try {
      return parse<T>(p === "gemini" ? await gemini(model, system, user) : await openai(model, system, user));
    } catch (e) {
      last = e as Error;
      // Only a bad key/request is worth stopping for; anything else, try the next model.
      const retryable = !/ (400|401|403):/.test(last.message);
      if (!retryable) break;
    }
  }
  throw last;
}

function parse<T>(raw: string): T {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  return JSON.parse(raw.slice(start, end + 1)) as T;
}

// Tried in order. Lite models answer fastest when the big ones are overloaded.
const GEMINI_FALLBACKS = ["gemini-3.8-flash", "gemini-3.5-flash", "gemini-flash-lite-latest", "gemini-3.1-flash-lite", "gemini-3.8-flash"];
const TIMEOUT_MS = 10000;

async function gemini(model: string, system: string, user: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY!,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: user }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 1.0 },
      }),
    },
  );
  const data = await res.json();
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${data?.error?.message ?? "error"}`);
  return data.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
}

async function openai(model: string, system: string, user: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${data?.error?.message ?? "error"}`);
  return data.choices?.[0]?.message?.content ?? "";
}
