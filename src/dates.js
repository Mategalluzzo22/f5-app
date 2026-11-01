// Dates are stored as 'YYYY-MM-DD' so they sort correctly as plain strings,
// and shown to the user as 'DD/MM/YYYY'.

function pad(n) {
  return String(n).padStart(2, '0');
}

export function dateToISO(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayISO() {
  return dateToISO(new Date());
}

export function isoToDisplay(iso) {
  const [year, month, day] = iso.split('-');
  return `${day}/${month}/${year}`;
}

const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

// '2026-10-30' -> 'Jueves 30 de octubre de 2026'
export function isoToLongDisplay(iso) {
  const [year, month, day] = iso.split('-').map(Number);
  const weekday = WEEKDAYS[new Date(year, month - 1, day).getDay()];
  return `${weekday[0].toUpperCase()}${weekday.slice(1)} ${day} de ${MONTHS[month - 1]} de ${year}`;
}
