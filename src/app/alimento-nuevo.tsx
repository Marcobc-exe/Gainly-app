import { router, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';

import { CabeceraModal } from '@/components/CabeceraModal';
import { FormularioAlimento } from '@/components/FormularioAlimento';
import { Pantalla } from '@/components/ui';
import { useApp } from '@/store/useApp';
import { useTema } from '@/theme/TemaProvider';

export default function AlimentoNuevo() {
  const { tipografia } = useTema();
  const { fecha, nombre } = useLocalSearchParams<{ fecha?: string; nombre?: string }>();
  const guardarAlimentoPropio = useApp((s) => s.guardarAlimentoPropio);

  return (
    <Pantalla bordes={['top', 'bottom']}>
      <CabeceraModal titulo="Nuevo alimento" tipo="atras" />
      <Text style={tipografia.secundario}>
        Copia los valores de la etiqueta nutricional (por cada 100 g o 100 ml de producto).
      </Text>
      <FormularioAlimento
        inicial={{ nombre: nombre ?? '' }}
        textoGuardar="Guardar y usar"
        onGuardar={(cambios) => {
          const alimento = guardarAlimentoPropio(cambios);
          // Vuelve al registro con el alimento ya elegido.
          router.dismissTo({ pathname: '/agregar-comida', params: { fecha: fecha ?? '', alimentoId: alimento.id } });
        }}
      />
    </Pantalla>
  );
}
