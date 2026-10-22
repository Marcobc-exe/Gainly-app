import { StyleSheet, Text, View } from 'react-native';

import { CampoNumero, Chip } from '@/components/ui';
import { atajosCantidad } from '@/data/medidas';
import { espacio, type Paleta } from '@/theme/colors';
import { useEstilos, useTema } from '@/theme/TemaProvider';
import type { Unidad } from '@/types';

/**
 * Cantidad exacta (siempre visible) en g para sólidos o ml para líquidos,
 * con atajos rápidos debajo: gramos habituales o medidas caseras (vaso, taza…).
 */
export function SelectorCantidad({
  unidad,
  valor,
  medida,
  onChange,
  onListo,
}: {
  unidad: Unidad;
  valor: string;
  /** Medida casera elegida con un atajo ("1 vaso"), si la hay. */
  medida?: string;
  onChange: (valor: string, medida?: string) => void;
  onListo?: () => void;
}) {
  const { tipografia } = useTema();
  const styles = useEstilos(crearEstilos);
  const liquido = unidad === 'ml';
  const atajos = atajosCantidad(unidad);

  return (
    <View style={{ gap: espacio.md }}>
      <View style={styles.cabecera}>
        <Text style={tipografia.etiqueta}>Cantidad exacta</Text>
        <Text style={tipografia.secundario}>{liquido ? 'Líquido · mililitros' : 'Sólido · gramos'}</Text>
      </View>
      <CampoNumero
        valor={valor}
        onChange={(v) => onChange(v)}
        sufijo={unidad}
        placeholder="0"
        autoFocus
        returnKeyType="done"
        onSubmitEditing={onListo}
      />
      <View style={styles.chips}>
        {atajos.map((a) => (
          <Chip
            key={a.texto}
            texto={a.texto}
            activo={Number(valor) === a.cantidad && medida === a.medida}
            onPress={() => onChange(String(a.cantidad), a.medida)}
          />
        ))}
      </View>
    </View>
  );
}

const crearEstilos = (colors: Paleta) =>
  StyleSheet.create({
  cabecera: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: espacio.sm },
});
