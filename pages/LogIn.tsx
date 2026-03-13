import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from 'AppNavigator';
import ThemeToggle from 'components/ThemeToggle';
import { useAppTheme } from 'contexts/ThemeContext';
import { supabase } from 'data/supabase';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { signInWithGoogle } from 'utils/auth/signInWithGoogle';

export default function LogIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { theme } = useAppTheme();

  async function signIn() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
      setLoading(false);
      return;
    }
    navigation.navigate('Home');
    setLoading(false);
  }

  return (
    <SafeAreaView className="flex-1 justify-start bg-gray-50 px-6 py-4 dark:bg-slate-950">
      <View className="flex h-full justify-between gap-5">
        <View className="flex justify-between">
          <Text className="font-jetbrains mb-6 text-center text-3xl font-bold text-gray-800 dark:text-slate-100">
            Log In
          </Text>

          <TextInput
            placeholder="Email"
            placeholderTextColor={theme === 'dark' ? '#64748b' : '#9ca3af'}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            className="font-jetbrains mb-7 rounded-xl border-2 border-gray-200 bg-white px-4 py-3.5 text-gray-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor={theme === 'dark' ? '#64748b' : '#9ca3af'}
            autoCapitalize="none"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            className="font-jetbrains rounded-xl border-2 border-gray-200 bg-white px-4 py-3.5 text-gray-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </View>

        <View className="flex flex-col gap-4">
          {loading ? (
            <View className="py-4">
              <ActivityIndicator size="large" color="#7c3aed" />
            </View>
          ) : (
            <Pressable
              onPress={signIn}
              className="rounded-xl bg-purple-600 py-3.5 active:bg-purple-700">
              <Text className="font-jetbrains text-center text-base font-semibold text-white">
                Log In
              </Text>
            </Pressable>
          )}

          <Pressable
            onPress={() => navigation.navigate('Register')}
            className="rounded-xl bg-purple-500 py-3.5 active:bg-purple-600">
            <Text className="font-jetbrains text-center text-base font-semibold text-white">
              Don&apos;t have an account? Register
            </Text>
          </Pressable>

          <Pressable
            onPress={signInWithGoogle}
            className="rounded-xl border border-green-800 bg-green-800 py-3.5 active:bg-green-600">
            <Text className="font-jetbrains text-center text-base font-semibold text-white">
              Google
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
