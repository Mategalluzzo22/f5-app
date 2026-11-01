// Decides which reminders to schedule from the saved matches. No side effects,
// so it can be tested on its own; notifications.js does the actual scheduling.

const NO_MATCH_DAYS = 10;
const GROUP_DAYS = 30;
const MAX_GROUP_REMINDERS = 5;
const MIN_MATCHES_WITH_GROUP = 2;
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
    title: '¿Jugaste algún partido estos días y no anotaste el resultado? ⚽',
    body: `Hace ${NO_MATCH_DAYS} días que no cargás ninguno. ¡Anotalo!`,
  });

  // Count matches per group (like "Los del martes"), ignoring upper/lower case.
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

  // Only groups you play with often, the most frequent first.
  [...groups.values()]
    .filter((group) => group.count >= MIN_MATCHES_WITH_GROUP)
    .sort((a, b) => b.count - a.count)
    .slice(0, MAX_GROUP_REMINDERS)
    .forEach((group) => {
      reminders.push({
        date: reminderDate(group.lastDate, GROUP_DAYS),
        title: `¿Y ${group.name}? 🤔`,
        body: `Hace un mes que no jugás con ${group.name}. ¿Qué onda?`,
      });
    });

  // Dates already gone by would fire right away every time, so skip them.
  return reminders.filter((reminder) => reminder.date > now);
}
