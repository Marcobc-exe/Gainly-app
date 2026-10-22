import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useApp, useHidratado, usePerfil } from '@/store/useApp';
import { TemaProvider, useTema } from '@/theme/TemaProvider';

export default function RootLayout() {
  return (
    <TemaProvider>
      <Contenido />
    </TemaProvider>
  );
}

function Contenido() {
  const { colors, esOscuro } = useTema();
  const hidratado = useHidratado();
  const sesion = useApp((s) => s.sesion);
  const perfil = usePerfil();

  if (!hidratado) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.fondo }}>
        <ActivityIndicator color={colors.textoSecundario} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style={esOscuro ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.fondo } }}>
          <Stack.Protected guard={!sesion}>
            <Stack.Screen name="login" />
          </Stack.Protected>
          <Stack.Protected guard={!!sesion && !perfil}>
            <Stack.Screen name="onboarding" />
          </Stack.Protected>
          <Stack.Protected guard={!!sesion && !!perfil}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="agregar-comida" options={{ presentation: 'modal' }} />
            <Stack.Screen name="alimento-nuevo" options={{ presentation: 'modal' }} />
            <Stack.Screen name="editar-alimento" options={{ presentation: 'modal' }} />
            <Stack.Screen name="editar-perfil" />
          </Stack.Protected>
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
