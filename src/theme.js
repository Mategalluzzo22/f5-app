import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { loadThemeMode, saveThemeMode } from './settings';

// Colors by what they are used for, so each screen works in light and dark mode.
// The green header, login and record screens keep their brand colors in both.
const LIGHT = {
  dark: false,
  background: '#f4f6f8',
  card: '#ffffff',
  text: '#222222',
  textSoft: '#444444',
  muted: '#666666',
  faint: '#8a8f98',
  border: '#d0d4da',
  divider: '#eef0f2',
  neutral: '#eef0f2', // background of secondary buttons like "Cancelar"
  primary: '#1f7a4d', // green backgrounds (buttons, selected chips)
  accent: '#1f7a4d', // green text and icons on cards
  tint: '#e8f3ec', // light green backgrounds (steppers, chips, icons)
  tintStrong: '#d4eedf',
  tintBorder: '#bfe5cf',
  win: '#1f9d55',
  danger: '#d64545',
  warning: '#b7791f',
  onPrimary: '#ffffff',
};

const DARK = {
  dark: true,
  background: '#0f1412',
  card: '#1a211e',
  text: '#eef1ef',
  textSoft: '#c9cfcc',
  muted: '#9aa3a0',
  faint: '#7d8784',
  border: '#36423d',
  divider: '#28322e',
  neutral: '#2a3430',
  primary: '#1f7a4d',
  accent: '#5fd394',
  tint: '#1c3528',
  tintStrong: '#23503a',
  tintBorder: '#2f6b4c',
  win: '#1f9d55',
  danger: '#ef6b6b',
  warning: '#e0a84a',
  onPrimary: '#ffffff',
};

const ThemeContext = createContext({ colors: LIGHT, mode: 'auto', setMode: () => {} });

// mode is what the person picked in Profile: 'auto' follows the phone.
export function ThemeProvider({ children }) {
  const system = useColorScheme();
  const [mode, setModeState] = useState('auto');

  useEffect(() => {
    loadThemeMode().then(setModeState);
  }, []);

  const value = useMemo(() => {
    const scheme = mode === 'auto' ? system : mode;
    return {
      colors: scheme === 'dark' ? DARK : LIGHT,
      mode,
      setMode: (next) => {
        setModeState(next);
        saveThemeMode(next);
      },
    };
  }, [mode, system]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function useColors() {
  return useTheme().colors;
}

// Text inputs: placeholder and keyboard that match the current mode.
export function useInputProps() {
  const colors = useColors();
  return { placeholderTextColor: colors.faint, keyboardAppearance: colors.dark ? 'dark' : 'light' };
}

// Builds a screen's styles from the current colors: makeStyles(colors) => StyleSheet.
export function useStyles(makeStyles) {
  const colors = useColors();
  return useMemo(() => makeStyles(colors), [colors, makeStyles]);
}
