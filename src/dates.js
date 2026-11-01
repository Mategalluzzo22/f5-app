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
