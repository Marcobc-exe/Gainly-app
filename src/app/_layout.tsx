import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { auth } from '@/lib/auth/mockAuth';
import { esIdLocal } from '@/lib/auth/usuario';
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
  // Hasta comprobar la sesión guardada no se dibujan las pantallas: así no se montan
  // las pestañas para desmontarlas un instante después.
  const [sesionComprobada, setSesionComprobada] = useState(!auth.real);

  // Con login real: la sesión simulada antigua pide entrar de verdad, y si el servicio
  // cierra la sesión (o ya no existe) se vuelve al login. Los errores de red no cierran sesión.
  useEffect(() => {
    if (!hidratado || !auth.real) return;
    const actual = useApp.getState().sesion;
    const comprobacion: Promise<boolean> =
      !actual || esIdLocal(actual.id)
        ? Promise.resolve(!actual)
        : // Sin conexión no se bloquea el arranque: tras 2 s se da la sesión por buena.
          Promise.race([auth.haySesion(), new Promise<boolean>((r) => setTimeout(() => r(true), 2000))]);
    comprobacion
      .then((hay) => {
        if (!hay) useApp.getState().setSesion(null);
      })
      .catch(() => {})
      .finally(() => setSesionComprobada(true));
    return auth.escucharCierre(() => useApp.getState().setSesion(null));
  }, [hidratado]);

  if (!hidratado || !sesionComprobada) {
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
