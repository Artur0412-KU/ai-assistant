import type { RootStackParamList } from 'AppNavigator';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { supabase } from 'data/supabase';
import React, { useCallback, useLayoutEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PurpleGlassButton } from 'components/Buttons/PurpleGlassButton';
import { useAI } from 'hooks/useAi';
import { parseStyledPrompt } from 'services/parse/parseStylePrompt';

export default function Home() {
  const navigate = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [text, setText] = useState('');
  const [prompt, setPrompt] = useState('');
  const { askAI, data } = useAI();
  const logOut = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    supabase.auth.signOut();

    if (data) {
      navigate.navigate('Register');
    }
  }, [navigate]);

  const chunks = parseStyledPrompt(data ?? '');

  console.log('[Home] prompt', prompt);

  useLayoutEffect(() => {
    navigate.setOptions({
      headerRight: () => (
        <Pressable onPress={logOut} className="mr-4">
          <View className=" h-full rounded-full bg-white p-2 px-2.5">
            <Ionicons name="exit" size={22} color="black" />
          </View>
        </Pressable>
      ),
    });
  }, [logOut, navigate]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView className="pt-12">
        <View className="flex h-full justify-between px-4">
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ gap: 12 }}
            showsVerticalScrollIndicator={false}>
            {prompt.length > 0 && (
              <View className="self-end rounded-md bg-purple-600 p-2 ">
                <Text className="font-jetbrains text-end color-white">{prompt}</Text>
              </View>
            )}
            {!!data?.length && (
              <View className="self-start rounded-md bg-gray-200 p-2">
                <Text className="font-jetbrains text-end color-black">
                  {chunks.map((c, i) => (
                    <Text
                      key={i}
                      className="font-jetbrains"
                      style={{
                        fontWeight:
                          c.weight === 'bold' ? '700' : c.weight === 'semibold' ? '600' : '400',
                      }}>
                      {c.text}
                    </Text>
                  ))}
                </Text>
              </View>
            )}
          </ScrollView>
          <View className="flex flex-row gap-2">
            <TextInput
              placeholder="Write something"
              placeholderTextColor="#9ca3af"
              value={text}
              onChangeText={setText}
              autoCapitalize="none"
              keyboardType="email-address"
              className="font-jetbrains w-[85%] rounded-xl border-2 border-gray-200 bg-white px-4 py-3.5 text-gray-800"
            />
            <PurpleGlassButton
              onPress={() => {
                setPrompt(text);
                askAI(text);
                setText('');
              }}
            />
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
