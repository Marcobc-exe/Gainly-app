import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';

import { IconoCalendario, IconoHoy, IconoPerfil } from '@/components/Iconos';
import { colors } from '@/theme/colors';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.texto,
        tabBarInactiveTintColor: colors.textoTenue,
        tabBarStyle: {
          backgroundColor: colors.superficie,
          borderTopColor: colors.borde,
          borderTopWidth: StyleSheet.hairlineWidth,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        sceneStyle: { backgroundColor: colors.fondo },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Hoy', tabBarIcon: ({ color }) => <IconoHoy color={color as string} /> }}
      />
      <Tabs.Screen
        name="calendario"
        options={{ title: 'Calendario', tabBarIcon: ({ color }) => <IconoCalendario color={color as string} /> }}
      />
      <Tabs.Screen
        name="perfil"
        options={{ title: 'Perfil', tabBarIcon: ({ color }) => <IconoPerfil color={color as string} /> }}
      />
    </Tabs>
  );
}
