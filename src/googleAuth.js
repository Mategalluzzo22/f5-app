import { makeRedirectUri } from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession(); // needed on web only

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

  const { params, errorCode } = QueryParams.getQueryParams(result.url);
  if (errorCode || params.error) throw new Error(errorCode || params.error_description || params.error);
  if (!params.access_token) throw new Error('No session in redirect URL');

  const { error: sessionError } = await supabase.auth.setSession({
    access_token: params.access_token,
    refresh_token: params.refresh_token,
  });
  if (sessionError) throw sessionError;
  return true;
}
