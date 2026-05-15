import 'react-native-gesture-handler';
import './global.css';
import AppNavigator from 'AppNavigator';
import { ThemeProvider } from 'contexts/ThemeContext';
import Toast from 'react-native-toast-message';
import { ActivityIndicator, Text, View } from 'react-native';
import {
  useFonts,
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
  JetBrainsMono_600SemiBold,
  JetBrainsMono_700Bold,
} from '@expo-google-fonts/jetbrains-mono';

export default function App() {
  const [fontsLoaded] = useFonts({
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
    JetBrainsMono_600SemiBold,
    JetBrainsMono_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-slate-950">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  Text.defaultProps = Text.defaultProps || {};
  Text.defaultProps.style = {
    ...(Text.defaultProps.style ?? {}),
    fontFamily: 'JetBrainsMono_400Regular',
  };

  return (
    <ThemeProvider>
      <AppNavigator />
      <Toast />
    </ThemeProvider>
  );
}
