import { addDays } from 'date-fns';
import { router } from 'expo-router';
import { Fragment, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AnilloProgreso } from '@/components/AnilloProgreso';
import { FilaComida } from '@/components/FilaComida';
import { IconoFlecha, IconoMas } from '@/components/Iconos';
import { Pantalla, Separador, Tarjeta } from '@/components/ui';
import { estadoDelDia, sumarRegistros } from '@/lib/estadoDia';
import { aFecha, claveFecha, formatoLargo, hoy } from '@/lib/fechas';
import { useMetaDe, usePerfil, useRegistrosDe } from '@/store/useApp';
import { colors, espacio, radios, tipografia } from '@/theme/colors';
import { COLOR_ESTADO, TEXTO_ESTADO } from '@/theme/estados';

export default function Hoy() {
  const [fecha, setFecha] = useState(hoy);
  const perfil = usePerfil();
  const registros = useRegistrosDe(fecha);
  const meta = useMetaDe(fecha);
  const totales = sumarRegistros(registros);
  const esHoy = fecha === hoy();

  const mover = (dias: number) => setFecha((f) => claveFecha(addDays(aFecha(f), dias)));
  const estado =
    meta && perfil ? estadoDelDia(totales, meta, perfil.umbrales, registros.length > 0) : 'vacio';

  return (
    <View style={{ flex: 1 }}>
      <Pantalla>
        <View>
          <Text style={tipografia.etiqueta}>{perfil?.nombre ? `Hola, ${perfil.nombre}` : 'Tu día'}</Text>
          <View style={styles.navFecha}>
            <Pressable onPress={() => mover(-1)} hitSlop={12} accessibilityLabel="Día anterior">
              <IconoFlecha dir="izq" />
            </Pressable>
            <Pressable onPress={() => setFecha(hoy())} style={{ flex: 1 }}>
              <Text style={[tipografia.titulo, { fontSize: 22 }]} numberOfLines={1}>
                {esHoy ? 'Hoy' : formatoLargo(fecha)}
              </Text>
              {esHoy ? <Text style={tipografia.secundario}>{formatoLargo(fecha)}</Text> : null}
            </Pressable>
            <Pressable
              onPress={() => mover(1)}
              hitSlop={12}
              disabled={esHoy}
              style={{ opacity: esHoy ? 0.25 : 1 }}
              accessibilityLabel="Día siguiente"
            >
              <IconoFlecha dir="der" />
            </Pressable>
          </View>
        </View>

        <Tarjeta style={{ paddingVertical: espacio.xl }}>
          <View style={styles.anillos}>
            <AnilloProgreso
              titulo="Proteínas"
              consumido={totales.proteina}
              meta={meta?.proteina ?? 0}
              color={colors.proteina}
            />
            <AnilloProgreso
              titulo="Carbohidratos"
              consumido={totales.carbos}
              meta={meta?.carbos ?? 0}
              color={colors.carbos}
            />
          </View>
          <View style={styles.estado}>
            <View style={[styles.puntoEstado, { backgroundColor: COLOR_ESTADO[estado] }]} />
            <Text style={tipografia.secundario}>{TEXTO_ESTADO[estado]}</Text>
          </View>
        </Tarjeta>

        <Tarjeta style={{ paddingVertical: espacio.sm }}>
          <View style={styles.cabeceraLista}>
            <Text style={tipografia.subtitulo}>Comidas</Text>
            <Text style={tipografia.secundario}>
              {registros.length} {registros.length === 1 ? 'registro' : 'registros'}
            </Text>
          </View>
          {registros.length === 0 ? (
            <Text style={[tipografia.secundario, styles.vacio]}>
              Aún no has registrado comidas este día. Pulsa + para añadir la primera.
            </Text>
          ) : (
            registros.map((r, i) => (
              <Fragment key={r.id}>
                {i > 0 ? <Separador /> : null}
                <FilaComida registro={r} />
              </Fragment>
            ))
          )}
        </Tarjeta>
      </Pantalla>

      <Pressable
        onPress={() => router.push({ pathname: '/agregar-comida', params: { fecha } })}
        style={({ pressed }) => [styles.fab, pressed && { opacity: 0.8 }]}
        accessibilityRole="button"
        accessibilityLabel="Agregar comida"
      >
        <IconoMas color={colors.sobreAcento} />
        <Text style={styles.fabTexto}>Agregar comida</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  navFecha: { flexDirection: 'row', alignItems: 'center', gap: espacio.md, marginTop: espacio.xs },
  anillos: { flexDirection: 'row', gap: espacio.sm },
  estado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espacio.sm,
    marginTop: espacio.lg,
  },
  puntoEstado: { width: 10, height: 10, borderRadius: 5 },
  cabeceraLista: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingVertical: espacio.sm,
  },
  vacio: { paddingVertical: espacio.lg, textAlign: 'center' },
  fab: {
    position: 'absolute',
    right: espacio.lg,
    bottom: espacio.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.sm,
    backgroundColor: colors.acento,
    paddingHorizontal: espacio.xl,
    height: 56,
    borderRadius: radios.xl,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  fabTexto: { color: colors.sobreAcento, fontSize: 16, fontWeight: '600' },
});
