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
  };
}
