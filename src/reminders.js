// Decides which reminders to schedule from the saved matches. No side effects,
// so it can be tested on its own; notifications.js does the actual scheduling.
//
// Kinds, from most to least important (only one reminder per day, the most important wins):
//   1. pending: a friend added you to a match you haven't confirmed yet.
//   2. matchDay: the night of the weekday you usually play, asking how it went.
//   3. inactive: no match logged in 10, 17 and 30 days, getting cheekier each time.
//   4. group: a month without playing with a group you play with often.
// Every kind has several texts and a different one is picked each time.

const REMINDER_HOUR = 19;
const MATCH_DAY_TIME = [22, 30];
const PENDING_HOUR = 20;

// How many upcoming weeks of "match day" reminders to schedule, in case the app
// isn't opened for a while (they're all rescheduled whenever it is).
const MATCH_DAY_WEEKS = 4;
// A weekday counts as "your day" with at least this many matches on it...
const MATCH_DAY_MIN_MATCHES = 3;
// ...and at least this share of all your matches.
const MATCH_DAY_MIN_SHARE = 0.4;

const GROUP_DAYS = 30;
const MAX_GROUP_REMINDERS = 5;
const MIN_MATCHES_WITH_GROUP = 2;

const PRIORITY = { pending: 1, matchDay: 2, inactive: 3, group: 4 };

const MATCH_DAY_TEXTS = [
  ['¿Y el de hoy? ⚽', 'Si metiste goles, que quede registrado. Si no, también 😅'],
  ['Terminó el partido, arranca el VAR 📺', 'Anotá cómo salió antes de que te olvides del marcador.'],
  ['¿Ganaste o perdiste? 🤔', 'Contale a Doparti cómo te fue hoy. No le decimos a nadie (salvo a tus amigos).'],
  ['Momento de la verdad 🧾', 'Cargá el partido de hoy y mirá cómo quedan tus números.'],
];

const INACTIVE_STEPS = [
  {
    days: 10,
    texts: [
      ['¿Jugaste algún partido estos días y no anotaste el resultado? ⚽', 'Hace 10 días que no cargás ninguno. ¡Anotalo!'],
      ['Che, ¿colgaste los botines? 👟', 'Hace 10 días que no anotás un partido.'],
      ['Tus estadísticas te extrañan 📉', 'Hace 10 días que no sumás partidos. Cargá el último picado.'],
    ],
  },
  {
    days: 17,
    texts: [
      ['¿Lesión o vagancia? 🤕', 'Hace más de dos semanas que no sabemos nada de vos en la cancha.'],
      ['El DT pregunta por vos 📋', 'Dos semanas sin partidos cargados. ¿Volvés para el próximo?'],
      ['Tu racha está juntando polvo 🕸️', 'Hace 17 días que no anotás un partido.'],
    ],
  },
  {
    days: 30,
    texts: [
      ['Un mes sin partidos… ¿te pasaste al pádel? 🎾', 'Volvé a la cancha (y a Doparti). Te estamos esperando.'],
      ['Te dimos de baja del plantel 😱', 'Mentira. Pero hace un mes que no cargás un partido.'],
      ['¿Seguís ahí? 👀', 'Un mes sin partidos. Si jugaste, cargalo; si no, ¿qué esperás?'],
    ],
  },
];

const GROUP_TEXTS = [
  (g) => [`¿Y ${g}? 🤔`, `Hace un mes que no jugás con ${g}. ¿Qué onda?`],
  (g) => [`${g} te extraña 💔`, `Hace un mes que no compartís cancha con ${g}.`],
  (g) => [`¿Se disolvió ${g}? 🧐`, 'Hace un mes que no cargás un partido con ellos.'],
];

const RESULT_VERB = { win: 'ganaste', draw: 'empataste', loss: 'perdiste' };

const PENDING_TEXTS = [
  (who, result) => [`@${who} dice que jugaste 👀`, `Y que ${RESULT_VERB[result]}. ¿Confirmás o te hacés el distraído?`],
  (who) => ['Tenés un partido para confirmar ✅', `@${who} te sumó a un partido. Confirmalo y sumalo a tus números.`],
  (who) => ['Te están esperando 📝', `@${who} cargó un partido con vos. ¿Lo confirmás?`],
];

// 'YYYY-MM-DD' + N days, at the given time (local).
function dateAt(iso, daysLater, [hour, minute] = [REMINDER_HOUR, 0]) {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day + daysLater, hour, minute, 0);
}

function toISO(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Weekday (0 = Sunday) the user usually plays on, or null if there isn't a clear one.
export function usualMatchDay(matches) {
  const counts = new Array(7).fill(0);
  for (const match of matches) counts[dateAt(match.date, 0).getDay()] += 1;
  const best = counts.indexOf(Math.max(...counts));
  const isClear =
    counts[best] >= MATCH_DAY_MIN_MATCHES && counts[best] / matches.length >= MATCH_DAY_MIN_SHARE;
  return isClear ? best : null;
}

// options.pending: matches waiting for the user to confirm (seen from their side).
// options.random: replaceable in tests, to pick predictable texts.
export function planReminders(matches, { now = new Date(), pending = [], random = Math.random } = {}) {
  const pick = (texts) => texts[Math.floor(random() * texts.length)];
  const candidates = [];
  const add = (kind, date, [title, body]) => candidates.push({ kind, date, title, body });

  // 1. Matches to confirm: tonight at 20 h, or tomorrow if that's less than an hour away.
  if (pending.length > 0) {
    const tonight = dateAt(toISO(now), 0, [PENDING_HOUR, 0]);
    const date = tonight - now >= 60 * 60 * 1000 ? tonight : dateAt(toISO(now), 1, [PENDING_HOUR, 0]);
    const first = pending[0];
    const creator = first.players.find((p) => p.user_id === first.createdBy);
    const text =
      pending.length > 1
        ? [`Tenés ${pending.length} partidos para confirmar ✅`, 'Tus amigos te sumaron. Confirmalos y sumalos a tus números.']
        : pick(PENDING_TEXTS)(creator?.profile.username ?? 'Un amigo', first.result);
    add('pending', date, text);
  }

  if (matches.length > 0) {
    const today = toISO(now);
    const lastDate = matches.reduce((latest, m) => (m.date > latest ? m.date : latest), matches[0].date);

    // 2. The night of your usual match day, for the next few weeks. Not tonight if
    //    you already logged today's match.
    const matchDay = usualMatchDay(matches);
    if (matchDay !== null) {
      const daysUntil = (matchDay - now.getDay() + 7) % 7;
      for (let week = 0; week < MATCH_DAY_WEEKS; week += 1) {
        const date = dateAt(today, daysUntil + week * 7, MATCH_DAY_TIME);
        if (toISO(date) === lastDate) continue;
        add('matchDay', date, pick(MATCH_DAY_TEXTS));
      }
    }

    // 3. Without logging anything, a cheekier nudge each time.
    for (const step of INACTIVE_STEPS) {
      add('inactive', dateAt(lastDate, step.days), pick(step.texts));
    }

    // 4. Groups you play with often (ignoring upper/lower case), the most frequent first.
    const groups = new Map();
    for (const match of matches) {
      if (!match.group) continue;
      const key = match.group.toLowerCase();
      const group = groups.get(key) ?? { name: match.group, count: 0, lastDate: match.date };
      group.count += 1;
      if (match.date >= group.lastDate) {
        group.lastDate = match.date;
        group.name = match.group;
      }
      groups.set(key, group);
    }
    [...groups.values()]
      .filter((group) => group.count >= MIN_MATCHES_WITH_GROUP)
      .sort((a, b) => b.count - a.count)
      .slice(0, MAX_GROUP_REMINDERS)
      .forEach((group) => add('group', dateAt(group.lastDate, GROUP_DAYS), pick(GROUP_TEXTS)(group.name)));
  }

  // Dates already gone by would fire right away every time, so skip them. Then keep
  // only the most important reminder of each day, in date order.
  const byDay = new Map();
  for (const reminder of candidates.filter((r) => r.date > now)) {
    const day = toISO(reminder.date);
    const current = byDay.get(day);
    if (!current || PRIORITY[reminder.kind] < PRIORITY[current.kind]) byDay.set(day, reminder);
  }
  return [...byDay.values()].sort((a, b) => a.date - b.date);
}
