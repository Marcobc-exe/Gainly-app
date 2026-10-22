import TopTabs from 'expo-router/js-top-tabs';
import type { ComponentProps } from 'react';
import { View } from 'react-native';

import { BarraPestanas } from '@/components/BarraPestanas';
import { useTema } from '@/theme/TemaProvider';

/** Pestañas principales: se cambia deslizando el contenido a izquierda/derecha o tocando la barra. */
export default function TabsLayout() {
  const { colors } = useTema();
  return (
    <TopTabs
      tabBarPosition="bottom"
      tabBar={(props: ComponentProps<typeof BarraPestanas>) => <BarraPestanas {...props} />}
      screenOptions={{
        swipeEnabled: true,
        animationEnabled: true,
        lazy: true,
        lazyPlaceholder: () => <View style={{ flex: 1, backgroundColor: colors.fondo }} />,
        sceneStyle: { backgroundColor: colors.fondo },
      }}
    >
      <TopTabs.Screen name="index" options={{ title: 'Hoy' }} />
      <TopTabs.Screen name="calendario" options={{ title: 'Calendario' }} />
      <TopTabs.Screen name="perfil" options={{ title: 'Perfil' }} />
    </TopTabs>
  );
}
