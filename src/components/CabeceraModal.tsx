import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { IconoCerrar, IconoFlecha } from '@/components/Iconos';
import { espacio, type Paleta } from '@/theme/colors';
import { useEstilos, useTema } from '@/theme/TemaProvider';

export function CabeceraModal({ titulo, tipo = 'cerrar' }: { titulo: string; tipo?: 'cerrar' | 'atras' }) {
  const { tipografia } = useTema();
  const styles = useEstilos(crearEstilos);
  return (
    <View style={styles.cabecera}>
      {tipo === 'atras' ? <Volver /> : null}
      <Text style={[tipografia.subtitulo, { flex: 1 }]}>{titulo}</Text>
      {tipo === 'cerrar' ? <Volver cerrar /> : null}
    </View>
  );
}

function Volver({ cerrar }: { cerrar?: boolean }) {
  const styles = useEstilos(crearEstilos);
  return (
    <Pressable
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      hitSlop={12}
      style={styles.boton}
      accessibilityLabel={cerrar ? 'Cerrar' : 'Volver'}
    >
      {cerrar ? <IconoCerrar /> : <IconoFlecha dir="izq" />}
    </Pressable>
  );
}

const crearEstilos = (colors: Paleta) =>
  StyleSheet.create({
  cabecera: { flexDirection: 'row', alignItems: 'center', gap: espacio.md },
  boton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.superficieAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
