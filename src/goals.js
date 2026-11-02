// Personal goals for the year (Pro): "30 goles" or "40 partidos" this year.
// targets is { goals, matches }; 0 means no goal for that one.

export const GOAL_STEP = 5;

export function goalProgress(matches, targets, year) {
  const inYear = matches.filter((m) => m.date.startsWith(year));
  const current = {
    goals: inYear.reduce((sum, m) => sum + (m.goals ?? 0), 0),
    matches: inYear.length,
  };
  return ['goals', 'matches']
    .filter((kind) => targets[kind] > 0)
    .map((kind) => {
      const target = targets[kind];
      return {
        kind,
        target,
        current: current[kind],
        percent: Math.min(100, Math.round((current[kind] / target) * 100)),
        done: current[kind] >= target,
        remaining: Math.max(0, target - current[kind]),
      };
    });
}

// Saved goals only count for the year they were set in.
export function goalsForYear(saved, year) {
  if (!saved || saved.year !== year) return { goals: 0, matches: 0 };
  return { goals: saved.goals ?? 0, matches: saved.matches ?? 0 };
}
