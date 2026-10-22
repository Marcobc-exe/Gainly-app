import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { CabeceraModal } from '@/components/CabeceraModal';
import {
  CampoActividad,
  CampoEntreno,
  CampoObjetivo,
  CampoTipoEntrenamiento,
  CamposBasicos,
  borradorDesdePerfil,
  datosDeBorrador,
  errorDatosBasicos,
  perfilDeBorrador,
  type BorradorPerfil,
} from '@/components/CamposPerfil';
import { ResumenMetas } from '@/components/ResumenMetas';
import { Boton, Etiqueta, Pantalla } from '@/components/ui';
import { calcularDesglose } from '@/lib/objetivos';
import { useApp, usePerfil } from '@/store/useApp';
import { espacio } from '@/theme/colors';
import { useTema } from '@/theme/TemaProvider';

export default function EditarPerfil() {
  const { colors, tipografia } = useTema();
  const perfil = usePerfil();
  const guardarPerfil = useApp((s) => s.guardarPerfil);
  const [borrador, setBorrador] = useState<BorradorPerfil>(() => borradorDesdePerfil(perfil!));
  const cambiar = (p: Partial<BorradorPerfil>) => setBorrador((b) => ({ ...b, ...p }));

  const desglose = useMemo(() => {
    const d = datosDeBorrador(borrador);
    return d ? calcularDesglose(d) : null;
  }, [borrador]);
  const error = errorDatosBasicos(borrador);

  const guardar = () => {
    const nuevo = perfilDeBorrador(borrador, perfil);
    if (!nuevo) return;
    guardarPerfil(nuevo);
    router.back();
  };

  return (
    <Pantalla bordes={['top', 'bottom']}>
      <CabeceraModal titulo="Editar mis datos" tipo="atras" />
      <CamposBasicos borrador={borrador} cambiar={cambiar} />
      <View>
        <Etiqueta>Objetivo</Etiqueta>
        <CampoObjetivo borrador={borrador} cambiar={cambiar} />
      </View>
      <View>
        <Etiqueta>Tipo de entrenamiento</Etiqueta>
        <CampoTipoEntrenamiento borrador={borrador} cambiar={cambiar} />
      </View>
      <View>
        <Etiqueta>Días de entrenamiento</Etiqueta>
        <CampoEntreno borrador={borrador} cambiar={cambiar} />
      </View>
      <View>
        <Etiqueta>Actividad diaria</Etiqueta>
        <CampoActividad borrador={borrador} cambiar={cambiar} />
      </View>
      {desglose ? (
        <View>
          <Etiqueta>Nuevas metas recomendadas</Etiqueta>
          <ResumenMetas desglose={desglose} />
          {perfil?.metasManuales ? (
            <Text style={[tipografia.secundario, { marginTop: espacio.sm }]}>
              Tienes metas ajustadas manualmente; se mantendrán hasta que elijas “Usar las recomendadas”.
            </Text>
          ) : null}
        </View>
      ) : null}
      {error ? <Text style={{ color: colors.peligro }}>{error}</Text> : null}
      <Text style={tipografia.secundario}>Los cambios se aplican desde hoy; los días anteriores conservan su meta.</Text>
      <Boton texto="Guardar cambios" onPress={guardar} deshabilitado={!!error} />
    </Pantalla>
  );
}
