// Unique group names from past matches (like "Los del martes"), most recently
// played first. Names that differ only in upper/lower case count as the same group.
export function recentGroups(matches) {
  const sorted = [...matches].sort((a, b) => b.date.localeCompare(a.date));
  const seen = new Set();
  const names = [];
  for (const match of sorted) {
    if (!match.group) continue;
    const key = match.group.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      names.push(match.group);
    }
  }
  return names;
}
