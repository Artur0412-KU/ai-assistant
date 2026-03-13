import React, { useEffect, useState } from 'react';
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  useDrawerStatus,
} from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import ThemeToggle from 'components/ThemeToggle';
import { GestureResponderEvent, Pressable, Text, TextInput, View } from 'react-native';
import {
  ChatSummary,
  createChat,
  deleteChat,
  getChats,
  renameChat,
} from 'services/chat/chatStorage';

export default function ChatDrawerContent({ navigation, state }: DrawerContentComponentProps) {
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const drawerStatus = useDrawerStatus();
  const activeRoute = state.routes[state.index];
  const activeChatId = (activeRoute.params as { chatId?: string } | undefined)?.chatId;

  const loadChats = async () => {
    const storedChats = await getChats();
    setChats(storedChats);
  };

  useEffect(() => {
    loadChats();
  }, [activeChatId]);

  useEffect(() => {
    if (drawerStatus === 'open') {
      loadChats();
    }
  }, [drawerStatus]);

  const handleCreateChat = async () => {
    const chat = await createChat();
    const nextChats = await getChats();
    setChats(nextChats);
    navigation.navigate('Chat', { chatId: chat.id });
    navigation.closeDrawer();
  };

  const handleDeleteChat = async (chatId: string, event?: GestureResponderEvent) => {
    event?.stopPropagation();
    await deleteChat(chatId);
    const nextChats = await getChats();
    setChats(nextChats);

    if (activeChatId === chatId) {
      if (nextChats.length > 0) {
        navigation.navigate('Chat', { chatId: nextChats[0].id });
      } else {
        const chat = await createChat();
        setChats([chat]);
        navigation.navigate('Chat', { chatId: chat.id });
      }
    }
  };

  const handleStartRename = (chat: ChatSummary, event?: GestureResponderEvent) => {
    event?.stopPropagation();
    setEditingChatId(chat.id);
    setDraftTitle(chat.title);
  };

  const handleSaveRename = async (chatId: string, event?: GestureResponderEvent) => {
    event?.stopPropagation();
    const updatedChat = await renameChat(chatId, draftTitle);

    if (!updatedChat) {
      setEditingChatId(null);
      setDraftTitle('');
      return;
    }

    const nextChats = await getChats();
    setChats(nextChats);
    setEditingChatId(null);
    setDraftTitle('');
  };

  const handleCancelRename = (event?: GestureResponderEvent) => {
    event?.stopPropagation();
    setEditingChatId(null);
    setDraftTitle('');
  };

  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  console.log('filteredChats', filteredChats);
  return (
    <DrawerContentScrollView
      className="bg-slate-50 dark:bg-slate-950"
      contentContainerClassName="grow px-4 pt-5 pb-7">
      <View className="gap-[18px]">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="font-jetbrains text-[22px] font-bold text-slate-900 dark:text-slate-100">
              Chats
            </Text>
            <Text className="font-jetbrains mt-1 text-slate-500 dark:text-slate-400">
              Saved to your account
            </Text>
          </View>

          <Pressable
            onPress={handleCreateChat}
            className="h-[42px] w-[42px] items-center justify-center rounded-2xl bg-violet-500">
            <Ionicons name="add" size={22} color="#ffffff" />
          </Pressable>
        </View>

        <TextInput
          placeholder="Search chats"
          placeholderTextColor="#94a3b8"
          className="font-jetbrains rounded-xl border border-slate-300 bg-white px-3 py-2 text-[15px] text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />

        <ThemeToggle />

        <View className="gap-[10px]">
          {filteredChats.map((chat) => {
            const isActive = chat.id === activeChatId;
            const isEditing = chat.id === editingChatId;

            return (
              <Pressable
                key={chat.id}
                onPress={
                  isEditing
                    ? undefined
                    : () => {
                        navigation.navigate('Chat', { chatId: chat.id });
                        navigation.closeDrawer();
                      }
                }
                className={`rounded-[18px] border px-[14px] py-[14px] ${
                  isActive
                    ? 'border-violet-400/50 bg-violet-200/20 dark:bg-violet-500/10'
                    : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                }`}>
                <View className="flex-row items-center justify-between gap-3">
                  <View className="flex-1">
                    {isEditing ? (
                      <TextInput
                        value={draftTitle}
                        onChangeText={setDraftTitle}
                        autoFocus
                        onPressIn={(event) => event.stopPropagation()}
                        onSubmitEditing={(event) => {
                          event.preventDefault();
                          handleSaveRename(chat.id);
                        }}
                        placeholder="Chat title"
                        placeholderTextColor="#94a3b8"
                        className="font-jetbrains rounded-xl border-slate-300 bg-white px-3 py-2 text-[15px] text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                      />
                    ) : (
                      <Text
                        numberOfLines={1}
                        className={`font-jetbrains text-[15px] text-slate-900 dark:text-slate-100 ${
                          isActive ? 'font-bold' : 'font-semibold'
                        }`}>
                        {chat.title}
                      </Text>
                    )}
                    <Text className="font-jetbrains mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {new Date(chat.updatedAt).toLocaleString()}
                    </Text>
                  </View>

                  <View className="flex-row items-center gap-2">
                    {isEditing ? (
                      <>
                        <Pressable
                          hitSlop={10}
                          onPress={(event) => {
                            handleSaveRename(chat.id, event);
                          }}
                          className="h-[34px] w-[34px] items-center justify-center rounded-xl bg-emerald-500">
                          <Ionicons name="checkmark" size={18} color="white" />
                        </Pressable>
                        <Pressable
                          hitSlop={10}
                          onPress={handleCancelRename}
                          className="h-[34px] w-[34px] items-center justify-center rounded-xl bg-slate-500">
                          <Ionicons name="close" size={18} color="white" />
                        </Pressable>
                      </>
                    ) : (
                      <>
                        <Pressable
                          hitSlop={10}
                          onPress={(event) => {
                            handleStartRename(chat, event);
                          }}
                          className="h-[34px] w-[34px] items-center justify-center rounded-xl bg-violet-500">
                          <Ionicons name="pencil-outline" size={16} color="white" />
                        </Pressable>
                        <Pressable
                          hitSlop={10}
                          onPress={(event) => {
                            handleDeleteChat(chat.id, event);
                          }}
                          className="h-[34px] w-[34px] items-center justify-center rounded-xl bg-red-400">
                          <Ionicons name="trash-outline" size={18} color="white" />
                        </Pressable>
                      </>
                    )}
                  </View>
                </View>
              </Pressable>
            );
          })}

          {chats.length === 0 ? (
            <View className="rounded-[18px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <Text className="font-jetbrains text-[15px] font-semibold text-slate-900 dark:text-slate-100">
                No chats yet
              </Text>
              <Text className="font-jetbrains mt-1.5 text-slate-500 dark:text-slate-400">
                Start a new conversation and it will appear here.
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </DrawerContentScrollView>
  );
}
