import { Alert, Button, Platform, Pressable } from 'react-native';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function ShareImageButton({ imageUrl }: { imageUrl: string }) {
  const shareImage = async () => {
    try {
      if (Platform.OS === 'web') return;

      const file = new File(Paths.cache, `ai-image-${Date.now()}.png`);

      // base64 image
      if (imageUrl.startsWith('data:image')) {
        const base64 = imageUrl.split(',')[1];

        await file.write(base64, {
          encoding: 'base64',
        });
      } else {
        // normal https image
        const response = await fetch(imageUrl);
        const blob = await response.blob();

        await file.write(blob);
      }

      await Sharing.shareAsync(file.uri);
    } catch (e) {
      console.error(e);
      Alert.alert('Share failed');
    }
  };

  return (
    <Pressable onPress={shareImage} className="pr-1">
      <FontAwesome name="share" size={16} color="grey" />
    </Pressable>
  );
}
