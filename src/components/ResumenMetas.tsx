import { StyleSheet, Text, View } from 'react-native';

import { Separador, Tarjeta } from '@/components/ui';
import type { Desglose } from '@/lib/objetivos';
import { espacio, type Paleta } from '@/theme/colors';
import { useEstilos, useTema } from '@/theme/TemaProvider';

export function ResumenMetas({ desglose }: { desglose: Desglose }) {
  const { colors } = useTema();
  const styles = useEstilos(crearEstilos);
  return (
    <Tarjeta style={{ gap: espacio.md }}>
      <View style={styles.fila}>
        <Meta titulo="Proteínas" valor={desglose.proteina} color={colors.proteina} />
        <Meta titulo="Carbohidratos" valor={desglose.carbos} color={colors.carbos} />
      </View>
      <Separador />
      <Linea texto="Metabolismo basal" valor={`${desglose.tmb} kcal`} />
      <Linea texto="Factor de actividad" valor={`× ${desglose.factor.toFixed(2)}`} />
      <Linea texto="Gasto diario estimado" valor={`${desglose.get} kcal`} />
      <Linea texto="Calorías objetivo" valor={`${desglose.calorias} kcal`} />
      <Linea texto="Grasas (referencia)" valor={`${desglose.grasa} g`} />
    </Tarjeta>
  );
}

function Meta({ titulo, valor, color }: { titulo: string; valor: number; color: string }) {
  const { tipografia } = useTema();
  const styles = useEstilos(crearEstilos);
  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.punto, { backgroundColor: color }]} />
      <Text style={styles.valor}>{valor} g</Text>
      <Text style={tipografia.secundario}>{titulo} al día</Text>
    </View>
  );
}

function Linea({ texto, valor }: { texto: string; valor: string }) {
  const { tipografia } = useTema();
  const styles = useEstilos(crearEstilos);
  return (
    <View style={styles.linea}>
      <Text style={tipografia.secundario}>{texto}</Text>
      <Text style={[tipografia.cuerpo, { fontWeight: '600' }]}>{valor}</Text>
    </View>
  );
}

const crearEstilos = (colors: Paleta) =>
  StyleSheet.create({
  fila: { flexDirection: 'row', gap: espacio.lg },
  punto: { width: 10, height: 10, borderRadius: 5, marginBottom: espacio.sm },
  valor: { fontSize: 30, fontWeight: '700', color: colors.texto, letterSpacing: -0.5 },
  linea: { flexDirection: 'row', justifyContent: 'space-between' },
});
