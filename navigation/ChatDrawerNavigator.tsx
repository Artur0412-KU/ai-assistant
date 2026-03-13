import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import ChatDrawerContent from 'components/ChatDrawerContent';
import { useAppTheme } from 'contexts/ThemeContext';
import ChatScreen from 'pages/ChatScreen';

export type ChatDrawerParamList = {
  Chat: {
    chatId?: string;
  };
};

const Drawer = createDrawerNavigator<ChatDrawerParamList>();

export default function ChatDrawerNavigator() {
  const { theme } = useAppTheme();

  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
        overlayColor:
          theme === 'dark' ? 'rgba(2, 6, 23, 0.62)' : 'rgba(15, 23, 42, 0.18)',
        drawerStyle: {
          width: 300,
          backgroundColor: theme === 'dark' ? '#020617' : '#f8fafc',
        },
      }}
      drawerContent={(props) => <ChatDrawerContent {...props} />}
    >
      <Drawer.Screen name="Chat" component={ChatScreen} />
    </Drawer.Navigator>
  );
}
