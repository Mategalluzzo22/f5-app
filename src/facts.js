import { groupStats } from './insights';

// "Datos sobre vos" (Pro): short facts built from your matches, like
// "Los martes ganás el 70% de tus partidos". A fact only shows up when there
// are enough matches behind it (MIN in each side of the comparison).

const MIN = 3;
const WEEKDAYS = ['los domingos', 'los lunes', 'los martes', 'los miércoles', 'los jueves', 'los viernes', 'los sábados'];

const rate = (part, total) => Math.round((part / total) * 100);
const winRate = (list) => rate(list.filter((m) => m.result === 'win').length, list.length);
const capitalize = (text) => text[0].toUpperCase() + text.slice(1);

function weekday(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).getDay();
}

// The weekday you win the most, compared with the one you win the least.
function bestWeekday(matches) {
  const days = [];
  for (let d = 0; d < 7; d++) {
    const list = matches.filter((m) => weekday(m.date) === d);
    if (list.length >= MIN) days.push({ d, rate: winRate(list) });
  }
  if (days.length < 2) return null;
  days.sort((a, b) => b.rate - a.rate);
  const best = days[0];
  if (best.rate === days[days.length - 1].rate) return null;
  return `${capitalize(WEEKDAYS[best.d])} ganás el ${best.rate}% de tus partidos.`;
}

// The format where you score the most per match.
function bestFormatForGoals(matches) {
  const formats = [...new Set(matches.map((m) => m.format))]
    .map((format) => {
      const list = matches.filter((m) => m.format === format && m.goals !== null);
      const goals = list.reduce((sum, m) => sum + m.goals, 0);
      return { format, count: list.length, average: list.length ? goals / list.length : 0 };
    })
    .filter((f) => f.count >= MIN)
    .sort((a, b) => b.average - a.average);
  if (formats.length < 2 || formats[0].average === formats[1].average) return null;
  const [top, next] = formats;
  return `En F${top.format} hacés más goles que en F${next.format} (${top.average.toFixed(1)} contra ${next.average.toFixed(1)} por partido).`;
}

// The group you win the most with, against the one you win the least with.
function bestGroup(matches) {
  const groups = groupStats(matches).filter((g) => g.played >= MIN);
  if (groups.length < 2) return null;
  groups.sort((a, b) => b.winRate - a.winRate);
  const [top, bottom] = [groups[0], groups[groups.length - 1]];
  if (top.winRate === bottom.winRate) return null;
  return `Con ${top.name} ganás el ${top.winRate}%, con ${bottom.name} el ${bottom.winRate}%.`;
}

// How much your goals help your team win.
function scoringEffect(matches) {
  const scored = matches.filter((m) => m.goals > 0);
  const blank = matches.filter((m) => m.goals === 0);
  if (scored.length < MIN || blank.length < MIN) return null;
  const [withGoals, without] = [winRate(scored), winRate(blank)];
  if (withGoals <= without) return null;
  return `Cuando hacés un gol ganás el ${withGoals}% de los partidos. Cuando no, el ${without}%.`;
}

// Matches decided by one goal (only matches with a score).
function closeMatches(matches) {
  const close = matches.filter((m) => m.scoreFor !== null && Math.abs(m.scoreFor - m.scoreAgainst) === 1);
  if (close.length < MIN) return null;
  const wins = close.filter((m) => m.result === 'win').length;
  return `En partidos por un gol ganaste ${wins} de ${close.length}.`;
}

// The friend you win the most with on your team (both confirmed).
function luckyTeammate(matches, myId) {
  const friends = new Map();
  for (const match of matches) {
    for (const player of match.players ?? []) {
      if (player.user_id === myId || player.status !== 'confirmed' || player.team !== match.team) continue;
      const friend = friends.get(player.user_id) ?? { username: player.profile?.username, list: [] };
      friend.list.push(match);
      friends.set(player.user_id, friend);
    }
  }
  const best = [...friends.values()]
    .filter((f) => f.list.length >= MIN)
    .map((f) => ({ username: f.username, rate: winRate(f.list) }))
    .sort((a, b) => b.rate - a.rate || a.username.localeCompare(b.username))[0];
  if (!best || best.rate <= winRate(matches)) return null;
  return `Con @${best.username} en tu equipo ganás el ${best.rate}%. Es tu cábala 🍀`;
}

export function playerFacts(matches, myId) {
  return [
    bestWeekday(matches),
    scoringEffect(matches),
    bestGroup(matches),
    bestFormatForGoals(matches),
    luckyTeammate(matches, myId),
    closeMatches(matches),
  ].filter(Boolean);
}
