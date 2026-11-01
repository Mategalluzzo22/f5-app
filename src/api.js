import { playerView } from './matches';
import { supabase } from './supabase';

// Supabase returns { data, error }; turn errors into exceptions so callers can try/catch.
function unwrap({ data, error }) {
  if (error) throw error;
  return data;
}

export async function fetchProfile(userId) {
  return unwrap(await supabase.from('profiles').select('id, username').eq('id', userId).maybeSingle());
}

export async function createProfile(userId, username) {
  return unwrap(
    await supabase.from('profiles').insert({ id: userId, username }).select('id, username').single(),
  );
}

// --- Matches ---

const MATCH_FIELDS =
  'id, date, format, group_name, score_a, score_b, created_by, ' +
  'players:match_players(user_id, team, goals, status, legacy_result, profile:profiles(username))';

async function fetchMatchesByIds(ids) {
  if (ids.length === 0) return [];
  return unwrap(await supabase.from('matches').select(MATCH_FIELDS).in('id', ids));
}

// Matches where the user is a player with the given status: 'confirmed' ones count
// in their stats, 'pending' ones are waiting for them to confirm. Seen from their side.
export async function fetchMyMatches(userId, status) {
  const rows = unwrap(
    await supabase.from('match_players').select('match_id').eq('user_id', userId).eq('status', status),
  );
  const matches = await fetchMatchesByIds(rows.map((r) => r.match_id));
  return matches.map((m) => playerView(m, userId));
}

// Saves the match and its players in one go. The creator plays for their own team
// and is confirmed; every friend added has to confirm.
// players: [{ user_id, team: 'A' (my team) | 'B' (rivals) }]
export async function createMatch({ date, format, group, scoreFor, scoreAgainst, goals, players }) {
  return unwrap(
    await supabase.rpc('create_match', {
      match_date: date,
      match_format: format,
      match_group: group,
      my_team_score: scoreFor,
      rival_score: scoreAgainst,
      my_goals: goals,
      players,
    }),
  );
}

export async function confirmMatch(matchId, goals) {
  unwrap(await supabase.rpc('confirm_match', { mid: matchId, my_goals: goals }));
}

// Only the creator can delete a match; it disappears for every player.
export async function deleteMatch(matchId) {
  unwrap(await supabase.from('matches').delete().eq('id', matchId));
}

// For a player who didn't create the match: "I didn't play this one".
export async function leaveMatch(matchId, userId) {
  unwrap(await supabase.from('match_players').delete().eq('match_id', matchId).eq('user_id', userId));
}

// --- Friends ---

const FRIENDSHIP_COLUMNS =
  'id, status, requester_id, addressee_id, requester:profiles!requester_id(username), addressee:profiles!addressee_id(username)';

// The other person in a friendship, seen from my side.
export function otherSide(friendship, myId) {
  const iSent = friendship.requester_id === myId;
  return {
    id: iSent ? friendship.addressee_id : friendship.requester_id,
    username: iSent ? friendship.addressee.username : friendship.requester.username,
    iSent,
  };
}

// Other users whose username starts with the typed text.
export async function searchProfiles(text, myId) {
  return unwrap(
    await supabase
      .from('profiles')
      .select('id, username')
      .ilike('username', `${text}%`)
      .neq('id', myId)
      .order('username')
      .limit(10),
  );
}

// Every request you sent or received, pending or accepted, with both usernames.
export async function fetchFriendships() {
  return unwrap(await supabase.from('friendships').select(FRIENDSHIP_COLUMNS));
}

// Accepted friends only, as { id, username }, sorted by username.
export async function fetchFriends(myId) {
  const friendships = await fetchFriendships();
  return friendships
    .filter((f) => f.status === 'accepted')
    .map((f) => otherSide(f, myId))
    .sort((a, b) => a.username.localeCompare(b.username));
}

export async function sendFriendRequest(addresseeId) {
  unwrap(await supabase.from('friendships').insert({ addressee_id: addresseeId }));
}

export async function acceptFriendRequest(id) {
  unwrap(await supabase.rpc('accept_friend_request', { request_id: id }));
}

// Used both to reject a request and to remove a friend.
export async function removeFriendship(id) {
  unwrap(await supabase.from('friendships').delete().eq('id', id));
}

// Latest matches confirmed by friends, newest first, each seen from the side of
// the first friend who played it (so the result and goals are that friend's).
export async function fetchFriendsMatches(friendIds) {
  if (friendIds.length === 0) return [];
  const rows = unwrap(
    await supabase
      .from('match_players')
      .select('match_id, user_id')
      .in('user_id', friendIds)
      .eq('status', 'confirmed')
      .order('created_at', { ascending: false })
      .limit(60),
  );
  const friendByMatch = new Map();
  for (const row of rows) {
    if (!friendByMatch.has(row.match_id)) friendByMatch.set(row.match_id, row.user_id);
  }
  const matches = await fetchMatchesByIds([...friendByMatch.keys()]);
  return matches
    .map((m) => ({ ...playerView(m, friendByMatch.get(m.id)), friendId: friendByMatch.get(m.id) }))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 30);
}
