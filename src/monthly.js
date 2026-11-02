import { MONTHS } from './dates';

// Month-by-month numbers for the "Tu mes a mes" screen (a Pro feature).
// Months are 'YYYY-MM' keys, taken from the match dates ('YYYY-MM-DD').

export function monthKey(isoDate) {
  return isoDate.slice(0, 7);
}

// '2026-10' -> 'octubre 2026'
export function monthLabel(key) {
  const [year, month] = key.split('-').map(Number);
  return `${MONTHS[month - 1]} ${year}`;
}

// The month before or after: shiftMonth('2026-01', -1) -> '2025-12'
export function shiftMonth(key, delta) {
  const [year, month] = key.split('-').map(Number);
  const index = year * 12 + (month - 1) + delta;
  return `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, '0')}`;
}

// Everything about one month: totals, the days played (with the result of the
// day's first match, to color the calendar) and the groups, most played first.
export function monthSummary(matches, key) {
  const inMonth = matches
    .filter((m) => monthKey(m.date) === key)
    .sort((a, b) => a.date.localeCompare(b.date));
  const withGoals = inMonth.filter((m) => m.goals !== null);

  const days = {};
  for (const match of inMonth) {
    const day = Number(match.date.slice(8, 10));
    if (!days[day]) days[day] = match.result;
  }

  // Same group if the names only differ in upper/lower case, like recentGroups.
  const groups = new Map();
  for (const match of inMonth) {
    if (!match.group) continue;
    const id = match.group.toLowerCase();
    const group = groups.get(id) ?? { name: match.group, played: 0 };
    group.played += 1;
    groups.set(id, group);
  }

  return {
    played: inMonth.length,
    goals: withGoals.reduce((sum, m) => sum + m.goals, 0),
    hasGoals: withGoals.length > 0,
    wins: inMonth.filter((m) => m.result === 'win').length,
    draws: inMonth.filter((m) => m.result === 'draw').length,
    losses: inMonth.filter((m) => m.result === 'loss').length,
    days,
    groups: [...groups.values()].sort((a, b) => b.played - a.played),
  };
}

// The month with the most matches and the one with the most goals. On a tie
// the most recent month wins. null when there is nothing to compare.
export function bestMonths(matches) {
  const totals = new Map();
  for (const match of matches) {
    const key = monthKey(match.date);
    const month = totals.get(key) ?? { key, played: 0, goals: 0 };
    month.played += 1;
    month.goals += match.goals ?? 0;
    totals.set(key, month);
  }
  const months = [...totals.values()].sort((a, b) => b.key.localeCompare(a.key));
  const top = (field) =>
    months.reduce((best, m) => (m[field] > 0 && (!best || m[field] > best[field]) ? m : best), null);
  return { byMatches: top('played'), byGoals: top('goals') };
}

// "En octubre jugaste más con Los del martes (3) que con Fútbol del laburo (1)."
export function groupsSentence(groups, key) {
  const month = MONTHS[Number(key.slice(5, 7)) - 1];
  const times = (n) => `${n} ${n === 1 ? 'vez' : 'veces'}`;
  if (groups.length === 0) return null;
  if (groups.length === 1) {
    return `En ${month} jugaste solo con ${groups[0].name} (${times(groups[0].played)}).`;
  }
  const [first, second] = groups;
  if (first.played === second.played) {
    return `En ${month} jugaste lo mismo con ${first.name} que con ${second.name} (${times(first.played)}).`;
  }
  return `En ${month} jugaste más con ${first.name} (${times(first.played)}) que con ${second.name} (${times(second.played)}).`;
}
