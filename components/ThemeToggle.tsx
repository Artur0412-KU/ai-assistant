import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from 'contexts/ThemeContext';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

type Props = {
  compact?: boolean;
};

export default function ThemeToggle({ compact = false }: Props) {
  const { theme, toggleTheme } = useAppTheme();
  const isDark = theme === 'dark';

  return (
    <Pressable
      onPress={toggleTheme}
      className={`flex-row items-center rounded-2xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800 ${
        compact ? 'gap-0' : 'gap-2'
      }`}>
      <View className="h-9 w-9 items-center justify-center rounded-xl bg-amber-100 dark:bg-slate-700">
        <Ionicons
          name={isDark ? 'moon' : 'sunny'}
          size={18}
          color={isDark ? '#e2e8f0' : '#b45309'}
        />
      </View>

      {!compact ? (
        <View>
          <Text className="font-jetbrains text-xs font-medium uppercase tracking-[1px] text-slate-500 dark:text-slate-400">
            Theme
          </Text>
          <Text className="font-jetbrains text-sm font-semibold text-slate-900 dark:text-slate-100">
            {isDark ? 'Dark' : 'Light'}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}
