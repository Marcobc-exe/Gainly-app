import { router } from 'expo-router';
import { Fragment, useState } from 'react';
import { Platform, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import {
  OPCIONES_OBJETIVO,
  OPCIONES_TIPO_ENTRENAMIENTO,
  TEXTO_ACTIVIDAD,
  TEXTO_OBJETIVO,
} from '@/components/CamposPerfil';
import { DialogoConfirmacion } from '@/components/DialogoConfirmacion';
import { IconoFlecha } from '@/components/Iconos';
import { Boton, CampoNumero, Etiqueta, Opciones, Pantalla, Separador, Tarjeta } from '@/components/ui';
import { unidadDe } from '@/data/medidas';
import { mensajeErrorEliminarCuenta, NOMBRE_PROVEEDOR } from '@/lib/auth/AuthService';
import { auth } from '@/lib/auth/mockAuth';
import { UMBRALES_POR_DEFECTO, validarUmbrales } from '@/lib/estadoDia';
import {
  calcularDesglose,
  cambiarPlan,
  cambiarTipoEntrenamiento,
  TIPO_ENTRENAMIENTO_POR_DEFECTO,
} from '@/lib/objetivos';
import { useApp, useDatosUsuario } from '@/store/useApp';
import { espacio, type Paleta } from '@/theme/colors';
import { useEstilos, useTema } from '@/theme/TemaProvider';
import { useColorEstado } from '@/theme/estados';
import type { Perfil } from '@/types';

export default function PerfilPantalla() {
  const { colors, tipografia } = useTema();
  const styles = useEstilos(crearEstilos);
  const sesion = useApp((s) => s.sesion);
  const setSesion = useApp((s) => s.setSesion);
  const { perfil, alimentosPropios } = useDatosUsuario();
  const [confirmandoSalida, setConfirmandoSalida] = useState(false);

  if (!perfil || !sesion) return null;

  const cerrarSesion = async () => {
    await auth.cerrarSesion();
    setSesion(null);
  };

  return (
    <Pantalla>
      <View>
        <Text style={tipografia.titulo}>{perfil.nombre || sesion.nombre}</Text>
        <Text style={tipografia.secundario}>
          Sesión iniciada con {NOMBRE_PROVEEDOR[sesion.proveedor]}
          {sesion.email ? ` · ${sesion.email}` : ''}
        </Text>
      </View>

      <Tarjeta style={{ gap: espacio.md }}>
        <View style={styles.cabeceraTarjeta}>
          <Text style={tipografia.subtitulo}>Mis datos</Text>
          <Boton texto="Editar" variante="texto" onPress={() => router.push('/editar-perfil')} />
        </View>
        <Dato texto="Sexo" valor={perfil.sexo === 'hombre' ? 'Hombre' : 'Mujer'} />
        <Dato texto="Edad" valor={`${perfil.edad} años`} />
        <Dato texto="Altura" valor={`${perfil.alturaCm} cm`} />
        <Dato texto="Peso" valor={`${perfil.pesoKg} kg`} />
        <Dato texto="Objetivo" valor={TEXTO_OBJETIVO[perfil.objetivo]} />
        <SelectorTipoEntrenamiento perfil={perfil} />
        <Dato texto="Entrenamiento" valor={`${perfil.diasEntrenoSemana} días / semana`} />
        <Dato texto="Actividad diaria" valor={TEXTO_ACTIVIDAD[perfil.actividadDiaria]} />
      </Tarjeta>

      <MetasDiarias perfil={perfil} />
      <UmbralesCalendario perfil={perfil} />

      {alimentosPropios.length > 0 ? (
        <Tarjeta style={{ gap: espacio.sm }}>
          <Text style={tipografia.subtitulo}>Mis alimentos</Text>
          {alimentosPropios.map((a, i) => (
            <Fragment key={a.id}>
              {i > 0 ? <Separador /> : null}
              <Pressable
                onPress={() => router.push({ pathname: '/editar-alimento', params: { id: a.id } })}
                style={({ pressed }) => [styles.alimento, pressed && { opacity: 0.6 }]}
                accessibilityRole="button"
                accessibilityHint="Ver detalles, editar o eliminar"
              >
                <View style={{ flex: 1 }}>
                  <Text style={tipografia.cuerpo}>{a.nombre}</Text>
                  <Text style={tipografia.secundario}>
                    Por 100 {unidadDe(a)}: P {a.proteinaPor100g} g · C {a.carbosPor100g} g
                  </Text>
                </View>
                <IconoFlecha dir="der" color={colors.textoTenue} tamano={18} />
              </Pressable>
            </Fragment>
          ))}
        </Tarjeta>
      ) : null}

      <ProductosIncluidos />

      <Boton texto="Cerrar sesión" variante="secundario" onPress={() => setConfirmandoSalida(true)} />
      <DialogoConfirmacion
        visible={confirmandoSalida}
        titulo="¿Cerrar sesión?"
        mensaje="Tendrás que volver a iniciar sesión para ver tus datos. Tus comidas y tu perfil se quedan guardados en este teléfono."
        textoConfirmar="Cerrar sesión"
        onCancelar={() => setConfirmandoSalida(false)}
        onConfirmar={() => {
          setConfirmandoSalida(false);
          cerrarSesion();
        }}
      />

      <AjustesGenerales />
      <Cuenta />
    </Pantalla>
  );
}

/** Privacidad y eliminación de la cuenta (la App Store exige poder borrarla desde la app). */
function Cuenta() {
  const { colors, tipografia } = useTema();
  const styles = useEstilos(crearEstilos);
  const sesion = useApp((s) => s.sesion);
  const eliminarDatosDe = useApp((s) => s.eliminarDatosDe);
  const [confirmando, setConfirmando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eliminar = async () => {
    if (!sesion) return;
    setConfirmando(false);
    setEliminando(true);
    setError(null);
    try {
      await auth.eliminarCuenta();
      eliminarDatosDe(sesion.id);
    } catch (e) {
      setError(mensajeErrorEliminarCuenta(e));
      setEliminando(false);
    }
  };

  return (
    <View style={{ gap: espacio.sm }}>
      <Text style={tipografia.subtitulo}>Cuenta</Text>
      <Tarjeta style={{ gap: espacio.md }}>
        <Pressable
          onPress={() => router.push('/privacidad')}
          style={({ pressed }) => [styles.ajuste, pressed && { opacity: 0.6 }]}
          accessibilityRole="button"
        >
          <Text style={[tipografia.cuerpo, { flex: 1, fontWeight: '600' }]}>Política de privacidad</Text>
          <IconoFlecha dir="der" color={colors.textoTenue} tamano={18} />
        </Pressable>
        <Separador />
        <Pressable
          onPress={() => setConfirmando(true)}
          disabled={eliminando}
          style={({ pressed }) => [pressed && { opacity: 0.6 }]}
          accessibilityRole="button"
        >
          <Text style={[tipografia.cuerpo, { fontWeight: '600', color: colors.peligro }]}>
            {eliminando ? 'Eliminando cuenta…' : 'Eliminar cuenta'}
          </Text>
          <Text style={tipografia.secundario}>Borra tu cuenta y todos tus datos de este teléfono.</Text>
        </Pressable>
        {error ? <Text style={{ color: colors.peligro }}>{error}</Text> : null}
      </Tarjeta>
      <DialogoConfirmacion
        visible={confirmando}
        titulo="¿Eliminar tu cuenta?"
        mensaje="Se borrará tu cuenta de Gainly y, de este teléfono, tu perfil, tus comidas y tus alimentos propios. No se puede deshacer."
        textoConfirmar="Eliminar cuenta"
        onCancelar={() => setConfirmando(false)}
        onConfirmar={eliminar}
      />
    </View>
  );
}

/** Última sección del perfil: preferencias de la app en este dispositivo. */
function AjustesGenerales() {
  const { colors, tipografia, esOscuro, preferencia, setPreferencia } = useTema();
  const styles = useEstilos(crearEstilos);

  return (
    <View style={{ gap: espacio.sm }}>
      <Text style={tipografia.subtitulo}>Ajustes generales</Text>
      <Tarjeta style={{ gap: espacio.md }}>
        <View style={styles.ajuste}>
          <View style={{ flex: 1 }}>
            <Text style={[tipografia.cuerpo, { fontWeight: '600' }]}>Modo oscuro</Text>
            <Text style={tipografia.secundario}>
              {preferencia === 'sistema' ? 'Siguiendo el tema del teléfono' : 'Elegido manualmente'}
            </Text>
          </View>
          <Switch
            value={esOscuro}
            onValueChange={(activo) => setPreferencia(activo ? 'oscuro' : 'claro')}
            trackColor={{ false: colors.borde, true: colors.acento }}
            thumbColor={esOscuro ? colors.fondo : colors.superficie}
            ios_backgroundColor={colors.borde}
            accessibilityLabel="Modo oscuro"
            // En web el color del círculo activo usa otra prop (no existe en los tipos nativos).
            {...(Platform.OS === 'web' ? { activeThumbColor: colors.fondo } : {})}
          />
        </View>
        {preferencia !== 'sistema' ? (
          <>
            <Separador />
            <Pressable onPress={() => setPreferencia('sistema')} hitSlop={8} accessibilityRole="button">
              <Text style={[tipografia.cuerpo, { fontWeight: '600' }]}>Usar el tema del teléfono</Text>
            </Pressable>
          </>
        ) : null}
      </Tarjeta>
    </View>
  );
}

function Dato({ texto, valor }: { texto: string; valor: string }) {
  const { tipografia } = useTema();
  const styles = useEstilos(crearEstilos);
  return (
    <View style={styles.dato}>
      <Text style={tipografia.secundario}>{texto}</Text>
      <Text style={[tipografia.cuerpo, { fontWeight: '600' }]}>{valor}</Text>
    </View>
  );
}

/** Cambiar el tipo recalcula al instante las metas de todos los planes y la meta activa. */
function SelectorTipoEntrenamiento({ perfil }: { perfil: Perfil }) {
  const { tipografia } = useTema();
  const guardarPerfil = useApp((s) => s.guardarPerfil);
  const actual = perfil.tipoEntrenamiento ?? TIPO_ENTRENAMIENTO_POR_DEFECTO;

  return (
    <View style={{ marginVertical: espacio.xs }}>
      <Etiqueta>Tipo de entrenamiento</Etiqueta>
      <Opciones
        valor={actual}
        onChange={(tipo) => {
          if (tipo !== actual) guardarPerfil(cambiarTipoEntrenamiento(perfil, tipo));
        }}
        opciones={OPCIONES_TIPO_ENTRENAMIENTO}
      />
      {perfil.metasManuales ? (
        <Text style={[tipografia.secundario, { marginTop: espacio.sm }]}>
          Al cambiar el tipo se reemplazan tus metas manuales por las recomendadas.
        </Text>
      ) : null}
    </View>
  );
}

function MetasDiarias({ perfil }: { perfil: Perfil }) {
  const { colors, tipografia } = useTema();
  const styles = useEstilos(crearEstilos);
  const guardarPerfil = useApp((s) => s.guardarPerfil);
  const calculadas = calcularDesglose(perfil);
  const manual = !!perfil.metasManuales;
  const [proteina, setProteina] = useState(String(perfil.metasManuales?.proteina ?? calculadas.proteina));
  const [carbos, setCarbos] = useState(String(perfil.metasManuales?.carbos ?? calculadas.carbos));
  const [editando, setEditando] = useState(false);

  const p = Number(proteina);
  const c = Number(carbos);
  const valido = p > 0 && p <= 600 && c > 0 && c <= 1200;

  // Cada plan con las metas que tendría con los datos actuales.
  const planes = OPCIONES_OBJETIVO.map((o) => {
    const d = calcularDesglose({ ...perfil, objetivo: o.valor });
    return { ...o, descripcion: `${d.calorias} kcal · ${d.proteina} g proteínas · ${d.carbos} g carbos` };
  });

  const ajustar = () => {
    setProteina(String(perfil.metasManuales?.proteina ?? calculadas.proteina));
    setCarbos(String(perfil.metasManuales?.carbos ?? calculadas.carbos));
    setEditando(true);
  };

  return (
    <Tarjeta style={{ gap: espacio.md }}>
      <View style={styles.cabeceraTarjeta}>
        <Text style={tipografia.subtitulo}>Metas diarias</Text>
        {!editando ? <Boton texto="Ajustar" variante="texto" onPress={ajustar} /> : null}
      </View>
      {editando ? (
        <>
          <View style={{ flexDirection: 'row', gap: espacio.md }}>
            <CampoNumero etiqueta="Proteínas" valor={proteina} onChange={setProteina} sufijo="g" />
            <CampoNumero etiqueta="Carbohidratos" valor={carbos} onChange={setCarbos} sufijo="g" />
          </View>
          <Text style={tipografia.secundario}>
            Recomendado según tus datos: {calculadas.proteina} g proteínas y {calculadas.carbos} g carbohidratos.
          </Text>
          <Boton
            texto="Guardar metas"
            deshabilitado={!valido}
            onPress={() => {
              guardarPerfil({ ...perfil, metasManuales: { proteina: Math.round(p), carbos: Math.round(c) } });
              setEditando(false);
            }}
          />
          <Boton
            texto="Usar las recomendadas"
            variante="texto"
            onPress={() => {
              guardarPerfil({ ...perfil, metasManuales: undefined });
              setProteina(String(calculadas.proteina));
              setCarbos(String(calculadas.carbos));
              setEditando(false);
            }}
          />
        </>
      ) : (
        <>
          <View>
            <Etiqueta>Plan de dieta</Etiqueta>
            <Opciones
              valor={perfil.objetivo}
              onChange={(objetivo) => {
                if (objetivo !== perfil.objetivo) guardarPerfil(cambiarPlan(perfil, objetivo));
              }}
              opciones={planes}
            />
            {perfil.objetivo === 'recomposicion' && perfil.diasEntrenoSemana === 0 ? (
              <Text style={[tipografia.secundario, { marginTop: espacio.sm, color: colors.peligro }]}>
                La recomposición necesita entrenamiento de fuerza; añade días de entreno en Mis datos.
              </Text>
            ) : null}
            {manual ? (
              <Text style={[tipografia.secundario, { marginTop: espacio.sm }]}>
                Al cambiar de plan se reemplazan tus metas manuales por las recomendadas.
              </Text>
            ) : null}
          </View>
          <Separador />
          <Dato texto="Proteínas" valor={`${perfil.metasManuales?.proteina ?? calculadas.proteina} g`} />
          <Dato texto="Carbohidratos" valor={`${perfil.metasManuales?.carbos ?? calculadas.carbos} g`} />
          <Text style={tipografia.secundario}>
            {manual
              ? 'Metas ajustadas manualmente.'
              : `Calculadas para ${calculadas.calorias} kcal/día según tus datos y tu plan. Se aplican desde hoy.`}
          </Text>
        </>
      )}
    </Tarjeta>
  );
}

/** Productos incluidos que el usuario modificó o eliminó, con opción de restaurarlos. */
function ProductosIncluidos() {
  const { tipografia } = useTema();
  const { alimentosEditados, alimentosOcultos } = useDatosUsuario();
  const restaurar = useApp((s) => s.restaurarProductosIncluidos);
  const [confirmando, setConfirmando] = useState(false);
  const modificados = Object.keys(alimentosEditados).length;
  const eliminados = alimentosOcultos.length;
  if (modificados === 0 && eliminados === 0) return null;

  const plural = (n: number, s: string, p: string) => `${n} ${n === 1 ? s : p}`;

  return (
    <Tarjeta style={{ gap: espacio.md }}>
      <Text style={tipografia.subtitulo}>Productos de la app</Text>
      <Text style={tipografia.secundario}>
        {plural(modificados, 'producto modificado', 'productos modificados')} ·{' '}
        {plural(eliminados, 'eliminado', 'eliminados')}
      </Text>
      <Boton texto="Restaurar productos originales" variante="secundario" onPress={() => setConfirmando(true)} />
      <DialogoConfirmacion
        visible={confirmando}
        titulo="¿Restaurar productos originales?"
        mensaje="Los productos de la app vuelven a sus valores originales y reaparecen los que eliminaste. Tus alimentos propios y tus registros no cambian."
        textoConfirmar="Restaurar"
        peligroso={false}
        onCancelar={() => setConfirmando(false)}
        onConfirmar={() => {
          restaurar();
          setConfirmando(false);
        }}
      />
    </Tarjeta>
  );
}

function UmbralesCalendario({ perfil }: { perfil: Perfil }) {
  const COLOR_ESTADO = useColorEstado();
  const { colors, tipografia } = useTema();
  const styles = useEstilos(crearEstilos);
  const guardarPerfil = useApp((s) => s.guardarPerfil);
  const [logrado, setLogrado] = useState(String(perfil.umbrales.logrado));
  const [casi, setCasi] = useState(String(perfil.umbrales.casi));
  const nuevos = { logrado: Number(logrado), casi: Number(casi) };
  const error = logrado === '' || casi === '' ? 'Completa ambos valores.' : validarUmbrales(nuevos);
  const cambiado = nuevos.logrado !== perfil.umbrales.logrado || nuevos.casi !== perfil.umbrales.casi;

  return (
    <Tarjeta style={{ gap: espacio.md }}>
      <Text style={tipografia.subtitulo}>Colores del calendario</Text>
      <Text style={tipografia.secundario}>
        Un día cuenta según el macro con menor porcentaje alcanzado de su meta.
      </Text>
      <View style={{ flexDirection: 'row', gap: espacio.md }}>
        <View style={{ flex: 1 }}>
          <Leyenda color={COLOR_ESTADO.logrado} texto="Logrado desde" />
          <CampoNumero valor={logrado} onChange={setLogrado} sufijo="%" keyboardType="number-pad" />
        </View>
        <View style={{ flex: 1 }}>
          <Leyenda color={COLOR_ESTADO.casi} texto="Casi desde" />
          <CampoNumero valor={casi} onChange={setCasi} sufijo="%" keyboardType="number-pad" />
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <View style={[styles.punto, { backgroundColor: COLOR_ESTADO.no_logrado }]} />
        <Text style={tipografia.secundario}>No logrado: por debajo de {casi || '—'} %</Text>
      </View>
      {error ? <Text style={{ color: colors.peligro }}>{error}</Text> : null}
      {cambiado ? (
        <Boton
          texto="Guardar umbrales"
          deshabilitado={!!error}
          onPress={() => guardarPerfil({ ...perfil, umbrales: nuevos })}
        />
      ) : null}
      <Boton
        texto={`Restablecer (${UMBRALES_POR_DEFECTO.logrado} % / ${UMBRALES_POR_DEFECTO.casi} %)`}
        variante="texto"
        onPress={() => {
          setLogrado(String(UMBRALES_POR_DEFECTO.logrado));
          setCasi(String(UMBRALES_POR_DEFECTO.casi));
          guardarPerfil({ ...perfil, umbrales: UMBRALES_POR_DEFECTO });
        }}
      />
    </Tarjeta>
  );
}

function Leyenda({ color, texto }: { color: string; texto: string }) {
  const styles = useEstilos(crearEstilos);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={[styles.punto, { backgroundColor: color, marginBottom: espacio.sm }]} />
      <Etiqueta>{texto}</Etiqueta>
    </View>
  );
}

const crearEstilos = (colors: Paleta) =>
  StyleSheet.create({
  cabeceraTarjeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: -8 },
  dato: { flexDirection: 'row', justifyContent: 'space-between', gap: espacio.md },
  ajuste: { flexDirection: 'row', alignItems: 'center', gap: espacio.md },
  alimento: { flexDirection: 'row', alignItems: 'center', gap: espacio.md, paddingVertical: espacio.sm },
  punto: { width: 10, height: 10, borderRadius: 3 },
});
