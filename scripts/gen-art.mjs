// Generates the film's artwork into public/art with Gemini image models.
// Uses OPENAI_API_KEY from .env.local if set (gpt-image-1), otherwise
// GEMINI_API_KEY (image models need a paid Gemini plan). Existing files are skipped.
//   node scripts/gen-art.mjs              -> make any missing images
//   node scripts/gen-art.mjs ziggy rob  -> (re)make just these
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const root = process.cwd();
const env = Object.fromEntries(
  readFileSync(join(root, ".env.local"), "utf8")
    .split("\n")
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).trim()]),
);
const KEY = env.GEMINI_API_KEY;
const OPENAI_KEY = env.OPENAI_API_KEY;
if (!KEY && !OPENAI_KEY) throw new Error("No OPENAI_API_KEY or GEMINI_API_KEY in .env.local");
const OPENAI_SIZES = { "16:9": "1536x1024", "3:4": "1024x1536", "1:1": "1024x1024" };

async function generateOpenAI(name, { prompt, ratio }) {
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_KEY}` },
    body: JSON.stringify({ model: env.OPENAI_IMAGE_MODEL || "gpt-image-1", prompt, size: OPENAI_SIZES[ratio], n: 1 }),
    signal: AbortSignal.timeout(180000),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`${res.status} ${data?.error?.message ?? ""}`.slice(0, 160));
  writeFileSync(join(root, "public/art", `${name}.png`), Buffer.from(data.data[0].b64_json, "base64"));
  console.log(`✓ ${name}.png (openai)`);
}

const MODELS = ["gemini-3.1-flash-image", "gemini-3-pro-image", "gemini-2.5-flash-image"];
const STYLE =
  "3D animated family-film style: soft rounded shapes, warm cinematic lighting, expressive friendly faces, high quality render.";
const CUTOUT = "Full body, centered, facing the viewer, on a plain pure white background, no shadow on the ground, nothing else in frame.";

const ART = {
  "living-room": {
    ratio: "16:9",
    prompt: `${STYLE} A cozy, sunlit modern living room seen straight on, like a stage set: a sofa against the back wall, a window with a view of trees, a rug, a dog bed, a small desk with a laptop. Empty of people and animals. The lower third is open floor so characters can stand in front.`,
  },
  angie: {
    ratio: "3:4",
    prompt: `${STYLE} Angie, an upbeat woman in her early 30s ready for an adventure: sneakers, a light rain jacket, a dog leash in one hand and a color-coded planner in the other, big excited smile. ${CUTOUT}`,
  },
  rob: {
    ratio: "3:4",
    prompt: `${STYLE} Rob, a calm, slightly tired man in his early 30s who works from home: hoodie, slippers, holding a laptop and a coffee mug, wry patient expression. ${CUTOUT}`,
  },
  ziggy: {
    ratio: "1:1",
    prompt: `${STYLE} Ziggy, a scruffy medium-sized golden-brown mixed-breed dog with darker floppy ears, sitting, nose slightly raised as if smelling something wonderful, dignified and a little regal. ${CUTOUT}`,
  },
};

async function generate(name, spec) {
  const { prompt, ratio } = spec;
  if (OPENAI_KEY) {
    try {
      return await generateOpenAI(name, spec);
    } catch (e) {
      console.log(`  ${name}: openai failed: ${e.message}`);
      if (!KEY) return console.log(`✗ ${name}.png not made`);
    }
  }
  for (const model of MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": KEY },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio: ratio } },
          }),
          signal: AbortSignal.timeout(120000),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(`${res.status} ${data?.error?.message ?? ""}`.slice(0, 160));
      const part = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
      if (!part) throw new Error("no image in response");
      const file = join(root, "public/art", `${name}.png`);
      writeFileSync(file, Buffer.from(part.inlineData.data, "base64"));
      console.log(`✓ ${name}.png (${model})`);
      return;
    } catch (e) {
      console.log(`  ${name}: ${model} failed: ${e.message}`);
    }
  }
  console.log(`✗ ${name}.png not made`);
}

const only = process.argv.slice(2);
for (const [name, spec] of Object.entries(ART)) {
  if (only.length ? !only.includes(name) : existsSync(join(root, "public/art", `${name}.png`))) continue;
  await generate(name, spec);
}
