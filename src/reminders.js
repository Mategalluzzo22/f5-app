// Decides which reminders to schedule from the saved matches. No side effects,
// so it can be tested on its own; notifications.js does the actual scheduling.

const NO_MATCH_DAYS = 10;
const RIVAL_DAYS = 30;
const MAX_RIVAL_REMINDERS = 5;
const MIN_MATCHES_WITH_RIVAL = 2;
const REMINDER_HOUR = 19;

// 'YYYY-MM-DD' + N days, at the reminder hour (local time).
function reminderDate(iso, daysLater) {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day + daysLater, REMINDER_HOUR, 0, 0);
}

export function planReminders(matches, now = new Date()) {
  if (matches.length === 0) return [];
  const reminders = [];

  const lastDate = matches.reduce((latest, m) => (m.date > latest ? m.date : latest), matches[0].date);
  reminders.push({
    date: reminderDate(lastDate, NO_MATCH_DAYS),
    title: '¿Jugaste algún partido estos días y no anotaste el/los resultados? ⚽',
    body: `Hace ${NO_MATCH_DAYS} días que no cargás ninguno. ¡Anotalos!`,
  });

  // Group matches by rival, ignoring upper/lower case.
  const rivals = new Map();
  for (const match of matches) {
    const key = match.opponent.toLowerCase();
    const rival = rivals.get(key) ?? { name: match.opponent, count: 0, lastDate: match.date };
    rival.count += 1;
    if (match.date >= rival.lastDate) {
      rival.lastDate = match.date;
      rival.name = match.opponent;
    }
    rivals.set(key, rival);
  }

  // Only rivals you play often, the most frequent first.
  [...rivals.values()]
    .filter((rival) => rival.count >= MIN_MATCHES_WITH_RIVAL)
    .sort((a, b) => b.count - a.count)
    .slice(0, MAX_RIVAL_REMINDERS)
    .forEach((rival) => {
      reminders.push({
        date: reminderDate(rival.lastDate, RIVAL_DAYS),
        title: `¿Y ${rival.name}? 🤔`,
        body: `Hace un mes que no jugás contra ${rival.name}. ¿Qué onda?`,
      });
    });

  // Dates already gone by would fire right away every time, so skip them.
  return reminders.filter((reminder) => reminder.date > now);
}
