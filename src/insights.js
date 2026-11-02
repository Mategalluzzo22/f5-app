import { bestMonths, monthKey } from './monthly';
import { computeStats } from './stats';

// Numbers for your current form (free) and the Pro features: stats per group
// and the year in review. All take matches as seen from your side (see playerView).

function byDate(matches) {
  return [...matches].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
}

// Your last results (oldest first) and the streak you're on right now: wins in
// a row, or matches in a row without winning.
export function recentForm(matches, count = 5) {
  const sorted = byDate(matches);
  const last = sorted.slice(-count).map((m) => m.result);
  if (sorted.length === 0) return { last, streak: null };

  const winning = sorted[sorted.length - 1].result === 'win';
  let streak = 0;
  for (let i = sorted.length - 1; i >= 0 && (sorted[i].result === 'win') === winning; i--) streak++;
  return { last, streak: { winning, count: streak } };
}

export function formSentence(streak) {
  if (!streak) return null;
  if (streak.count === 1) return streak.winning ? 'Ganaste tu último partido' : 'No ganaste tu último partido';
  return streak.winning
    ? `Llevás ${streak.count} partidos ganando 🔥`
    : `Llevás ${streak.count} partidos sin ganar`;
}

// One entry per group (names that only differ in upper/lower case are the same
// group, shown with their latest spelling), most played first.
export function groupStats(matches) {
  const groups = new Map();
  for (const match of byDate(matches).reverse()) {
    if (!match.group) continue;
    const id = match.group.toLowerCase();
    const group = groups.get(id) ?? { name: match.group, matches: [] };
    group.matches.push(match);
    groups.set(id, group);
  }
  return [...groups.values()]
    .map(({ name, matches: list }) => ({ name, ...computeStats(list) }))
    .sort((a, b) => b.played - a.played || a.name.localeCompare(b.name));
}

// Years with matches, most recent first.
export function matchYears(matches) {
  return [...new Set(matches.map((m) => m.date.slice(0, 4)))].sort().reverse();
}

// The year in review: totals, best match and month, the group you played with
// most and the friend you shared the most matches with (both confirmed).
// Only months you had Pro count: proMonths is a Set of 'YYYY-MM' keys, or null
// while Pro is open to everyone (until in-app payments arrive).
export function yearSummary(matches, year, myId, proMonths = null) {
  const inYear = matches.filter(
    (m) => m.date.startsWith(year) && (!proMonths || proMonths.has(monthKey(m.date))),
  );

  const friends = new Map();
  for (const match of inYear) {
    for (const player of match.players ?? []) {
      if (player.user_id === myId || player.status !== 'confirmed') continue;
      const friend = friends.get(player.user_id) ?? { username: player.profile?.username, played: 0 };
      friend.played += 1;
      friends.set(player.user_id, friend);
    }
  }
  const topFriend =
    [...friends.values()].sort((a, b) => b.played - a.played || a.username.localeCompare(b.username))[0] ?? null;

  return {
    ...computeStats(inYear),
    bestMonth: bestMonths(inYear).byGoals,
    busiestMonth: bestMonths(inYear).byMatches,
    topGroup: groupStats(inYear)[0] ?? null,
    topFriend,
    proMonthCount: proMonths ? [...proMonths].filter((key) => key.startsWith(year)).length : null,
  };
}
