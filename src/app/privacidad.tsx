import { Linking, Text, View } from 'react-native';

import { CabeceraModal } from '@/components/CabeceraModal';
import { Pantalla } from '@/components/ui';
import politica from '@/data/privacidad.json';
import { espacio } from '@/theme/colors';
import { useTema } from '@/theme/TemaProvider';

/** Política de privacidad (mismo texto que `legal/privacidad.html`, generado con `npm run privacidad`). */
export default function Privacidad() {
  const { colors, tipografia } = useTema();
  return (
    <Pantalla bordes={['top', 'bottom']}>
      <CabeceraModal titulo="Privacidad" />
      <View style={{ gap: espacio.xs }}>
        <Text style={tipografia.titulo}>{politica.titulo}</Text>
        <Text style={tipografia.secundario}>Última actualización: {politica.actualizada}</Text>
      </View>
      <Text style={tipografia.cuerpo}>{politica.introduccion}</Text>
      {politica.secciones.map((s) => (
        <View key={s.titulo} style={{ gap: espacio.sm }}>
          <Text style={tipografia.subtitulo}>{s.titulo}</Text>
          {s.parrafos.map((p) => (
            <Text key={p} style={tipografia.cuerpo}>
              {p}
            </Text>
          ))}
        </View>
      ))}
      <View style={{ gap: espacio.sm }}>
        <Text style={tipografia.subtitulo}>Contacto</Text>
        <Text style={tipografia.cuerpo}>
          Si tienes dudas sobre tus datos, escríbenos a{' '}
          <Text
            style={{ color: colors.acento, fontWeight: '600' }}
            onPress={() => Linking.openURL(`mailto:${politica.contacto}`)}
          >
            {politica.contacto}
          </Text>
          .
        </Text>
      </View>
    </Pantalla>
  );
}
