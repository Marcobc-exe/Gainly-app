import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { IconoApple, IconoFacebook, IconoGoogle } from '@/components/Iconos';
import { Boton, Pantalla } from '@/components/ui';
import { auth } from '@/lib/auth/mockAuth';
import { useApp } from '@/store/useApp';
import { espacio, type Paleta } from '@/theme/colors';
import { useEstilos, useTema } from '@/theme/TemaProvider';
import type { ProveedorAuth } from '@/types';

const PROVEEDORES: { id: ProveedorAuth; texto: string; Icono: typeof IconoGoogle }[] = [
  { id: 'apple', texto: 'Continuar con Apple', Icono: IconoApple },
  { id: 'google', texto: 'Continuar con Google', Icono: IconoGoogle },
  { id: 'facebook', texto: 'Continuar con Facebook', Icono: IconoFacebook },
];

export default function Login() {
  const { tipografia } = useTema();
  const styles = useEstilos(crearEstilos);
  const setSesion = useApp((s) => s.setSesion);
  const [cargando, setCargando] = useState<ProveedorAuth | null>(null);

  const entrar = async (p: ProveedorAuth) => {
    setCargando(p);
    try {
      setSesion(await auth.iniciarSesion(p));
    } catch {
      Alert.alert('No se pudo iniciar sesión', 'Inténtalo de nuevo.');
    } finally {
      setCargando(null);
    }
  };

  return (
    <Pantalla scroll={false} bordes={['top', 'bottom']}>
      <View style={styles.cabecera}>
        <Logo />
        <Text style={[tipografia.titulo, { fontSize: 34, marginTop: espacio.xl }]}>Gainly</Text>
        <Text style={[tipografia.secundario, styles.lema]}>
          Registra tus comidas y alcanza cada día tu meta de proteínas y carbohidratos.
        </Text>
      </View>
      <View style={{ gap: espacio.md }}>
        {PROVEEDORES.map(({ id, texto, Icono }) => (
          <Boton
            key={id}
            texto={texto}
            variante="secundario"
            icono={<Icono />}
            cargando={cargando === id}
            deshabilitado={cargando !== null && cargando !== id}
            onPress={() => entrar(id)}
          />
        ))}
        <Text style={[tipografia.secundario, styles.aviso]}>
          Versión de prueba: la sesión y los datos se guardan solo en este dispositivo.
        </Text>
      </View>
    </Pantalla>
  );
}

/** Mismo dibujo que el icono de la app (scripts/generar-iconos.mjs): huevo con la yema como anillo. */
function Logo() {
  const { colors } = useTema();
  return (
    <Svg width={112} height={112} viewBox="12 10 72 76">
      <Path
        d="M48 14 C64 14 76 38 76 55 C76 71 64 82 48 82 C32 82 20 71 20 55 C20 38 32 14 48 14 Z"
        stroke={colors.marca}
        strokeWidth={6}
        fill="none"
      />
      <Circle cx={48} cy={57} r={12} stroke={colors.borde} strokeWidth={7} fill="none" />
      <Circle
        cx={48}
        cy={57}
        r={12}
        stroke={colors.carbos}
        strokeWidth={7}
        strokeLinecap="round"
        strokeDasharray="52.8 300"
        transform="rotate(-90 48 57)"
        fill="none"
      />
    </Svg>
  );
}

const crearEstilos = (colors: Paleta) =>
  StyleSheet.create({
  cabecera: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  lema: { textAlign: 'center', marginTop: espacio.sm, maxWidth: 280, fontSize: 15, lineHeight: 21 },
  aviso: { textAlign: 'center', marginTop: espacio.sm, fontSize: 12 },
});
