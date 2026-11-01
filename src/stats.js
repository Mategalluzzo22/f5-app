export function computeStats(matches) {
  const played = matches.length;
  const count = (result) => matches.filter((m) => m.result === result).length;
  const wins = count('win');
  const goals = matches.reduce((sum, m) => sum + m.goals, 0);

  return {
    played,
    wins,
    draws: count('draw'),
    losses: count('loss'),
    goals,
    winRate: played ? Math.round((wins / played) * 100) : 0,
    goalsPerMatch: played ? (goals / played).toFixed(1) : '0.0',
    bestMatch: bestGoalsMatch(matches),
    winStreak: longestWinStreak(matches),
  };
}

// The match with the most goals (the earliest saved one if tied), or null with no matches.
export function bestGoalsMatch(matches) {
  return matches.reduce((best, m) => (!best || m.goals > best.goals ? m : best), null);
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
