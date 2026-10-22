import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Boton, CampoNumero } from '@/components/ui';
import { textoCantidadRegistro } from '@/data/medidas';
import { useApp } from '@/store/useApp';
import { espacio, radios, type Paleta } from '@/theme/colors';
import { useEstilos, useTema } from '@/theme/TemaProvider';
import type { RegistroComida } from '@/types';

/** Comida registrada; al tocarla se despliega para editar la cantidad (g o ml) o eliminarla. */
export function FilaComida({ registro }: { registro: RegistroComida }) {
  const { colors, tipografia } = useTema();
  const styles = useEstilos(crearEstilos);
  const actualizarCantidad = useApp((s) => s.actualizarCantidad);
  const eliminarRegistro = useApp((s) => s.eliminarRegistro);
  const [abierta, setAbierta] = useState(false);
  const [cantidad, setCantidad] = useState(String(registro.cantidad));

  const n = Number(cantidad);
  const valido = n > 0 && n <= 10000;

  return (
    <View style={styles.fila}>
      <Pressable
        onPress={() => {
          setCantidad(String(registro.cantidad));
          setAbierta(!abierta);
        }}
        style={styles.cabecera}
        accessibilityRole="button"
        accessibilityHint="Editar o eliminar"
      >
        <View style={{ flex: 1 }}>
          <Text style={[tipografia.cuerpo, { fontWeight: '600' }]} numberOfLines={1}>
            {registro.nombreAlimento}
          </Text>
          <Text style={tipografia.secundario}>{textoCantidadRegistro(registro)}</Text>
        </View>
        <Macro valor={registro.proteina} letra="P" color={colors.proteina} />
        <Macro valor={registro.carbos} letra="C" color={colors.carbos} />
      </Pressable>
      {abierta ? (
        <View style={styles.editor}>
          <CampoNumero
            etiqueta={registro.unidad === 'ml' ? 'Cantidad (ml)' : 'Cantidad (g)'}
            valor={cantidad}
            onChange={setCantidad}
            sufijo={registro.unidad}
            autoFocus
            selectTextOnFocus
            returnKeyType="done"
          />
          <View style={styles.botones}>
            <Boton
              texto="Guardar"
              deshabilitado={!valido}
              onPress={() => {
                actualizarCantidad(registro.id, n);
                setAbierta(false);
              }}
              style={{ flex: 1 }}
            />
            <Boton texto="Eliminar" variante="peligro" onPress={() => eliminarRegistro(registro.id)} />
          </View>
        </View>
      ) : null}
    </View>
  );
}

function Macro({ valor, letra, color }: { valor: number; letra: string; color: string }) {
  const { tipografia } = useTema();
  const styles = useEstilos(crearEstilos);
  return (
    <View style={styles.macro}>
      <View style={[styles.punto, { backgroundColor: color }]} />
      <Text style={styles.macroTexto}>
        {Math.round(valor)}
        <Text style={tipografia.secundario}> g {letra}</Text>
      </Text>
    </View>
  );
}

const crearEstilos = (colors: Paleta) =>
  StyleSheet.create({
  fila: { paddingVertical: espacio.md },
  cabecera: { flexDirection: 'row', alignItems: 'center', gap: espacio.md },
  macro: { flexDirection: 'row', alignItems: 'center', gap: 5, minWidth: 64, justifyContent: 'flex-end' },
  punto: { width: 7, height: 7, borderRadius: radios.sm },
  macroTexto: { fontSize: 15, fontWeight: '600', color: colors.texto },
  editor: { gap: espacio.md, marginTop: espacio.md },
  botones: { flexDirection: 'row', alignItems: 'center', gap: espacio.sm },
});
