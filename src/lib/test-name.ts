/**
 * Generate a localized test name from type + raw name.
 * Extracts the number from the raw DB name (e.g. "听力测试 37" → 37)
 * and returns a translated string like "Listening Test 37".
 *
 * @param t - next-intl translation function
 * @param type - "listening" | "reading" | "speaking" | "writing"
 * @param rawName - the raw name from the database
 */
export function localizeTestName(
  t: (key: string, values?: Record<string, string | number>) => string,
  type: string,
  rawName: string,
): string {
  // Only localize standard names like "阅读测试 1" / "Compréhension Écrite test 01"
  // Non-standard names (补充测试, 免费测试, etc.) are returned as-is
  const standardPattern = /^(?:听力测试|阅读测试|口语测试|写作测试|Compréhension\s+(?:Orale|Écrite)\s+test|Expression\s+(?:Orale|Écrite)\s+test)\s*(\d+)$/i;
  const match = rawName.match(standardPattern);
  if (match) {
    const num = match[1];
    const keyMap: Record<string, string> = {
      listening: "tests.listeningTestName",
      reading: "tests.readingTestName",
      speaking: "tests.speakingTestName",
      writing: "tests.writingTestName",
    };
    const key = keyMap[type];
    if (key) {
      return t(key, { num });
    }
  }
  return rawName;
}
