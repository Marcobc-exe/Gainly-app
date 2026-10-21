import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { IconoBasurero, IconoLapiz } from '@/components/Iconos';
import { unidadDe } from '@/data/medidas';
import { colors, espacio, tipografia } from '@/theme/colors';
import type { Alimento } from '@/types';

/** Ancho de cada botón (Editar, Eliminar) cuando la casilla queda abierta. */
const ANCHO_BOTON = 80;
const ANCHO_ACCIONES = ANCHO_BOTON * 2;
/** Fracción del ancho a partir de la cual soltar elimina directamente. */
const FRACCION_ELIMINAR = 0.6;
const DURACION = 200;

interface Props {
  alimento: Alimento;
  /** El padre cierra la casilla poniendo esto en false (solo una abierta a la vez). */
  abierta: boolean;
  onAbrir: () => void;
  onCerrar: () => void;
  onElegir: () => void;
  onEditar: () => void;
  onEliminar: () => void;
}

/**
 * Producto de la lista. Deslizar a la izquierda muestra Editar y Eliminar;
 * deslizar hasta el final pone la casilla roja y pide eliminar.
 */
export function FilaAlimentoDeslizable({ alimento, abierta, onAbrir, onCerrar, onElegir, onEditar, onEliminar }: Props) {
  const x = useSharedValue(0);
  const inicio = useSharedValue(0);
  const ancho = useSharedValue(360);
  const opacidad = useSharedValue(1);

  useEffect(() => {
    if (!abierta) x.set(withTiming(0, { duration: DURACION }));
  }, [abierta, x]);

  const pan = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .failOffsetY([-10, 10])
    .onStart(() => {
      inicio.set(x.get());
    })
    .onUpdate((e) => {
      x.set(Math.min(0, Math.max(-ancho.get(), inicio.get() + e.translationX)));
    })
    .onEnd((e) => {
      const recorrido = -x.get();
      if (recorrido > ancho.get() * FRACCION_ELIMINAR) {
        x.set(withTiming(-ancho.get(), { duration: DURACION }));
        scheduleOnRN(onEliminar);
      } else if (recorrido > ANCHO_BOTON || e.velocityX < -600) {
        x.set(withTiming(-ANCHO_ACCIONES, { duration: DURACION }));
        scheduleOnRN(onAbrir);
      } else {
        x.set(withTiming(0, { duration: DURACION }));
        scheduleOnRN(onCerrar);
      }
    });

  // Toque como gesto (no Pressable) para que soltar tras arrastrar nunca cuente como toque.
  const alTocar = () => (abierta ? onCerrar() : onElegir());
  const tap = Gesture.Tap()
    .maxDistance(10)
    .onBegin(() => {
      opacidad.set(0.6);
    })
    .onFinalize(() => {
      opacidad.set(1);
    })
    .onEnd((_e, exito) => {
      if (exito) scheduleOnRN(alTocar);
    });
  const gesto = Gesture.Race(pan, tap);

  const estiloFila = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() }] }));
  const estiloItem = useAnimatedStyle(() => ({ opacity: opacidad.get() }));

  // La casilla se tiñe de rojo al pasar de los dos botones hacia el borde.
  const estiloRojo = useAnimatedStyle(() => ({
    opacity: interpolate(
      -x.get(),
      [ANCHO_ACCIONES, ancho.get() * FRACCION_ELIMINAR],
      [0, 0.85],
      Extrapolation.CLAMP,
    ),
  }));

  // Hasta 160 px los dos botones se reparten el hueco; después Editar se encoge y Eliminar lo ocupa todo.
  const estiloEditar = useAnimatedStyle(() => {
    const visible = -x.get();
    const w = visible <= ANCHO_ACCIONES ? visible / 2 : Math.max(0, ANCHO_BOTON - (visible - ANCHO_ACCIONES));
    return { width: w };
  });
  const estiloEliminar = useAnimatedStyle(() => {
    const visible = -x.get();
    const editar = visible <= ANCHO_ACCIONES ? visible / 2 : Math.max(0, ANCHO_BOTON - (visible - ANCHO_ACCIONES));
    return { width: Math.max(0, visible - editar) };
  });

  const esLiquido = unidadDe(alimento) === 'ml';

  return (
    <View
      style={styles.contenedor}
      onLayout={(e) => {
        ancho.set(e.nativeEvent.layout.width);
      }}
    >
      <View
        style={styles.acciones}
        // Con lector de pantalla se usan las acciones accesibles de la fila.
        accessibilityElementsHidden={!abierta}
        importantForAccessibility={abierta ? 'auto' : 'no-hide-descendants'}
      >
        <Animated.View style={[styles.accion, { backgroundColor: colors.acento }, estiloEditar]}>
          <Pressable onPress={onEditar} style={styles.botonAccion} accessibilityLabel={`Editar ${alimento.nombre}`}>
            <IconoLapiz color={colors.sobreAcento} />
            <Text style={styles.textoAccion}>Editar</Text>
          </Pressable>
        </Animated.View>
        <Animated.View style={[styles.accion, { backgroundColor: colors.peligro }, estiloEliminar]}>
          <Pressable onPress={onEliminar} style={styles.botonAccion} accessibilityLabel={`Eliminar ${alimento.nombre}`}>
            <IconoBasurero color={colors.sobreAcento} />
            <Text style={styles.textoAccion}>Eliminar</Text>
          </Pressable>
        </Animated.View>
      </View>

      <GestureDetector gesture={gesto}>
        <Animated.View style={[styles.fila, estiloFila]}>
          <Animated.View
            style={[styles.item, estiloItem]}
            accessible
            accessibilityRole="button"
            accessibilityLabel={alimento.nombre}
            accessibilityHint="Toca para registrar; desliza a la izquierda para editar o eliminar"
            accessibilityActions={[
              { name: 'activate' },
              { name: 'editar', label: 'Editar' },
              { name: 'eliminar', label: 'Eliminar' },
            ]}
            onAccessibilityAction={(e) => {
              if (e.nativeEvent.actionName === 'activate') onElegir();
              if (e.nativeEvent.actionName === 'editar') onEditar();
              if (e.nativeEvent.actionName === 'eliminar') onEliminar();
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={tipografia.cuerpo} numberOfLines={1}>
                {alimento.nombre}
              </Text>
              <Text style={tipografia.secundario}>
                {alimento.categoria}
                {alimento.origen === 'modificado' ? ' · modificado' : ''}
              </Text>
            </View>
            <Text style={tipografia.secundario}>
              P {alimento.proteinaPor100g} · C {alimento.carbosPor100g}
              {esLiquido ? ' /100 ml' : ''}
            </Text>
          </Animated.View>
          <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.rojo, estiloRojo]} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { overflow: 'hidden' },
  acciones: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, flexDirection: 'row', justifyContent: 'flex-end' },
  accion: { overflow: 'hidden' },
  botonAccion: { flex: 1, minWidth: ANCHO_BOTON, alignItems: 'center', justifyContent: 'center', gap: 2 },
  textoAccion: { color: colors.sobreAcento, fontSize: 12, fontWeight: '600' },
  fila: { backgroundColor: colors.fondo },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: espacio.md },
  rojo: { backgroundColor: colors.peligro },
});
