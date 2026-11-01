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

export async function fetchMatches() {
  return unwrap(await supabase.from('matches').select(MATCH_COLUMNS));
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

// Uploads matches saved on the phone before accounts existed, then clears them locally.
export async function migrateLocalMatches() {
  const local = await loadLocalMatches();
  if (local.length === 0) return;
  const rows = local.map(({ date, opponent, result, goals }) => ({ date, opponent, result, goals }));
  unwrap(await supabase.from('matches').insert(rows));
  await clearLocalMatches();
}
