import { useState } from 'react';
import { Text, View } from 'react-native';

import { Boton, CampoNumero, CampoTexto, Etiqueta, Opciones } from '@/components/ui';
import { espacio } from '@/theme/colors';
import { useTema } from '@/theme/TemaProvider';
import type { CambiosAlimento, Unidad } from '@/types';

/** Nombre, tipo (g/ml) y macros por 100. Lo usan "Nuevo alimento" y "Editar producto". */
export function FormularioAlimento({
  inicial,
  textoGuardar,
  onGuardar,
}: {
  inicial?: Partial<CambiosAlimento>;
  textoGuardar: string;
  onGuardar: (cambios: CambiosAlimento) => void;
}) {
  const { colors } = useTema();
  const [nombre, setNombre] = useState(inicial?.nombre ?? '');
  const [proteina, setProteina] = useState(inicial?.proteinaPor100g?.toString() ?? '');
  const [carbos, setCarbos] = useState(inicial?.carbosPor100g?.toString() ?? '');
  const [unidad, setUnidad] = useState<Unidad>(inicial?.unidad ?? 'g');

  const p = Number(proteina);
  const c = Number(carbos);
  const error =
    nombre.trim().length < 2
      ? 'Escribe un nombre.'
      : proteina === '' || carbos === ''
        ? 'Completa proteínas y carbohidratos.'
        : p + c > 100
          ? `La suma no puede superar 100 g por cada 100 ${unidad}.`
          : null;

  return (
    <View style={{ gap: espacio.lg }}>
      <CampoTexto etiqueta="Nombre" value={nombre} onChangeText={setNombre} placeholder="Ej. Hamburguesa casera" />
      <View>
        <Etiqueta>Tipo</Etiqueta>
        <Opciones
          horizontal
          valor={unidad}
          onChange={setUnidad}
          opciones={[
            { valor: 'g', titulo: 'Sólido (g)' },
            { valor: 'ml', titulo: 'Líquido (ml)' },
          ]}
        />
      </View>
      <View style={{ flexDirection: 'row', gap: espacio.md }}>
        <CampoNumero
          etiqueta={`Proteínas / 100 ${unidad}`}
          valor={proteina}
          onChange={setProteina}
          sufijo="g"
          placeholder="0"
        />
        <CampoNumero etiqueta={`Carbos / 100 ${unidad}`} valor={carbos} onChange={setCarbos} sufijo="g" placeholder="0" />
      </View>
      {error && nombre !== '' ? <Text style={{ color: colors.peligro }}>{error}</Text> : null}
      <Boton
        texto={textoGuardar}
        deshabilitado={!!error}
        onPress={() => {
          if (!error) onGuardar({ nombre: nombre.trim(), proteinaPor100g: p, carbosPor100g: c, unidad });
        }}
      />
    </View>
  );
}
