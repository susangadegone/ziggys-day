// Writes decisions.jsonl from the script, so Bruin has data without clicking
// through the film. Run with: npm run export-log
import { writeFileSync } from "fs";
import { join } from "path";
import { BEATS, SCRIPT } from "../lib/script";
import { entryFromBeat, toJsonl } from "../lib/log";

const entries = BEATS.map((b) => entryFromBeat(b, SCRIPT[b.turnIndex].consensus));
const file = join(process.cwd(), "decisions.jsonl");
writeFileSync(file, toJsonl(entries));
console.log(`Wrote ${entries.length} rows to ${file}`);
