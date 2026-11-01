import { clearLocalMatches, loadLocalMatches } from './storage';
import { supabase } from './supabase';

const MATCH_COLUMNS = 'id, date, opponent, result, goals';

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

// Only your own matches: friends' matches are also readable, but they must not
// end up in your stats.
export async function fetchMatches(userId) {
  return unwrap(await supabase.from('matches').select(MATCH_COLUMNS).eq('user_id', userId));
}

// Returns the saved match with the id the database gave it.
export async function addMatch({ date, opponent, result, goals }) {
  return unwrap(
    await supabase.from('matches').insert({ date, opponent, result, goals }).select(MATCH_COLUMNS).single(),
  );
}

export async function deleteMatch(id) {
  unwrap(await supabase.from('matches').delete().eq('id', id));
}

// --- Friends ---

const FRIENDSHIP_COLUMNS =
  'id, status, requester_id, addressee_id, requester:profiles!requester_id(username), addressee:profiles!addressee_id(username)';

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

// Latest matches of the given friends, newest first.
export async function fetchFriendsMatches(friendIds) {
  if (friendIds.length === 0) return [];
  return unwrap(
    await supabase
      .from('matches')
      .select(`${MATCH_COLUMNS}, user_id`)
      .in('user_id', friendIds)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(30),
  );
}

// Uploads matches saved on the phone before accounts existed, then clears them locally.
export async function migrateLocalMatches() {
  const local = await loadLocalMatches();
  if (local.length === 0) return;
  const rows = local.map(({ date, opponent, result, goals }) => ({ date, opponent, result, goals }));
  unwrap(await supabase.from('matches').insert(rows));
  await clearLocalMatches();
}
