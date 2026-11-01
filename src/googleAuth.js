import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession(); // needed on web only

// Reads key=value pairs from both the query (?...) and the fragment (#...) of a URL,
// since Supabase puts the session tokens in the fragment.
function paramsFromUrl(url) {
  const [beforeHash, hash = ''] = url.split('#');
  const query = beforeHash.split('?')[1] ?? '';
  const params = {};
  for (const pair of `${query}&${hash}`.split('&')) {
    if (!pair) continue;
    const [key, value = ''] = pair.split('=');
    params[decodeURIComponent(key)] = decodeURIComponent(value.replace(/\+/g, ' '));
  }
  return params;
}

// Opens Google in an in-app browser. Supabase sends the session back in the
// redirect URL (exp://... in Expo Go, f5app://... in a real build), and we keep it.
// Returns false if the user closed the window without logging in.
export async function signInWithGoogle() {
  const redirectTo = makeRedirectUri();
  if (__DEV__) console.log('[login] Google redirect URL:', redirectTo);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') return false;

  const params = paramsFromUrl(result.url);
  if (params.error) throw new Error(params.error_description || params.error);
  if (!params.access_token) throw new Error('No session in redirect URL');

  const { error: sessionError } = await supabase.auth.setSession({
    access_token: params.access_token,
    refresh_token: params.refresh_token,
  });
  if (sessionError) throw sessionError;
  return true;
}
