import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  CampoActividad,
  CampoEntreno,
  CampoObjetivo,
  CampoTipoEntrenamiento,
  CamposBasicos,
  borradorVacio,
  datosDeBorrador,
  errorDatosBasicos,
  perfilDeBorrador,
  type BorradorPerfil,
} from '@/components/CamposPerfil';
import { DialogoConfirmacion } from '@/components/DialogoConfirmacion';
import { ResumenMetas } from '@/components/ResumenMetas';
import { Boton, Pantalla } from '@/components/ui';
import { calcularDesglose } from '@/lib/objetivos';
import { useApp } from '@/store/useApp';
import { espacio, radios, type Paleta } from '@/theme/colors';
import { useEstilos, useTema } from '@/theme/TemaProvider';

const PASOS = [
  { titulo: 'Sobre ti', subtitulo: 'Necesitamos algunos datos para calcular tus metas diarias.' },
  { titulo: 'Tu objetivo', subtitulo: '¿Qué quieres conseguir?' },
  { titulo: 'Entrenamiento', subtitulo: '¿Qué tipo de entrenamiento haces y cuántos días por semana?' },
  { titulo: 'Tu día a día', subtitulo: 'Fuera del entrenamiento, ¿cuánto te mueves?' },
  { titulo: 'Tus metas', subtitulo: 'Esto es lo que deberías comer cada día. Podrás ajustarlo en tu perfil.' },
];

export default function Onboarding() {
  const { colors, tipografia } = useTema();
  const styles = useEstilos(crearEstilos);
  const sesion = useApp((s) => s.sesion);
  const guardarPerfil = useApp((s) => s.guardarPerfil);
  const setSesion = useApp((s) => s.setSesion);
  const [paso, setPaso] = useState(0);
  const [borrador, setBorrador] = useState<BorradorPerfil>(() => borradorVacio());
  const [error, setError] = useState<string | null>(null);
  const [confirmandoSalida, setConfirmandoSalida] = useState(false);

  const cambiar = (p: Partial<BorradorPerfil>) => {
    setError(null);
    setBorrador((b) => ({ ...b, ...p }));
  };

  const desglose = useMemo(() => {
    const d = datosDeBorrador(borrador);
    return d ? calcularDesglose(d) : null;
  }, [borrador]);

  const errorPaso = (): string | null => {
    if (paso === 0) return errorDatosBasicos(borrador);
    if (paso === 1 && !borrador.objetivo) return 'Elige un objetivo.';
    if (paso === 3 && !borrador.actividadDiaria) return 'Elige tu nivel de actividad.';
    return null;
  };

  const siguiente = () => {
    const e = errorPaso();
    if (e) return setError(e);
    if (paso < PASOS.length - 1) return setPaso(paso + 1);
    const perfil = perfilDeBorrador(borrador);
    if (perfil) guardarPerfil(perfil);
  };

  const atras = () => {
    setError(null);
    if (paso > 0) setPaso(paso - 1);
    else setConfirmandoSalida(true);
  };

  return (
    <Pantalla bordes={['top', 'bottom']}>
      <View style={styles.progreso}>
        {PASOS.map((_, i) => (
          <View key={i} style={[styles.segmento, i <= paso && { backgroundColor: colors.acento }]} />
        ))}
      </View>

      <View style={{ gap: espacio.xs }}>
        {paso === 0 && sesion ? <Text style={tipografia.etiqueta}>Hola, {sesion.nombre}</Text> : null}
        <Text style={tipografia.titulo}>{PASOS[paso].titulo}</Text>
        <Text style={[tipografia.secundario, { fontSize: 15 }]}>{PASOS[paso].subtitulo}</Text>
      </View>

      {paso === 0 && <CamposBasicos borrador={borrador} cambiar={cambiar} />}
      {paso === 1 && <CampoObjetivo borrador={borrador} cambiar={cambiar} />}
      {paso === 2 && (
        <View style={{ gap: espacio.lg }}>
          <CampoTipoEntrenamiento borrador={borrador} cambiar={cambiar} />
          <CampoEntreno borrador={borrador} cambiar={cambiar} />
        </View>
      )}
      {paso === 3 && <CampoActividad borrador={borrador} cambiar={cambiar} />}
      {paso === 4 && desglose && <ResumenMetas desglose={desglose} />}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={{ gap: espacio.sm }}>
        <Boton texto={paso === PASOS.length - 1 ? 'Empezar' : 'Continuar'} onPress={siguiente} />
        <Boton texto={paso === 0 ? 'Cancelar' : 'Atrás'} variante="texto" onPress={atras} />
      </View>

      <DialogoConfirmacion
        visible={confirmandoSalida}
        titulo="¿Cerrar sesión?"
        mensaje="Se perderán los datos que has introducido en este formulario."
        textoConfirmar="Cerrar sesión"
        onCancelar={() => setConfirmandoSalida(false)}
        onConfirmar={() => {
          setConfirmandoSalida(false);
          setSesion(null);
        }}
      />
    </Pantalla>
  );
}

const crearEstilos = (colors: Paleta) =>
  StyleSheet.create({
  progreso: { flexDirection: 'row', gap: 6 },
  segmento: { flex: 1, height: 4, borderRadius: radios.sm, backgroundColor: colors.borde },
  error: { color: colors.peligro, fontSize: 14 },
});
