import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from 'contexts/ThemeContext';
import { supabase } from 'data/supabase';
import { generateImage, generateText } from 'services/ai/ai';
import { parseStyledPrompt } from 'services/parse/parseStylePrompt';
import {
  ChatMessage,
  createChat,
  getMessages,
  resolveChatId,
  saveMessages,
} from 'services/chat/chatStorage';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PurpleGlassButton } from 'components/Buttons/PurpleGlassButton';
import type { ChatDrawerParamList } from 'navigation/ChatDrawerNavigator';
import ShareImageButton from 'components/Buttons/ShareImageButton';

type Props = DrawerScreenProps<ChatDrawerParamList, 'Chat'>;
type ComposerModel = 'gemini-flash' | 'google-imagen';

function createMessageId() {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createMessage(
  role: ChatMessage['role'],
  content: string,
  options?: Pick<ChatMessage, 'kind' | 'imageUrl' | 'model'>,
  timestamp = new Date().toISOString()
): ChatMessage {
  return {
    id: createMessageId(),
    role,
    content,
    createdAt: timestamp,
    kind: options?.kind ?? 'text',
    imageUrl: options?.imageUrl,
    model: options?.model,
  };
}

export default function ChatScreen({ navigation, route }: Props) {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ComposerModel>('gemini-flash');
  const activeChatId = route.params?.chatId;
  const { theme } = useAppTheme();

  useEffect(() => {
    let isMounted = true;

    const ensureChat = async () => {
      if (!activeChatId) {
        const chat = await createChat();

        if (isMounted) {
          navigation.setParams({ chatId: chat.id });
        }
        return;
      }

      const resolvedChatId = await resolveChatId(activeChatId);
      const storedMessages = await getMessages(activeChatId);

      if (isMounted) {
        if (resolvedChatId !== activeChatId) {
          navigation.setParams({ chatId: resolvedChatId });
        }
        setMessages(storedMessages);
      }
    };

    ensureChat();

    return () => {
      isMounted = false;
    };
  }, [activeChatId, navigation]);

  const logOut = useCallback(async () => {
    await supabase.auth.signOut();
    navigation.getParent()?.navigate('Register');
  }, [navigation]);

  useLayoutEffect(() => {
    navigation.getParent()?.setOptions({
      headerRight: () => (
        <View className="mr-4 flex-row items-center gap-2">
          <Pressable onPress={logOut}>
            <View className="h-full rounded-full bg-white p-2 px-2.5 dark:bg-slate-800">
              <Ionicons name="exit" size={22} color={theme === 'dark' ? '#f8fafc' : 'black'} />
            </View>
          </Pressable>
        </View>
      ),
    });
  }, [logOut, navigation, theme]);

  const handleSend = async () => {
    const trimmed = text.trim();

    if (!trimmed || !activeChatId || loading) {
      return;
    }

    const userMessage = createMessage('user', trimmed);
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setText('');
    setLoading(true);
    await saveMessages(activeChatId, nextMessages);

    try {
      const assistantMessage =
        selectedModel === 'google-imagen'
          ? createMessage('assistant', trimmed, {
              kind: 'image',
              imageUrl: await generateImage(trimmed),
              model: 'google-imagen',
            })
          : createMessage('assistant', (await generateText(trimmed)) ?? '', {
              kind: 'text',
              model: 'gemini-flash',
            });
      const updatedMessages = [...nextMessages, assistantMessage];

      setMessages(updatedMessages);
      await saveMessages(activeChatId, updatedMessages);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-slate-50 dark:bg-slate-950"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
        <View className="flex-1 px-4">
          <View className="mb-4 flex-row items-center justify-between">
            <Pressable
              onPress={() => navigation.openDrawer()}
              className="h-11 w-11 items-center justify-center rounded-2xl bg-white dark:bg-slate-800">
              <Ionicons name="menu" size={24} color={theme === 'dark' ? '#f8fafc' : '#0f172a'} />
            </Pressable>

            <Text className="font-jetbrains text-base font-semibold text-slate-900 dark:text-slate-100">
              {messages.find((message) => message.role === 'user')?.content.slice(0, 24) ||
                'New chat'}
            </Text>

            <View className="w-11" />
          </View>

          <ScrollView
            className="flex-1"
            contentContainerClassName="gap-3 pb-4"
            showsVerticalScrollIndicator={false}>
            {messages.map((message) => {
              const chunks =
                message.role === 'assistant' && (message.kind ?? 'text') === 'text'
                  ? parseStyledPrompt(message.content)
                  : [{ text: message.content, weight: 'regular' as const }];
              const isImageMessage = (message.kind ?? 'text') === 'image' && !!message.imageUrl;

              return (
                <View
                  key={message.id}
                  className={
                    message.role === 'user'
                      ? 'max-w-[88%] self-end rounded-2xl bg-purple-600 p-3'
                      : 'max-w-[88%] self-start rounded-2xl bg-gray-200 p-3 dark:bg-slate-800'
                  }>
                  {isImageMessage ? (
                    <View className="flex w-full items-end gap-3">
                      <Image
                        source={{ uri: message.imageUrl }}
                        className="h-64 w-64 rounded-2xl bg-slate-200"
                        resizeMode="cover"
                      />
                      <ShareImageButton imageUrl={message.imageUrl} />
                    </View>
                  ) : (
                    <Text
                      className={
                        message.role === 'user'
                          ? 'font-jetbrains text-white'
                          : 'font-jetbrains text-black dark:text-slate-100'
                      }>
                      {chunks.map((chunk, index) => (
                        <Text
                          key={`${message.id}-${index}`}
                          className="font-jetbrains"
                          style={{
                            fontWeight:
                              chunk.weight === 'bold'
                                ? '700'
                                : chunk.weight === 'semibold'
                                  ? '600'
                                  : '400',
                          }}>
                          {chunk.text}
                        </Text>
                      ))}
                    </Text>
                  )}
                </View>
              );
            })}

            {loading ? (
              <View className="self-start rounded-2xl bg-gray-200 px-4 py-3 dark:bg-slate-800">
                <View className="flex-row items-center gap-3">
                  <ActivityIndicator color={theme === 'dark' ? '#cbd5e1' : '#4b5563'} />
                  <Text className="font-jetbrains text-black dark:text-slate-100">
                    {selectedModel === 'google-imagen'
                      ? 'Generating image...'
                      : 'Generating response'}
                  </Text>
                </View>
              </View>
            ) : null}
          </ScrollView>

          <View className="gap-3 pb-3 pt-2">
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => setSelectedModel('gemini-flash')}
                className={`rounded-full px-4 py-2 ${
                  selectedModel === 'gemini-flash' ? 'bg-violet-600' : 'bg-white dark:bg-slate-900'
                }`}>
                <Text
                  className={`font-jetbrains font-semibold ${
                    selectedModel === 'gemini-flash'
                      ? 'text-white'
                      : 'text-slate-700 dark:text-slate-100'
                  }`}>
                  Text
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setSelectedModel('google-imagen')}
                className={`rounded-full px-4 py-2 ${
                  selectedModel === 'google-imagen'
                    ? 'bg-emerald-600'
                    : 'bg-white dark:bg-slate-900'
                }`}>
                <Text
                  className={`font-jetbrains font-semibold ${
                    selectedModel === 'google-imagen'
                      ? 'text-white'
                      : 'text-slate-700 dark:text-slate-100'
                  }`}>
                  Image
                </Text>
              </Pressable>
            </View>

            <View className="flex-row gap-2">
              <TextInput
                placeholder={
                  selectedModel === 'google-imagen'
                    ? 'Describe the image you want'
                    : 'Write something'
                }
                placeholderTextColor={theme === 'dark' ? '#64748b' : '#9ca3af'}
                value={text}
                onChangeText={setText}
                autoCapitalize="sentences"
                className="font-jetbrains w-[85%] rounded-xl border-2 border-gray-200 bg-white px-4 py-3.5 text-gray-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
              <PurpleGlassButton
                onPress={handleSend}
                iconName={selectedModel === 'google-imagen' ? 'image' : 'send'}
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
