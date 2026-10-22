import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { type Paleta } from '@/theme/colors';
import { useEstilos, useTema } from '@/theme/TemaProvider';

interface Props {
  titulo: string;
  consumido: number;
  meta: number;
  color: string;
  tamano?: number;
  grosor?: number;
}

export function AnilloProgreso({ titulo, consumido, meta, color, tamano = 150, grosor = 14 }: Props) {
  const { colors } = useTema();
  const styles = useEstilos(crearEstilos);
  const radio = (tamano - grosor) / 2;
  const circunferencia = 2 * Math.PI * radio;
  const pct = meta > 0 ? consumido / meta : 0;
  const [progreso] = useState(() => new Animated.Value(0));
  const [avance, setAvance] = useState(0);

  useEffect(() => {
    const id = progreso.addListener(({ value }) => setAvance(value));
    return () => progreso.removeListener(id);
  }, [progreso]);

  useEffect(() => {
    Animated.timing(progreso, {
      toValue: Math.min(pct, 1),
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [pct, progreso]);

  const offset = circunferencia * (1 - avance);

  const restante = Math.max(0, meta - consumido);

  return (
    <View style={styles.contenedor} accessibilityLabel={`${titulo}: ${Math.round(consumido)} de ${meta} gramos`}>
      <View style={{ width: tamano, height: tamano }}>
        <Svg width={tamano} height={tamano}>
          <Circle
            cx={tamano / 2}
            cy={tamano / 2}
            r={radio}
            stroke={colors.pistaAnillo}
            strokeWidth={grosor}
            fill="none"
          />
          <Circle
            cx={tamano / 2}
            cy={tamano / 2}
            r={radio}
            stroke={color}
            strokeWidth={grosor}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${circunferencia} ${circunferencia}`}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${tamano / 2} ${tamano / 2})`}
          />
        </Svg>
        <View style={[StyleSheet.absoluteFill, styles.centro]}>
          <Text style={styles.porcentaje}>{Math.round(pct * 100)}%</Text>
          <Text style={styles.gramos}>
            {Math.round(consumido)} / {meta} g
          </Text>
        </View>
      </View>
      <Text style={styles.titulo}>{titulo}</Text>
      <Text style={styles.restante}>
        {restante > 0 ? `Faltan ${Math.round(restante)} g` : 'Meta cumplida'}
      </Text>
    </View>
  );
}

const crearEstilos = (colors: Paleta) =>
  StyleSheet.create({
  contenedor: { alignItems: 'center', flex: 1 },
  centro: { alignItems: 'center', justifyContent: 'center' },
  porcentaje: { fontSize: 28, fontWeight: '700', color: colors.texto, letterSpacing: -0.5 },
  gramos: { fontSize: 12, color: colors.textoSecundario, marginTop: 2 },
  titulo: { marginTop: 10, fontSize: 15, fontWeight: '600', color: colors.texto },
  restante: { fontSize: 12, color: colors.textoSecundario, marginTop: 2 },
});
