import { Ionicons } from '@expo/vector-icons'
import { Pressable, View } from 'react-native'

type Props = {
  onPress: () => void
  label?: string
  iconName?: keyof typeof Ionicons.glyphMap
}

export function PurpleGlassButton({ onPress, iconName = 'send' }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        borderRadius: 999,
        overflow: 'hidden',
        alignSelf: 'center',
        transform: [{ scale: pressed ? 0.96 : 1 }],
      })}
    >
      <View className='p-4 bg-purple-600 rounded-full'>
        <Ionicons name={iconName} color='white'/>
      </View>
        
    </Pressable>
  )
}
