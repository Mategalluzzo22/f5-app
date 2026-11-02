// "Color de tu equipo" (Pro): the main color of the app. Win/draw/loss colors
// don't change, and neither do the login and record screens (brand green).

export const TEAM_COLORS = [
  { id: 'green', name: 'Verde', color: '#1f7a4d' },
  { id: 'blue', name: 'Azul', color: '#1d4f9c' },
  { id: 'sky', name: 'Celeste', color: '#2a86c7' },
  { id: 'red', name: 'Rojo', color: '#c0392b' },
  { id: 'purple', name: 'Violeta', color: '#6b3fa0' },
  { id: 'orange', name: 'Naranja', color: '#c2561a' },
  { id: 'black', name: 'Negro', color: '#2b2f33' },
];

// Blends two '#rrggbb' colors: amount 0 = a, 1 = b.
export function mix(a, b, amount) {
  const channel = (hex, i) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
  return `#${[0, 1, 2]
    .map((i) => Math.round(channel(a, i) + (channel(b, i) - channel(a, i)) * amount))
    .map((v) => v.toString(16).padStart(2, '0'))
    .join('')}`;
}

// The palette colors that follow the team color. The green team keeps the
// hand-picked palette in theme.js, so it gets no overrides.
export function teamOverrides(id, dark, background) {
  const team = TEAM_COLORS.find((t) => t.id === id);
  if (!team || team.id === 'green') return {};
  const c = team.color;
  const shared = { primary: c, header: c, bright: mix(c, '#ffffff', 0.15) };
  if (dark) {
    return {
      ...shared,
      accent: mix(c, '#ffffff', 0.45),
      tint: mix(c, background, 0.75),
      tintStrong: mix(c, background, 0.55),
      tintBorder: mix(c, background, 0.4),
    };
  }
  return {
    ...shared,
    accent: c,
    tint: mix(c, '#ffffff', 0.89),
    tintStrong: mix(c, '#ffffff', 0.8),
    tintBorder: mix(c, '#ffffff', 0.68),
  };
}
