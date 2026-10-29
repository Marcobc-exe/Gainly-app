import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState, type ComponentType } from 'react';
import { Animated, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconoCalendario, IconoHoy, IconoPerfil } from '@/components/Iconos';
import { type Paleta } from '@/theme/colors';
import { useEstilos, useTema } from '@/theme/TemaProvider';

const ICONOS: Record<string, ComponentType<{ color?: string; tamano?: number }>> = {
  index: IconoHoy,
  calendario: IconoCalendario,
  perfil: IconoPerfil,
};

const ANCHO_PILDORA = 64;
const ALTO_PILDORA = 34;

interface Ruta {
  key: string;
  name: string;
}

interface Props {
  state: { index: number; routes: Ruta[] };
  descriptors: Record<string, { options: { title?: string } }>;
  /** Eventos del navegador (SDK 58): se emite `tabPress` antes de cambiar de pestaña. */
  emitter: {
    emit: (e: { type: 'tabPress'; target: string; canPreventDefault: true }) => { defaultPrevented: boolean };
  };
  /** Cambia a la pestaña con esa clave de ruta (con animación del pager). */
  navigateToTab: (routeKey: string) => void;
  /** Posición continua del pager (0 = primera pestaña); sigue al dedo al deslizar. */
  position: Animated.AnimatedInterpolation<number>;
}

/**
 * Barra inferior: una píldora marca la pestaña activa y se desliza siguiendo el gesto
 * del pager; el icono dentro de la píldora se invierte con un fundido.
 */
export function BarraPestanas({ state, descriptors, emitter, navigateToTab, position }: Props) {
  const { colors } = useTema();
  const styles = useEstilos(crearEstilos);
  const { bottom } = useSafeAreaInsets();
  const [ancho, setAncho] = useState(0);
  const total = state.routes.length;
  const anchoItem = ancho / total;
  const indices = state.routes.map((_, i) => i);

  // Vibración suave al cambiar de pestaña (por toque o por gesto).
  const anterior = useRef(state.index);
  useEffect(() => {
    if (anterior.current !== state.index && Platform.OS !== 'web') {
      Haptics.selectionAsync().catch(() => {});
    }
    anterior.current = state.index;
  }, [state.index]);

  const desplazamiento =
    ancho > 0
      ? position.interpolate({
          inputRange: indices,
          outputRange: indices.map((i) => i * anchoItem + (anchoItem - ANCHO_PILDORA) / 2),
          extrapolate: 'clamp',
        })
      : 0;

  return (
    <View
      style={[styles.barra, { paddingBottom: Math.max(bottom, 8) }]}
      accessibilityRole="tablist"
      onLayout={(e) => setAncho(e.nativeEvent.layout.width)}
    >
      {ancho > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.pildora, { transform: [{ translateX: desplazamiento }] }]}
        />
      ) : null}

      {state.routes.map((ruta, i) => {
        const enfocada = state.index === i;
        const titulo = descriptors[ruta.key]?.options.title ?? ruta.name;
        const Icono = ICONOS[ruta.name] ?? IconoHoy;
        // 1 cuando la píldora está sobre esta pestaña, 0 cuando está en la vecina.
        const cercania = position.interpolate({
          inputRange: [i - 1, i, i + 1],
          outputRange: [0, 1, 0],
          extrapolate: 'clamp',
        });
        const lejania = position.interpolate({
          inputRange: [i - 1, i, i + 1],
          outputRange: [1, 0, 1],
          extrapolate: 'clamp',
        });
        const opacidadEtiqueta = position.interpolate({
          inputRange: [i - 1, i, i + 1],
          outputRange: [0.75, 1, 0.75],
          extrapolate: 'clamp',
        });

        return (
          <ItemPestana
            key={ruta.key}
            titulo={titulo}
            enfocada={enfocada}
            onPress={() => {
              const evento = emitter.emit({ type: 'tabPress', target: ruta.key, canPreventDefault: true });
              if (!enfocada && !evento.defaultPrevented) navigateToTab(ruta.key);
            }}
          >
            <View style={styles.zonaIcono}>
              <Animated.View style={[StyleSheet.absoluteFill, styles.centro, { opacity: lejania }]}>
                <Icono color={colors.textoTenue} />
              </Animated.View>
              <Animated.View style={[StyleSheet.absoluteFill, styles.centro, { opacity: cercania }]}>
                <Icono color={colors.seleccionTexto} />
              </Animated.View>
            </View>
            <Animated.Text
              style={[styles.etiqueta, enfocada && styles.etiquetaActiva, { opacity: opacidadEtiqueta }]}
              numberOfLines={1}
            >
              {titulo}
            </Animated.Text>
          </ItemPestana>
        );
      })}
    </View>
  );
}

function ItemPestana({
  titulo,
  enfocada,
  onPress,
  children,
}: {
  titulo: string;
  enfocada: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) {
  const styles = useEstilos(crearEstilos);
  const [escala] = useState(() => new Animated.Value(1));
  const animar = (valor: number) =>
    Animated.spring(escala, { toValue: valor, useNativeDriver: true, speed: 40, bounciness: 6 }).start();

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => animar(0.94)}
      onPressOut={() => animar(1)}
      style={styles.item}
      accessibilityRole="tab"
      accessibilityLabel={titulo}
      accessibilityState={{ selected: enfocada }}
      aria-selected={enfocada}
    >
      <Animated.View style={[styles.contenidoItem, { transform: [{ scale: escala }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

const crearEstilos = (colors: Paleta) =>
  StyleSheet.create({
    barra: {
      flexDirection: 'row',
      backgroundColor: colors.superficie,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.borde,
      paddingTop: 8,
    },
    pildora: {
      position: 'absolute',
      top: 8,
      left: 0,
      width: ANCHO_PILDORA,
      height: ALTO_PILDORA,
      borderRadius: ALTO_PILDORA / 2,
      backgroundColor: colors.seleccionFondo,
    },
    item: { flex: 1, minHeight: 56, alignItems: 'center' },
    contenidoItem: { alignItems: 'center', gap: 4 },
    zonaIcono: { width: ANCHO_PILDORA, height: ALTO_PILDORA },
    centro: { alignItems: 'center', justifyContent: 'center' },
    etiqueta: { fontSize: 11, fontWeight: '600', color: colors.textoTenue, letterSpacing: 0.2 },
    etiquetaActiva: { fontWeight: '700', color: colors.texto },
  });
