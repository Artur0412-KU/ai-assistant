import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  Theme as NavigationTheme,
} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAppTheme } from 'contexts/ThemeContext';
import { supabase } from 'data/supabase';
import { StatusBar } from 'expo-status-bar';
import LogIn from 'pages/LogIn';
import Register from 'pages/Register';
import ChatDrawerNavigator from 'navigation/ChatDrawerNavigator';
import React, { useEffect, useMemo, useState } from 'react';

export type RootStackParamList = {
  Home: undefined;
  Register: undefined;
  Login: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    const [route, setRoute] = useState<'Home' | 'Login' | null>(null);
    const { isReady, theme } = useAppTheme();

    const navigationTheme = useMemo<NavigationTheme>(() => {
      const baseTheme = theme === 'dark' ? DarkTheme : DefaultTheme;

      return {
        ...baseTheme,
        colors: {
          ...baseTheme.colors,
          background: theme === 'dark' ? '#020617' : '#f8fafc',
          card: theme === 'dark' ? '#0f172a' : '#ffffff',
          border: theme === 'dark' ? '#1e293b' : '#e2e8f0',
          primary: '#8b5cf6',
          text: theme === 'dark' ? '#f8fafc' : '#0f172a',
        },
      };
    }, [theme]);

    useEffect(() => {
        const fetchSession = async () => {
        const {data, error} = await supabase.auth.getSession()
        console.log('data', data.session?.access_token)
        if (error) {
            return
        }
        const hasToken = !!data.session?.access_token;
        setRoute(hasToken ? 'Home' : 'Login');
        }
        fetchSession()
    },[])

    if (!isReady || route === null) {
      return null; 
    }
    return (
        <>
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        <NavigationContainer theme={navigationTheme}>
          <Stack.Navigator initialRouteName={route}>
            <Stack.Screen name="Home" component={ChatDrawerNavigator} options={{ headerShown: true, headerTitle: '', headerTransparent: true, headerLeft: () => null }}/>
            <Stack.Screen name="Register" component={Register} options={{headerShown: false}}/>
            <Stack.Screen name='Login' component={LogIn} options={{headerShown: false}}/>
          </Stack.Navigator>
        </NavigationContainer>
        </>
      );
    }
