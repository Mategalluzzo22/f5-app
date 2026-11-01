import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Header from './Header';
import PressableScale from './PressableScale';
import {
  acceptFriendRequest,
  fetchFriendships,
  fetchFriendsMatches,
  otherSide,
  removeFriendship,
  searchProfiles,
  sendFriendRequest,
} from './api';
import { isoToDisplay } from './dates';
import { FONTS } from './fonts';
import { goalsText, scoreText } from './matches';
import { RESULTS } from './results';

export default function FriendsScreen({ myId }) {
  const [friendships, setFriendships] = useState([]);
  const [feed, setFeed] = useState([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const friends = friendships.filter((f) => f.status === 'accepted').map((f) => otherSide(f, myId));
  const incoming = friendships.filter((f) => f.status === 'pending' && f.addressee_id === myId);
  const usernameById = Object.fromEntries(friends.map((f) => [f.id, f.username]));

  async function load() {
    try {
      const loaded = await fetchFriendships();
      setFriendships(loaded);
      const friendIds = loaded
        .filter((f) => f.status === 'accepted')
        .map((f) => otherSide(f, myId).id);
      setFeed(await fetchFriendsMatches(friendIds));
      setError('');
    } catch {
      setError('No pudimos cargar tus amigos. Revisá tu conexión.');
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  // Search a moment after the user stops typing.
  useEffect(() => {
    const text = query.trim().toLowerCase();
    if (text.length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => {
      searchProfiles(text, myId).then(setResults, () => setResults([]));
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  async function runAction(action) {
    try {
      await action();
      Haptics.selectionAsync();
      await load();
    } catch {
      setError('No se pudo completar. Probá de nuevo.');
    }
  }

  return (
    <ScrollView
      style={styles.screen}
      keyboardShouldPersistTaps="handled"
      refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor="#fff" />}
    >
      <Header
        title="Amigos"
        subtitle={`${friends.length} ${friends.length === 1 ? 'amigo' : 'amigos'}`}
      />
      <View style={styles.cards}>
        <View style={styles.card}>
          <View style={styles.searchRow}>
            <Ionicons name="search" size={20} color="#8a8f98" />
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={(text) => setQuery(text.replace('@', ''))}
              placeholder="Buscar por usuario"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          {results.map((profile) => (
            <SearchResult
              key={profile.id}
              profile={profile}
              friendship={friendships.find((f) => otherSide(f, myId).id === profile.id)}
              myId={myId}
              onAdd={() => runAction(() => sendFriendRequest(profile.id))}
              onAccept={(id) => runAction(() => acceptFriendRequest(id))}
            />
          ))}
          {query.trim().length >= 2 && results.length === 0 ? (
            <Text style={styles.muted}>No encontramos a nadie con ese usuario.</Text>
          ) : null}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {incoming.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Solicitudes</Text>
            {incoming.map((request) => (
              <View key={request.id} style={styles.personRow}>
                <Text style={styles.username}>@{request.requester.username}</Text>
                <PressableScale
                  style={styles.primaryPill}
                  onPress={() => runAction(() => acceptFriendRequest(request.id))}
                >
                  <Text style={styles.primaryPillText}>Aceptar</Text>
                </PressableScale>
                <PressableScale
                  style={styles.textPill}
                  onPress={() => runAction(() => removeFriendship(request.id))}
                >
                  <Text style={styles.textPillText}>Rechazar</Text>
                </PressableScale>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Partidos de tus amigos</Text>
          {loading ? null : feed.length === 0 ? (
            <Text style={styles.muted}>
              {friends.length === 0
                ? 'Todavía no tenés amigos. Buscalos por su usuario 👆'
                : 'Tus amigos todavía no cargaron partidos.'}
            </Text>
          ) : (
            feed.map((match) => (
              <FeedRow key={match.id} match={match} username={usernameById[match.friendId]} />
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}

function SearchResult({ profile, friendship, myId, onAdd, onAccept }) {
  let action;
  if (!friendship) {
    action = (
      <PressableScale style={styles.primaryPill} onPress={onAdd}>
        <Text style={styles.primaryPillText}>Agregar</Text>
      </PressableScale>
    );
  } else if (friendship.status === 'accepted') {
    action = <Text style={styles.statusText}>Amigos ✓</Text>;
  } else if (friendship.requester_id === myId) {
    action = <Text style={styles.statusText}>Enviada</Text>;
  } else {
    action = (
      <PressableScale style={styles.primaryPill} onPress={() => onAccept(friendship.id)}>
        <Text style={styles.primaryPillText}>Aceptar</Text>
      </PressableScale>
    );
  }
  return (
    <View style={styles.personRow}>
      <Text style={styles.username}>@{profile.username}</Text>
      {action}
    </View>
  );
}

function FeedRow({ match, username }) {
  const result = RESULTS[match.result];
  return (
    <View style={styles.feedRow}>
      <View style={[styles.badge, { backgroundColor: result.color }]}>
        <Text style={styles.badgeText}>{result.short}</Text>
      </View>
      <View style={styles.feedInfo}>
        <Text style={styles.username}>@{username}</Text>
        <Text style={styles.feedDetail}>
          {scoreText(match)}
          {match.group ? ` · ${match.group}` : ''} · {isoToDisplay(match.date)}
        </Text>
      </View>
      <Text style={styles.feedGoals}>{match.goals === null ? '–' : goalsText(match.goals)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  cards: { marginTop: -32, paddingHorizontal: 20, paddingBottom: 24, gap: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardTitle: { fontSize: 22, fontFamily: FONTS.bold, marginBottom: 6 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#d0d4da',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 16 },
  muted: { color: '#666', fontSize: 15, marginTop: 10 },
  error: { color: '#d64545', fontSize: 15, textAlign: 'center' },
  personRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10 },
  username: { flex: 1, fontSize: 16, fontWeight: '600' },
  primaryPill: {
    backgroundColor: '#1f7a4d',
    borderRadius: 16,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  primaryPillText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  textPill: { paddingVertical: 7, paddingHorizontal: 8 },
  textPillText: { color: '#8a8f98', fontSize: 14, fontWeight: '600' },
  statusText: { color: '#1f7a4d', fontSize: 14, fontWeight: '600' },
  feedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eef0f2',
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  badgeText: { color: '#fff', fontFamily: FONTS.extraBold, fontSize: 20 },
  feedInfo: { flex: 1 },
  feedDetail: { fontSize: 13, color: '#666', marginTop: 2 },
  feedGoals: { fontSize: 15, fontWeight: '600', color: '#1f7a4d' },
});
