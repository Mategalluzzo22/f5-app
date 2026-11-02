import { dateToISO } from './dates';
import { playerView } from './matches';

// Sample matches for the login tour (the "spoiler" of the app). Dates are
// relative to today, so charts and the year in review always look full.

export const DEMO_ME = 'demo-me';
export const DEMO_FRIEND = { id: 'demo-friend', username: 'labomba22', avatarUrl: null };
export const DEMO_FRIEND_PROFILE = {
  id: DEMO_FRIEND.id,
  username: DEMO_FRIEND.username,
  position: 'forward',
  foot: 'left',
  shirt_number: 10,
  favorite_team: null,
};

// [days ago, format, group, my team's score, rival's score, my goals, friend's team]
const SPECS = [
  [2, 5, 'Los del martes', 6, 4, 3, 'A'],
  [9, 5, 'Los del martes', 5, 3, 2, 'A'],
  [13, 7, 'Fútbol del laburo', 2, 3, 1, 'B'],
  [16, 5, 'Los del martes', 4, 4, 1, 'A'],
  [23, 5, 'Los del martes', 7, 2, 4, 'B'],
  [30, 7, 'Fútbol del laburo', 3, 1, 2, null],
  [44, 5, 'Los del martes', 2, 5, 0, 'A'],
  [58, 5, 'Los del martes', 6, 3, 2, 'A'],
  [72, 7, 'Fútbol del laburo', 4, 2, 1, null],
  [86, 5, 'Los del martes', 3, 3, 2, 'B'],
  [100, 11, 'Fútbol del laburo', 1, 2, 0, null],
  [121, 5, 'Los del martes', 8, 5, 5, 'A'],
  [149, 5, 'Los del martes', 4, 2, 1, 'A'],
  [177, 7, 'Fútbol del laburo', 2, 2, 1, null],
];

function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return dateToISO(date);
}

const player = (user_id, username, team, goals) => ({
  user_id,
  team,
  goals,
  status: 'confirmed',
  manual_result: null,
  profile: { username },
});

const ROWS = SPECS.map(([days, format, group, mine, rival, goals, friendTeam], i) => ({
  id: `demo-${i}`,
  date: daysAgo(days),
  format,
  group_name: group,
  score_a: mine,
  score_b: rival,
  created_by: DEMO_ME,
  players: [
    player(DEMO_ME, 'vos', 'A', goals),
    ...(friendTeam ? [player(DEMO_FRIEND.id, DEMO_FRIEND.username, friendTeam, 1)] : []),
  ],
}));

export const DEMO_MATCHES = ROWS.map((row) => playerView(row, DEMO_ME));
export const DEMO_FRIEND_MATCHES = ROWS.filter((row) => row.players.length > 1).map((row) =>
  playerView(row, DEMO_FRIEND.id),
);
