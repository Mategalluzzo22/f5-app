// Unique opponent names from past matches, most recently played first.
// Names that differ only in upper/lower case count as the same rival.
export function recentOpponents(matches) {
  const sorted = [...matches].sort((a, b) => b.date.localeCompare(a.date));
  const seen = new Set();
  const names = [];
  for (const match of sorted) {
    const key = match.opponent.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      names.push(match.opponent);
    }
  }
  return names;
}
