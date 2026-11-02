import { monthSummary, shiftMonth } from './monthly';
import { computeStats } from './stats';

// Data for the "Tus gráficos" screen (Pro). Matches are seen from your side.

function byDate(matches) {
  return [...matches].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
}

// Matches and goals in each of the `count` months ending at endKey ('YYYY-MM'),
// oldest first.
export function monthlySeries(matches, endKey, count = 12) {
  return Array.from({ length: count }, (_, i) => {
    const key = shiftMonth(endKey, i - count + 1);
    const { played, goals } = monthSummary(matches, key);
    return { key, played, goals };
  });
}

// Your overall win rate after each match, in the order you played them.
export function winRateTrend(matches) {
  let wins = 0;
  return byDate(matches).map((match, i) => {
    if (match.result === 'win') wins += 1;
    return { id: match.id, rate: Math.round((wins / (i + 1)) * 100) };
  });
}

// Your goals in your last `count` matches, oldest first (null = not recorded).
export function lastGoals(matches, count = 10) {
  return byDate(matches)
    .slice(-count)
    .map((match) => ({ id: match.id, date: match.date, goals: match.goals }));
}

// How you do in each format you played (F5, F7, F8, F11), smallest first.
export function formatStats(matches) {
  const formats = [...new Set(matches.map((m) => m.format))].sort((a, b) => a - b);
  return formats.map((format) => ({ format, ...computeStats(matches.filter((m) => m.format === format)) }));
}
