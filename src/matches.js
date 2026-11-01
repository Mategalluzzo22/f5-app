// A match from the database (with its players) seen from one player's side:
// their team's score first, their goals and their result.
export function playerView(row, userId) {
  const me = row.players.find((p) => p.user_id === userId);
  const myTeamIsA = me.team === 'A';
  return {
    id: row.id,
    date: row.date,
    format: row.format,
    group: row.group_name,
    scoreFor: myTeamIsA ? row.score_a : row.score_b,
    scoreAgainst: myTeamIsA ? row.score_b : row.score_a,
    goals: me.goals, // null = not recorded, which is not the same as 0
    result: resultFor(row, me),
    team: me.team,
    status: me.status,
    createdBy: row.created_by,
    players: row.players,
  };
}

// Win/draw/loss from the score and the player's team. Matches without a score
// (old ones, or when nobody remembered it) use the result picked by hand.
export function resultFor(row, player) {
  if (row.score_a === null) return player.manual_result;
  const diff = player.team === 'A' ? row.score_a - row.score_b : row.score_b - row.score_a;
  if (diff > 0) return 'win';
  if (diff < 0) return 'loss';
  return 'draw';
}

export function scoreText(match) {
  return match.scoreFor === null ? 'Sin marcador' : `${match.scoreFor} - ${match.scoreAgainst}`;
}

// Highest number of goals a player can have: their team's goals, when the score is known.
export function maxGoals(match) {
  return match.scoreFor === null ? Infinity : match.scoreFor;
}

export function goalsText(goals) {
  if (goals === null) return 'goles sin dato';
  return `${goals} ${goals === 1 ? 'gol' : 'goles'}`;
}
