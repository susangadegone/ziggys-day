// Writes decisions.jsonl from the scripted fallback, so Bruin has data without
// clicking through the film. Overwrites the file. Run with: npm run export-log
import { writeFileSync } from "fs";
import { join } from "path";
import { BEATS } from "../lib/script";
import { entryFromBeat, toJsonl } from "../lib/log";

const entries = BEATS.map((b) => entryFromBeat(b, "scripted"));
const file = join(process.cwd(), "decisions.jsonl");
writeFileSync(file, toJsonl(entries));
console.log(`Wrote ${entries.length} rows to ${file}`);
