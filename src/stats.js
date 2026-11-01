export function computeStats(matches) {
  const played = matches.length;
  const count = (result) => matches.filter((m) => m.result === result).length;
  const wins = count('win');
  // Matches without recorded goals don't count as 0: they're left out of goal stats.
  const withGoals = matches.filter((m) => m.goals !== null);
  const goals = withGoals.reduce((sum, m) => sum + m.goals, 0);

  return {
    played,
    wins,
    draws: count('draw'),
    losses: count('loss'),
    goals,
    winRate: played ? Math.round((wins / played) * 100) : 0,
    goalsPerMatch: withGoals.length ? (goals / withGoals.length).toFixed(1) : '–',
    bestMatch: bestGoalsMatch(matches),
    winStreak: longestWinStreak(matches),
  };
}

// The match with the most recorded goals (the earliest saved one if tied),
// or null when no match has goals recorded.
export function bestGoalsMatch(matches) {
  return matches.reduce(
    (best, m) => (m.goals !== null && (!best || m.goals > best.goals) ? m : best),
    null,
  );
}

// Longest run of wins in a row, in the order the matches were played.
function longestWinStreak(matches) {
  const byDate = [...matches].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  let best = 0;
  let current = 0;
  for (const match of byDate) {
    current = match.result === 'win' ? current + 1 : 0;
    best = Math.max(best, current);
  }
  return best;
}
