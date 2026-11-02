import { groupStats } from './insights';
import { MONTHS } from './dates';
import { bestMonths, monthSummary } from './monthly';

// "Datos sobre vos" (Pro): short facts built from your matches, each with a
// joke at the end, like "Los martes ganás el 70% de tus partidos. Pedí que
// todos los partidos sean los martes 😏". A fact only shows up when there are
// enough matches behind it (MIN in each side of the comparison).

const MIN = 3;
const WEEKDAYS = ['los domingos', 'los lunes', 'los martes', 'los miércoles', 'los jueves', 'los viernes', 'los sábados'];

const rate = (part, total) => Math.round((part / total) * 100);
const winRate = (list) => rate(list.filter((m) => m.result === 'win').length, list.length);
const capitalize = (text) => text[0].toUpperCase() + text.slice(1);
const times = (n, one, many) => `${n} ${n === 1 ? one : many}`;

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
  const day = WEEKDAYS[best.d];
  return {
    id: 'weekday',
    text: `${capitalize(day)} ganás el ${best.rate}% de tus partidos.`,
    jokes: [`Pedí que todos los partidos sean ${day} 😏`, `${capitalize(day)} sos otro jugador.`, 'Tu día de suerte, claramente 🍀'],
  };
}

// How much your goals help your team win.
function scoringEffect(matches) {
  const scored = matches.filter((m) => m.goals > 0);
  const blank = matches.filter((m) => m.goals === 0);
  if (scored.length < MIN || blank.length < MIN) return null;
  const [withGoals, without] = [winRate(scored), winRate(blank)];
  if (withGoals <= without) return null;
  return {
    id: 'scoring',
    text: `Cuando hacés un gol ganás el ${withGoals}% de los partidos. Cuando no, el ${without}%.`,
    jokes: ['Tus goles valen oro 🥇', 'Así que ya sabés: a meterla.', 'El equipo te necesita en el área ⚽'],
  };
}

// The group you win the most with, against the one you win the least with.
function bestGroup(matches) {
  const groups = groupStats(matches).filter((g) => g.played >= MIN);
  if (groups.length < 2) return null;
  groups.sort((a, b) => b.winRate - a.winRate);
  const [top, bottom] = [groups[0], groups[groups.length - 1]];
  if (top.winRate === bottom.winRate) return null;
  return {
    id: 'group',
    text: `Con ${top.name} ganás el ${top.winRate}%, con ${bottom.name} el ${bottom.winRate}%.`,
    jokes: [`${top.name} es tu lugar en el mundo.`, `Con ${bottom.name} capaz conviene cambiar de equipo 😅`],
  };
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
  return {
    id: 'format',
    text: `En F${top.format} hacés más goles que en F${next.format} (${top.average.toFixed(1)} contra ${next.average.toFixed(1)} por partido).`,
    jokes: ['Ya sabés qué cancha reservar 😉', `En F${top.format} te sentís en casa.`],
  };
}

// The friend you win the most with on your team (both confirmed).
function luckyTeammate(matches, myId) {
  const best = friendsBySide(matches, myId, true)
    .map((f) => ({ username: f.username, rate: winRate(f.list) }))
    .sort((a, b) => b.rate - a.rate || a.username.localeCompare(b.username))[0];
  if (!best || best.rate <= winRate(matches)) return null;
  return {
    id: 'teammate',
    text: `Con @${best.username} en tu equipo ganás el ${best.rate}%.`,
    jokes: ['Es tu cábala 🍀', `No juegues sin @${best.username}.`, 'Que no se pierda ningún partido 🙏'],
  };
}

// The friend who beat you the most playing against you (both confirmed).
function nemesis(matches, myId) {
  const worst = friendsBySide(matches, myId, false)
    .map((f) => ({ username: f.username, played: f.list.length, lost: f.list.filter((m) => m.result === 'loss').length }))
    .filter((f) => f.lost > f.played - f.lost)
    .sort((a, b) => b.lost - a.lost || a.username.localeCompare(b.username))[0];
  if (!worst) return null;
  return {
    id: 'nemesis',
    text: `@${worst.username} es tu verdugo: te ganó ${worst.lost} de los ${worst.played} partidos que jugaron en contra.`,
    jokes: ['Pedí jugar en su equipo 😅', 'La revancha está pendiente.', 'Algún día se te va a dar.'],
  };
}

// Friends you played with at least MIN times on your team (sameTeam) or against you.
function friendsBySide(matches, myId, sameTeam) {
  const friends = new Map();
  for (const match of matches) {
    for (const player of match.players ?? []) {
      if (player.user_id === myId || player.status !== 'confirmed') continue;
      if ((player.team === match.team) !== sameTeam) continue;
      const friend = friends.get(player.user_id) ?? { username: player.profile?.username, list: [] };
      friend.list.push(match);
      friends.set(player.user_id, friend);
    }
  }
  return [...friends.values()].filter((f) => f.list.length >= MIN);
}

// Matches decided by one goal (only matches with a score).
function closeMatches(matches) {
  const close = matches.filter((m) => m.scoreFor !== null && Math.abs(m.scoreFor - m.scoreAgainst) === 1);
  if (close.length < MIN) return null;
  const wins = close.filter((m) => m.result === 'win').length;
  return {
    id: 'close',
    text: `En partidos por un gol ganaste ${wins} de ${close.length}.`,
    jokes:
      wins * 2 >= close.length
        ? ['Sangre fría en los finales 🧊', 'Los partidos parejos son lo tuyo.']
        : ['Hay que cerrar mejor esos partidos 😬', 'Te falta un poquito de suerte en los finales.'],
  };
}

// The month you played the most (needs matches in at least two months).
function bestMonth(matches) {
  if (matches.length < MIN || new Set(matches.map((m) => m.date.slice(0, 7))).size < 2) return null;
  const { key } = bestMonths(matches).byMatches;
  const { played, goals, hasGoals } = monthSummary(matches, key);
  const month = MONTHS[Number(key.slice(5)) - 1];
  return {
    id: 'month',
    text: `Tu mejor mes fue ${month}: ${times(played, 'partido', 'partidos')}${hasGoals ? ` y ${times(goals, 'gol', 'goles')}` : ''}.`,
    jokes: ['¿Qué te pasó ese mes? 🔥', 'Ese mes estabas imparable.'],
  };
}

// Wins by 3 goals or more.
function thrashings(matches) {
  const count = matches.filter((m) => m.result === 'win' && m.scoreFor !== null && m.scoreFor - m.scoreAgainst >= 3).length;
  if (count < 2) return null;
  return {
    id: 'thrashings',
    text: `Ganaste ${count} partidos por goleada (3 goles o más de diferencia).`,
    jokes: ['Sin piedad 😈', 'Los rivales todavía te recuerdan.'],
  };
}

// Matches where you scored 3 goals or more.
function hatTricks(matches) {
  const count = matches.filter((m) => m.goals >= 3).length;
  if (count === 0) return null;
  return {
    id: 'hattricks',
    text: `Hiciste ${times(count, 'hat-trick', 'hat-tricks')} (3 goles o más en un partido).`,
    jokes: ['Pedí la pelota de recuerdo 🎩', 'Goleador de raza.'],
  };
}

const pick = (list, random) => list[Math.floor(random() * list.length)];

// Every fact that applies, each with one of its jokes: [{ id, text, joke }].
export function playerFacts(matches, myId, random = Math.random) {
  return [
    bestWeekday(matches),
    scoringEffect(matches),
    bestGroup(matches),
    bestFormatForGoals(matches),
    luckyTeammate(matches, myId),
    nemesis(matches, myId),
    closeMatches(matches),
    bestMonth(matches),
    thrashings(matches),
    hatTricks(matches),
  ]
    .filter(Boolean)
    .map(({ id, text, jokes }) => ({ id, text, joke: pick(jokes, random) }));
}

// `count` facts in random order, to show a few at a time.
export function pickFacts(facts, count = 3, random = Math.random) {
  const shuffled = [...facts];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}
