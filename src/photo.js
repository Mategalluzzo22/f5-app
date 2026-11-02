import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

const SIZE = 512;

// Lets the user pick a photo from their gallery, cropped square, and returns the
// local uri of a small JPEG ready to upload, or null if they cancelled.
export async function pickSquarePhoto() {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });
  if (result.canceled) return null;

  // Photos straight from the camera are several MB; a profile picture needs far less.
  const rendered = await ImageManipulator.manipulate(result.assets[0].uri)
    .resize({ width: SIZE, height: SIZE })
    .renderAsync();
  const saved = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.8 });
  return saved.uri;
}
