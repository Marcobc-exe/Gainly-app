import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { IconoApple, IconoCorreo, IconoFacebook, IconoGoogle } from '@/components/Iconos';
import { Boton, CampoTexto, Pantalla } from '@/components/ui';
import { CanceladoError, mensajeErrorAuth } from '@/lib/auth/AuthService';
import { auth } from '@/lib/auth/mockAuth';
import { useApp } from '@/store/useApp';
import { espacio, type Paleta } from '@/theme/colors';
import { useEstilos, useTema } from '@/theme/TemaProvider';
import type { ProveedorBoton } from '@/types';

// Sign in with Apple solo existe en iOS.
const PROVEEDORES: { id: ProveedorBoton; texto: string; Icono: typeof IconoGoogle }[] = [
  ...(Platform.OS === 'ios' ? [{ id: 'apple' as const, texto: 'Continuar con Apple', Icono: IconoApple }] : []),
  { id: 'google', texto: 'Continuar con Google', Icono: IconoGoogle },
  { id: 'facebook', texto: 'Continuar con Facebook', Icono: IconoFacebook },
];

const ESPERA_REENVIO = 60;
const emailValido = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

type Modo = 'botones' | 'correo' | 'codigo';

export default function Login() {
  const { tipografia } = useTema();
  const styles = useEstilos(crearEstilos);
  const setSesion = useApp((s) => s.setSesion);
  const [modo, setModo] = useState<Modo>('botones');
  const [cargando, setCargando] = useState<ProveedorBoton | 'correo' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [espera, setEspera] = useState(0);

  // Cuenta atrás para poder reenviar el código.
  useEffect(() => {
    if (espera <= 0) return;
    const t = setTimeout(() => setEspera((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [espera]);

  const ejecutar = async (clave: ProveedorBoton | 'correo', accion: () => Promise<void>) => {
    setCargando(clave);
    setError(null);
    try {
      await accion();
    } catch (e) {
      if (!(e instanceof CanceladoError)) setError(mensajeErrorAuth(e));
    } finally {
      setCargando(null);
    }
  };

  const entrarCon = (p: ProveedorBoton) => ejecutar(p, async () => setSesion(await auth.iniciarSesion(p)));

  const enviarCodigo = () =>
    ejecutar('correo', async () => {
      await auth.enviarCodigo(email.trim().toLowerCase());
      setCodigo('');
      setModo('codigo');
      setEspera(ESPERA_REENVIO);
    });

  const verificar = () =>
    ejecutar('correo', async () => setSesion(await auth.verificarCodigo(email.trim().toLowerCase(), codigo)));

  const volver = (destino: Modo) => {
    setError(null);
    setModo(destino);
  };

  return (
    <Pantalla scroll={modo !== 'botones'} bordes={['top', 'bottom']}>
      <View style={modo === 'botones' ? styles.cabecera : styles.cabeceraCompacta}>
        <Logo tamano={modo === 'botones' ? 112 : 72} />
        <Text style={[tipografia.titulo, { fontSize: 34, marginTop: espacio.lg }]}>Gainly</Text>
        {modo === 'botones' ? (
          <Text style={[tipografia.secundario, styles.lema]}>
            Registra tus comidas y alcanza cada día tu meta de proteínas y carbohidratos.
          </Text>
        ) : null}
      </View>

      {modo === 'botones' ? (
        <View style={{ gap: espacio.md }}>
          {PROVEEDORES.map(({ id, texto, Icono }) => (
            <Boton
              key={id}
              texto={texto}
              variante="secundario"
              icono={<Icono />}
              cargando={cargando === id}
              deshabilitado={cargando !== null && cargando !== id}
              onPress={() => entrarCon(id)}
            />
          ))}
          <Boton
            texto="Continuar con correo"
            variante="secundario"
            icono={<IconoCorreo />}
            deshabilitado={cargando !== null}
            onPress={() => volver('correo')}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {!auth.real ? (
            <Text style={[tipografia.secundario, styles.aviso]}>
              Modo demo: el inicio de sesión es simulado y los datos se guardan solo en este dispositivo.
            </Text>
          ) : null}
        </View>
      ) : null}

      {modo === 'correo' ? (
        <View style={{ gap: espacio.md }}>
          <Text style={tipografia.subtitulo}>Entra con tu correo</Text>
          <Text style={tipografia.secundario}>Te enviaremos un código de un solo uso. No necesitas contraseña.</Text>
          <CampoTexto
            etiqueta="Correo"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              setError(null);
            }}
            placeholder="tu@correo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="send"
            onSubmitEditing={() => emailValido(email) && enviarCodigo()}
            autoFocus
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Boton
            texto="Enviar código"
            onPress={enviarCodigo}
            cargando={cargando === 'correo'}
            deshabilitado={!emailValido(email)}
          />
          <Boton texto="Volver" variante="texto" onPress={() => volver('botones')} />
        </View>
      ) : null}

      {modo === 'codigo' ? (
        <View style={{ gap: espacio.md }}>
          <Text style={tipografia.subtitulo}>Revisa tu correo</Text>
          <Text style={tipografia.secundario}>
            Enviamos un código a {email.trim().toLowerCase()}. Escríbelo aquí (mira también en spam).
          </Text>
          <CampoTexto
            etiqueta="Código"
            value={codigo}
            onChangeText={(t) => {
              setCodigo(t.replace(/\D/g, '').slice(0, 10));
              setError(null);
            }}
            placeholder="Escribe el código"
            keyboardType="number-pad"
            autoComplete="one-time-code"
            textContentType="oneTimeCode"
            maxLength={10}
            returnKeyType="done"
            onSubmitEditing={() => codigo.length >= 6 && verificar()}
            style={styles.codigo}
            autoFocus
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Boton texto="Entrar" onPress={verificar} cargando={cargando === 'correo'} deshabilitado={codigo.length < 6} />
          <View style={styles.filaEnlaces}>
            <Pressable onPress={() => volver('correo')} hitSlop={8} accessibilityRole="button">
              <Text style={styles.enlace}>Cambiar correo</Text>
            </Pressable>
            <Pressable
              onPress={enviarCodigo}
              disabled={espera > 0 || cargando !== null}
              hitSlop={8}
              accessibilityRole="button"
            >
              <Text style={[styles.enlace, espera > 0 && styles.enlaceInactivo]}>
                {espera > 0 ? `Reenviar en ${espera} s` : 'Reenviar código'}
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </Pantalla>
  );
}

/** Mismo dibujo que el icono de la app (scripts/generar-iconos.mjs): huevo con la yema como anillo. */
function Logo({ tamano }: { tamano: number }) {
  const { colors } = useTema();
  return (
    <Svg width={tamano} height={tamano} viewBox="12 10 72 76">
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
    cabeceraCompacta: { alignItems: 'center', paddingVertical: espacio.xl },
    lema: { textAlign: 'center', marginTop: espacio.sm, maxWidth: 280, fontSize: 15, lineHeight: 21 },
    aviso: { textAlign: 'center', marginTop: espacio.sm, fontSize: 12 },
    error: { color: colors.peligro, fontSize: 14, textAlign: 'center' },
    codigo: { fontSize: 24, letterSpacing: 6, textAlign: 'center' },
    filaEnlaces: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: espacio.xs },
    enlace: { color: colors.texto, fontSize: 15, fontWeight: '600' },
    enlaceInactivo: { color: colors.textoTenue },
  });
