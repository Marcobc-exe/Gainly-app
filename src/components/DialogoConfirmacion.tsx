import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/ui';
import { espacio, radios, type Paleta } from '@/theme/colors';
import { useEstilos, useTema } from '@/theme/TemaProvider';
import type { Alimento } from '@/types';

export function mensajeEliminarAlimento(alimento: Alimento): string {
  const base = 'Dejará de aparecer en tu lista; tus registros anteriores no cambian.';
  return alimento.origen === 'propio' ? base : `${base} Puedes restaurarlo desde Perfil.`;
}

/** Confirmación propia (Alert.alert no funciona en web). */
export function DialogoConfirmacion({
  visible,
  titulo,
  mensaje,
  textoConfirmar = 'Eliminar',
  peligroso = true,
  onConfirmar,
  onCancelar,
}: {
  visible: boolean;
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  /** Botón de confirmar en rojo (acciones destructivas). */
  peligroso?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  const { tipografia } = useTema();
  const styles = useEstilos(crearEstilos);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancelar}>
      <Pressable style={styles.fondo} onPress={onCancelar} accessibilityLabel="Cerrar">
        <Pressable style={styles.caja} onPress={() => {}}>
          <Text style={tipografia.subtitulo}>{titulo}</Text>
          <Text style={[tipografia.secundario, styles.mensaje]}>{mensaje}</Text>
          <View style={styles.botones}>
            <Boton texto="Cancelar" variante="secundario" onPress={onCancelar} style={{ flex: 1 }} />
            <Boton texto={textoConfirmar} onPress={onConfirmar} style={[{ flex: 1 }, peligroso && styles.peligro]} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const crearEstilos = (colors: Paleta) =>
  StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: colors.velo,
    alignItems: 'center',
    justifyContent: 'center',
    padding: espacio.xl,
  },
  caja: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.superficie,
    borderRadius: radios.lg,
    padding: espacio.xl,
    gap: espacio.sm,
  },
  mensaje: { fontSize: 15, lineHeight: 21 },
  botones: { flexDirection: 'row', gap: espacio.sm, marginTop: espacio.md },
  peligro: { backgroundColor: colors.peligro },
});
