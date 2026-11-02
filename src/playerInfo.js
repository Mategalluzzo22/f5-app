// "Tu ficha de jugador": position, foot, shirt number and favorite team.
// Stored on the profile (see supabase/player-card.sql); every field is optional.

export const POSITIONS = [
  ['goalkeeper', 'Arquero'],
  ['defender', 'Defensor'],
  ['midfielder', 'Mediocampista'],
  ['forward', 'Delantero'],
];

export const FEET = [
  ['right', 'Diestro'],
  ['left', 'Zurdo'],
  ['both', 'Ambidiestro'],
];

const label = (options, value) => options.find(([id]) => id === value)?.[1];

// Turns what was typed in the form into the profile fields, or an error message.
export function cardFromForm({ position, foot, shirtNumber, favoriteTeam }) {
  const number = shirtNumber.trim();
  if (number && !/^\d{1,2}$/.test(number)) return { error: 'El número de camiseta va del 0 al 99.' };
  const team = favoriteTeam.trim();
  if (team.length > 40) return { error: 'El nombre del equipo puede tener hasta 40 letras.' };
  return {
    card: {
      position: position ?? null,
      foot: foot ?? null,
      shirt_number: number ? Number(number) : null,
      favorite_team: team || null,
    },
  };
}

// The form's starting values from a saved profile.
export function formFromProfile(profile) {
  return {
    position: profile.position ?? null,
    foot: profile.foot ?? null,
    shirtNumber: profile.shirt_number === null || profile.shirt_number === undefined ? '' : String(profile.shirt_number),
    favoriteTeam: profile.favorite_team ?? '',
  };
}

// Short labels to show on the player card, only for the fields that are set.
export function cardLabels(profile) {
  if (!profile) return [];
  return [
    label(POSITIONS, profile.position),
    label(FEET, profile.foot),
    profile.shirt_number !== null && profile.shirt_number !== undefined ? `#${profile.shirt_number}` : null,
    profile.favorite_team ? `Hincha de ${profile.favorite_team}` : null,
  ].filter(Boolean);
}
