import { BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed/700Bold';
import { BarlowCondensed_800ExtraBold } from '@expo-google-fonts/barlow-condensed/800ExtraBold';

// Sporty condensed font (like a stadium scoreboard), used for titles and big numbers.
// Body text keeps the system font so it stays easy to read.
export const FONTS = {
  bold: 'BarlowCondensed_700Bold',
  extraBold: 'BarlowCondensed_800ExtraBold',
};

export const FONT_FILES = {
  [FONTS.bold]: BarlowCondensed_700Bold,
  [FONTS.extraBold]: BarlowCondensed_800ExtraBold,
};
