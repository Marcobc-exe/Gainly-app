import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { IconoCerrar, IconoFlecha } from '@/components/Iconos';
import { colors, espacio, tipografia } from '@/theme/colors';

export function CabeceraModal({ titulo, tipo = 'cerrar' }: { titulo: string; tipo?: 'cerrar' | 'atras' }) {
  return (
    <View style={styles.cabecera}>
      {tipo === 'atras' ? <Volver /> : null}
      <Text style={[tipografia.subtitulo, { flex: 1 }]}>{titulo}</Text>
      {tipo === 'cerrar' ? <Volver cerrar /> : null}
    </View>
  );
}

function Volver({ cerrar }: { cerrar?: boolean }) {
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

const styles = StyleSheet.create({
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
