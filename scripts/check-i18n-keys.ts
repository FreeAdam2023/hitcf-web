/**
 * i18n Key Consistency Checker
 *
 * Compares all locale JSON files and reports missing/extra keys.
 * Usage: npx tsx scripts/check-i18n-keys.ts
 */

import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const MESSAGES_DIR = join(__dirname, "../src/i18n/messages");

function getKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      keys.push(...getKeys(v as Record<string, unknown>, path));
    } else {
      keys.push(path);
    }
  }
  return keys;
}

function main() {
  const files = readdirSync(MESSAGES_DIR).filter((f) => f.endsWith(".json"));
  if (files.length < 2) {
    console.log("Need at least 2 locale files to compare.");
    process.exit(1);
  }

  const locales: Record<string, Set<string>> = {};
  for (const file of files) {
    const locale = file.replace(".json", "");
    const content = JSON.parse(readFileSync(join(MESSAGES_DIR, file), "utf-8"));
    locales[locale] = new Set(getKeys(content));
  }

  const localeNames = Object.keys(locales);
  const reference = localeNames[0];
  const refKeys = locales[reference];

  let hasErrors = false;

  for (const locale of localeNames.slice(1)) {
    const keys = locales[locale];

    const missing = Array.from(refKeys).filter((k) => !keys.has(k));
    const extra = Array.from(keys).filter((k) => !refKeys.has(k));

    if (missing.length > 0) {
      hasErrors = true;
      console.error(`\n[${locale}.json] Missing ${missing.length} keys (present in ${reference}.json):`);
      for (const k of missing) {
        console.error(`  - ${k}`);
      }
    }

    if (extra.length > 0) {
      hasErrors = true;
      console.error(`\n[${locale}.json] Extra ${extra.length} keys (not in ${reference}.json):`);
      for (const k of extra) {
        console.error(`  + ${k}`);
      }
    }

    if (missing.length === 0 && extra.length === 0) {
      console.log(`[${locale}.json] OK — ${keys.size} keys match ${reference}.json`);
    }
  }

  // Also check if non-reference locales differ from each other
  for (let i = 1; i < localeNames.length; i++) {
    for (let j = i + 1; j < localeNames.length; j++) {
      const a = localeNames[i];
      const b = localeNames[j];
      const missingInB = Array.from(locales[a]).filter((k) => !locales[b].has(k));
      const missingInA = Array.from(locales[b]).filter((k) => !locales[a].has(k));
      if (missingInB.length > 0 || missingInA.length > 0) {
        hasErrors = true;
        if (missingInB.length > 0) {
          console.error(`\n[${b}.json] Missing ${missingInB.length} keys (present in ${a}.json):`);
          for (const k of missingInB) console.error(`  - ${k}`);
        }
        if (missingInA.length > 0) {
          console.error(`\n[${a}.json] Missing ${missingInA.length} keys (present in ${b}.json):`);
          for (const k of missingInA) console.error(`  - ${k}`);
        }
      }
    }
  }

  if (hasErrors) {
    console.error("\ni18n key check FAILED — fix the above issues.");
    process.exit(1);
  } else {
    console.log(`\nAll ${localeNames.length} locale files are consistent (${refKeys.size} keys each).`);
  }
}

main();
