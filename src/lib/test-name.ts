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
  const num = rawName.match(/\d+/)?.[0] || "";
  const keyMap: Record<string, string> = {
    listening: "tests.listeningTestName",
    reading: "tests.readingTestName",
    speaking: "tests.speakingTestName",
    writing: "tests.writingTestName",
  };
  const key = keyMap[type];
  if (key && num) {
    return t(key, { num });
  }
  return rawName;
}
