import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from 'data/supabase';

export type ChatSummary = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  isCustomTitle?: boolean;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  kind?: 'text' | 'image';
  content: string;
  createdAt: string;
  imageUrl?: string;
  model?: 'gemini-flash' | 'google-imagen';
};

type RemoteMessageRow = {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  created_at: string;
  image_url?: string | null;
};

const CHAT_LIST_STORAGE_KEY = 'chat:list';
const CHAT_MESSAGES_STORAGE_PREFIX = 'chat:messages:';
const CHAT_ID_ALIASES_STORAGE_KEY = 'chat:id-aliases';
const IMAGE_MESSAGE_PREFIX = '__image_message__:';

function buildMessageStorageKey(chatId: string) {
  return `${CHAT_MESSAGES_STORAGE_PREFIX}${chatId}`;
}

function buildDefaultTitle(index: number) {
  return `New chat ${index}`;
}

function createId() {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const random = Math.floor(Math.random() * 16);
    const value = character === 'x' ? random : (random & 0x3) | 0x8;

    return value.toString(16);
  });
}

function createMessageId() {
  return createId();
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function normalizeMessage(message: ChatMessage): ChatMessage {
  return {
    ...message,
    id: isUuid(message.id) ? message.id : createMessageId(),
    kind: message.kind ?? (message.imageUrl ? 'image' : 'text'),
  };
}

function serializeMessageContent(message: ChatMessage) {
  const normalizedMessage = normalizeMessage(message);

  if (normalizedMessage.kind !== 'image' || !normalizedMessage.imageUrl) {
    return normalizedMessage.content;
  }

  return `${IMAGE_MESSAGE_PREFIX}${JSON.stringify({
    content: normalizedMessage.content,
    imageUrl: normalizedMessage.imageUrl,
    model: normalizedMessage.model ?? 'google-imagen',
  })}`;
}

function deserializeMessageContent(content: string) {
  if (!content.startsWith(IMAGE_MESSAGE_PREFIX)) {
    return {
      kind: 'text' as const,
      content,
    };
  }

  try {
    const payload = JSON.parse(content.slice(IMAGE_MESSAGE_PREFIX.length)) as {
      content?: string;
      imageUrl?: string;
      model?: ChatMessage['model'];
    };

    return {
      kind: 'image' as const,
      content: payload.content ?? 'Generated image',
      imageUrl: payload.imageUrl,
      model: payload.model ?? 'google-imagen',
    };
  } catch {
    return {
      kind: 'text' as const,
      content,
    };
  }
}

function mapRemoteRoleToChatRole(role: string): ChatMessage['role'] {
  if (role === 'user') {
    return 'user';
  }

  return 'assistant';
}

function mapChatRoleToRemoteRole(role: ChatMessage['role']) {
  return role === 'assistant' ? 'model' : 'user';
}

function buildTitleFromMessages(messages: ChatMessage[], fallbackTitle: string) {
  const firstUserMessage = messages.find(
    (message) => message.role === 'user' && (message.kind ?? 'text') === 'text',
  );

  if (!firstUserMessage) {
    return fallbackTitle;
  }

  const trimmed = firstUserMessage.content.trim();

  if (!trimmed) {
    return fallbackTitle;
  }

  return trimmed.length > 32 ? `${trimmed.slice(0, 32)}...` : trimmed;
}

async function saveChats(chats: ChatSummary[]) {
  const sorted = [...chats].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  await AsyncStorage.setItem(CHAT_LIST_STORAGE_KEY, JSON.stringify(sorted));
}

function normalizeChatSummary(chat: ChatSummary) {
  return {
    ...chat,
    isCustomTitle: chat.isCustomTitle ?? false,
  };
}

async function getChatIdAliases() {
  const raw = await AsyncStorage.getItem(CHAT_ID_ALIASES_STORAGE_KEY);

  if (!raw) {
    return {} as Record<string, string>;
  }

  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

async function saveChatIdAliases(aliases: Record<string, string>) {
  await AsyncStorage.setItem(CHAT_ID_ALIASES_STORAGE_KEY, JSON.stringify(aliases));
}

async function getLocalMessages(chatId: string) {
  const raw = await AsyncStorage.getItem(buildMessageStorageKey(chatId));

  if (!raw) {
    return [] as ChatMessage[];
  }

  try {
    return (JSON.parse(raw) as ChatMessage[]).map(normalizeMessage);
  } catch {
    return [] as ChatMessage[];
  }
}

async function saveLocalMessages(chatId: string, messages: ChatMessage[]) {
  await AsyncStorage.setItem(
    buildMessageStorageKey(chatId),
    JSON.stringify(messages.map(normalizeMessage)),
  );
}

function mapRemoteMessage(row: RemoteMessageRow): ChatMessage {
  const parsedContent = deserializeMessageContent(row.content);
  const imageUrl = row.image_url ?? parsedContent.imageUrl;
  const kind = imageUrl ? 'image' : parsedContent.kind;

  return {
    id: row.id,
    role: mapRemoteRoleToChatRole(row.role),
    content: parsedContent.content,
    createdAt: row.created_at,
    kind,
    imageUrl,
    model: parsedContent.model,
  };
}

function mapChatMessageToRemote(chatId: string, message: ChatMessage): RemoteMessageRow {
  const normalizedMessage = normalizeMessage(message);

  return {
    id: normalizedMessage.id,
    conversation_id: chatId,
    role: mapChatRoleToRemoteRole(normalizedMessage.role),
    content:
      normalizedMessage.kind === 'image' ? normalizedMessage.content : serializeMessageContent(normalizedMessage),
    created_at: normalizedMessage.createdAt,
    image_url: normalizedMessage.imageUrl ?? null,
  };
}

async function getRemoteMessages(chatId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('id, conversation_id, role, content, created_at, image_url')
    .eq('conversation_id', chatId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to load messages', error);
    return null;
  }

  return (data ?? []).map((row) => mapRemoteMessage(row as RemoteMessageRow));
}

async function replaceRemoteMessages(chatId: string, messages: ChatMessage[]) {
  const normalizedMessages = messages.map(normalizeMessage);

  const { error: deleteError } = await supabase
    .from('messages')
    .delete()
    .eq('conversation_id', chatId);

  if (deleteError) {
    console.error('Failed to clear messages', deleteError);
    return;
  }

  if (normalizedMessages.length === 0) {
    return;
  }

  const { error: insertError } = await supabase
    .from('messages')
    .insert(normalizedMessages.map((message) => mapChatMessageToRemote(chatId, message)));

  if (insertError) {
    console.error('Failed to sync messages', insertError);
  }
}

async function removeRemoteMessages(chatId: string) {
  const { error } = await supabase.from('messages').delete().eq('conversation_id', chatId);

  if (error) {
    console.error('Failed to delete messages', error);
  }
}

async function migrateLegacyChatIds(chats: ChatSummary[]) {
  const aliases = await getChatIdAliases();
  let hasChanges = false;

  const migratedChats = await Promise.all(
    chats.map(async (chat) => {
      if (isUuid(chat.id)) {
        return chat;
      }

      const migratedId = aliases[chat.id] ?? createId();
      const oldMessageStorageKey = buildMessageStorageKey(chat.id);
      const nextMessageStorageKey = buildMessageStorageKey(migratedId);
      const storedMessages = await AsyncStorage.getItem(oldMessageStorageKey);

      if (storedMessages) {
        await AsyncStorage.setItem(nextMessageStorageKey, storedMessages);
        await AsyncStorage.removeItem(oldMessageStorageKey);
      }

      aliases[chat.id] = migratedId;
      hasChanges = true;

      return {
        ...chat,
        id: migratedId,
      };
    }),
  );

  if (hasChanges) {
    await saveChats(migratedChats);
    await saveChatIdAliases(aliases);
  }

  return migratedChats;
}

export async function resolveChatId(chatId: string) {
  const aliases = await getChatIdAliases();

  return aliases[chatId] ?? chatId;
}

export async function getChats() {
  const raw = await AsyncStorage.getItem(CHAT_LIST_STORAGE_KEY);

  const getLocalChats = async () => {
    if (!raw) {
      return [] as ChatSummary[];
    }

    try {
      const parsed = JSON.parse(raw) as ChatSummary[];
      const migratedChats = await migrateLegacyChatIds(parsed);

      return migratedChats
        .map(normalizeChatSummary)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    } catch {
      return [] as ChatSummary[];
    }
  };

  const userId = await getCurrentUserId();

  if (!userId) {
    return getLocalChats();
  }

  const { data, error } = await supabase
    .from('conversations')
    .select('id, title, created_at, last_message_at')
    .eq('user_id', userId)
    .order('last_message_at', { ascending: false });

  if (error) {
    console.error('Failed to load conversations', error);
    return getLocalChats();
  }

  const localChats = await getLocalChats();
  const localChatMap = new Map(localChats.map((chat) => [chat.id, chat]));

  const remoteChats: ChatSummary[] = (data ?? []).map((chat) => ({
    id: chat.id,
    title: chat.title ?? localChatMap.get(chat.id)?.title ?? buildDefaultTitle(1),
    createdAt: chat.created_at ?? localChatMap.get(chat.id)?.createdAt ?? new Date().toISOString(),
    updatedAt:
      chat.last_message_at ??
      localChatMap.get(chat.id)?.updatedAt ??
      chat.created_at ??
      new Date().toISOString(),
    isCustomTitle: localChatMap.get(chat.id)?.isCustomTitle ?? false,
  }));

  await saveChats(remoteChats);

  return remoteChats;
}

async function getCurrentUserId() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.user?.id ?? null;
}

async function syncConversation(chat: ChatSummary) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return;
  }

  const { error } = await supabase.from('conversations').upsert(
    {
      id: chat.id,
      user_id: userId,
      title: chat.title,
      last_message_at: chat.updatedAt,
      created_at: chat.createdAt,
    },
    {
      onConflict: 'id',
    },
  );

  if (error) {
    console.error('Failed to sync conversation', error);
  }
}

async function removeConversation(chatId: string) {
  const userId = await getCurrentUserId();
  const resolvedChatId = await resolveChatId(chatId);

  if (!userId) {
    return;
  }

  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', resolvedChatId)
    .eq('user_id', userId);

  if (error) {
    console.error('Failed to delete conversation', error);
  }
}

export async function createChat() {
  const chats = await getChats();
  const timestamp = new Date().toISOString();
  const chat: ChatSummary = {
    id: createId(),
    title: buildDefaultTitle(chats.length + 1),
    createdAt: timestamp,
    updatedAt: timestamp,
    isCustomTitle: false,
  };

  await saveChats([chat, ...chats]);
  await AsyncStorage.setItem(buildMessageStorageKey(chat.id), JSON.stringify([]));
  await syncConversation(chat);

  return chat;
}

export async function getMessages(chatId: string) {
  const resolvedChatId = await resolveChatId(chatId);
  const localMessages = await getLocalMessages(resolvedChatId);
  const userId = await getCurrentUserId();

  if (!userId) {
    return localMessages;
  }

  const remoteMessages = await getRemoteMessages(resolvedChatId);

  if (remoteMessages === null) {
    return localMessages;
  }

  if (remoteMessages.length > 0) {
    await saveLocalMessages(resolvedChatId, remoteMessages);
    return remoteMessages;
  }

  if (localMessages.length > 0) {
    await replaceRemoteMessages(resolvedChatId, localMessages);
  }

  return localMessages;
}

async function persistMessages(chatId: string, messages: ChatMessage[]) {
  const normalizedMessages = messages.map(normalizeMessage);

  await saveLocalMessages(chatId, normalizedMessages);

  const userId = await getCurrentUserId();

  if (!userId) {
    return;
  }

  await replaceRemoteMessages(chatId, normalizedMessages);
}

export async function saveMessages(chatId: string, messages: ChatMessage[]) {
  const resolvedChatId = await resolveChatId(chatId);

  await persistMessages(resolvedChatId, messages);

  const chats = await getChats();
  const existingChat = chats.find((chat) => chat.id === resolvedChatId);
  const timestamp = new Date().toISOString();
  const fallbackTitle = existingChat?.title ?? buildDefaultTitle(chats.length + 1);
  const nextTitle = existingChat?.isCustomTitle
    ? existingChat.title
    : buildTitleFromMessages(messages, fallbackTitle);

  const nextChat: ChatSummary = {
    id: resolvedChatId,
    title: nextTitle,
    createdAt: existingChat?.createdAt ?? timestamp,
    updatedAt: timestamp,
    isCustomTitle: existingChat?.isCustomTitle ?? false,
  };

  const filteredChats = chats.filter((chat) => chat.id !== resolvedChatId);
  await saveChats([nextChat, ...filteredChats]);
  await syncConversation(nextChat);
}

export async function renameChat(chatId: string, title: string) {
  const nextTitle = title.trim();
  const resolvedChatId = await resolveChatId(chatId);

  if (!nextTitle) {
    return null;
  }

  const chats = await getChats();
  const existingChat = chats.find((chat) => chat.id === resolvedChatId);

  if (!existingChat) {
    return null;
  }

  const updatedChat: ChatSummary = {
    ...existingChat,
    title: nextTitle,
    updatedAt: new Date().toISOString(),
    isCustomTitle: true,
  };

  const filteredChats = chats.filter((chat) => chat.id !== resolvedChatId);
  await saveChats([updatedChat, ...filteredChats]);
  await syncConversation(updatedChat);

  return updatedChat;
}

export async function deleteChat(chatId: string) {
  const resolvedChatId = await resolveChatId(chatId);
  const chats = await getChats();
  const nextChats = chats.filter((chat) => chat.id !== resolvedChatId);

  await saveChats(nextChats);
  await AsyncStorage.removeItem(buildMessageStorageKey(resolvedChatId));
  await removeRemoteMessages(resolvedChatId);
  await removeConversation(resolvedChatId);
}
