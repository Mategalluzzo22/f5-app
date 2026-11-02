// Matches two players both confirmed, split into the ones they played on the
// same team and the ones they played against each other. Each list holds each
// player's own view of the match (see playerView), so results are already per side.
export function headToHead(myMatches, friendMatches) {
  const friendById = new Map(friendMatches.map((m) => [m.id, m]));
  const together = { played: 0, wins: 0, draws: 0, losses: 0 };
  const against = { played: 0, myWins: 0, theirWins: 0, draws: 0 };

  for (const mine of myMatches) {
    const theirs = friendById.get(mine.id);
    if (!theirs) continue;
    if (mine.team === theirs.team) {
      together.played += 1;
      if (mine.result === 'win') together.wins += 1;
      else if (mine.result === 'loss') together.losses += 1;
      else together.draws += 1;
    } else {
      against.played += 1;
      if (mine.result === 'win') against.myWins += 1;
      else if (mine.result === 'loss') against.theirWins += 1;
      else against.draws += 1;
    }
  }
  return { together, against };
}

// Which side has the better number: 'me', 'them' or null when tied.
export function better(mine, theirs) {
  if (mine === theirs) return null;
  return mine > theirs ? 'me' : 'them';
}
