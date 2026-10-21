import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDaysInMonth,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { IconoFlecha } from '@/components/Iconos';
import { textoCantidadRegistro } from '@/data/medidas';
import { Pantalla, Tarjeta } from '@/components/ui';
import { contarEstados, porcentaje, sumarRegistros } from '@/lib/estadoDia';
import { claveFecha, formatoLargo, formatoMes, hoy } from '@/lib/fechas';
import { useEstadosPorDia, useMetaDe, useRegistrosDe } from '@/store/useApp';
import { colors, espacio, radios, tipografia } from '@/theme/colors';
import { COLOR_ESTADO, TEXTO_ESTADO } from '@/theme/estados';
import type { EstadoDia } from '@/types';

const DIAS_SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const LEYENDA: [EstadoDia, string][] = [
  ['logrado', 'Logrado'],
  ['casi', 'Casi'],
  ['no_logrado', 'No logrado'],
];

export default function Calendario() {
  const [mes, setMes] = useState(() => startOfMonth(new Date()));
  const [seleccion, setSeleccion] = useState(hoy);
  const estados = useEstadosPorDia();
  const claveHoy = hoy();

  const dias = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(startOfMonth(mes), { weekStartsOn: 1 }),
        end: endOfWeek(endOfMonth(mes), { weekStartsOn: 1 }),
      }),
    [mes],
  );

  const prefijoMes = format(mes, 'yyyy-MM');
  const anio = format(mes, 'yyyy');
  const conteoMes = contarEstados(estados, prefijoMes);
  const conteoAnio = contarEstados(estados, anio);
  const esMesActual = isSameMonth(mes, new Date());
  const diasDelMes = esMesActual ? new Date().getDate() : getDaysInMonth(mes);

  return (
    <Pantalla>
      <Text style={tipografia.titulo}>Calendario</Text>

      <View style={styles.resumen}>
        <Tarjeta style={styles.stat}>
          <Text style={tipografia.etiqueta}>Este mes</Text>
          <Text style={styles.statValor}>
            {conteoMes.logrado}
            <Text style={styles.statTotal}> / {diasDelMes}</Text>
          </Text>
          <Text style={tipografia.secundario}>días logrados</Text>
          <Text style={[tipografia.secundario, { marginTop: espacio.xs }]}>{conteoMes.casi} casi logrados</Text>
        </Tarjeta>
        <Tarjeta style={styles.stat}>
          <Text style={tipografia.etiqueta}>Año {anio}</Text>
          <Text style={styles.statValor}>{conteoAnio.logrado}</Text>
          <Text style={tipografia.secundario}>días logrados</Text>
          <Text style={[tipografia.secundario, { marginTop: espacio.xs }]}>
            de {conteoAnio.registrados} registrados
          </Text>
        </Tarjeta>
      </View>

      <Tarjeta>
        <View style={styles.navMes}>
          <Pressable onPress={() => setMes((m) => addMonths(m, -1))} hitSlop={12} accessibilityLabel="Mes anterior">
            <IconoFlecha dir="izq" />
          </Pressable>
          <Text style={tipografia.subtitulo}>{formatoMes(mes)}</Text>
          <Pressable
            onPress={() => setMes((m) => addMonths(m, 1))}
            hitSlop={12}
            disabled={esMesActual}
            style={{ opacity: esMesActual ? 0.25 : 1 }}
            accessibilityLabel="Mes siguiente"
          >
            <IconoFlecha dir="der" />
          </Pressable>
        </View>

        <View style={styles.semana}>
          {DIAS_SEMANA.map((d) => (
            <Text key={d} style={styles.diaSemana}>
              {d}
            </Text>
          ))}
        </View>

        <View style={styles.grid}>
          {dias.map((d) => {
            const clave = claveFecha(d);
            const fuera = !isSameMonth(d, mes);
            const futuro = clave > claveHoy;
            const estado: EstadoDia = estados[clave] ?? 'vacio';
            return (
              <View key={clave} style={styles.celda}>
                {fuera ? null : (
                  <Pressable
                    onPress={() => setSeleccion(clave)}
                    disabled={futuro}
                    accessibilityLabel={`${formatoLargo(clave)}: ${TEXTO_ESTADO[estado]}`}
                    style={[
                      styles.dia,
                      estado !== 'vacio' && { backgroundColor: COLOR_ESTADO[estado] },
                      clave === claveHoy && styles.diaHoy,
                      clave === seleccion && styles.diaSeleccionado,
                    ]}
                  >
                    <Text
                      style={[
                        styles.diaTexto,
                        estado !== 'vacio' && { color: colors.sobreAcento, fontWeight: '700' },
                        futuro && { color: colors.textoTenue },
                      ]}
                    >
                      {d.getDate()}
                    </Text>
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.leyenda}>
          {LEYENDA.map(([e, texto]) => (
            <View key={e} style={styles.leyendaItem}>
              <View style={[styles.leyendaPunto, { backgroundColor: COLOR_ESTADO[e] }]} />
              <Text style={tipografia.secundario}>{texto}</Text>
            </View>
          ))}
        </View>
      </Tarjeta>

      <DetalleDia fecha={seleccion} estado={estados[seleccion] ?? 'vacio'} />
    </Pantalla>
  );
}

function DetalleDia({ fecha, estado }: { fecha: string; estado: EstadoDia }) {
  const registros = useRegistrosDe(fecha);
  const meta = useMetaDe(fecha);
  const totales = sumarRegistros(registros);

  return (
    <Tarjeta style={{ gap: espacio.md }}>
      <View style={styles.detalleCabecera}>
        <Text style={[tipografia.subtitulo, { flex: 1 }]}>{formatoLargo(fecha)}</Text>
        <View style={[styles.insignia, { backgroundColor: COLOR_ESTADO[estado] }]}>
          <Text style={[styles.insigniaTexto, estado === 'vacio' && { color: colors.textoSecundario }]}>
            {TEXTO_ESTADO[estado]}
          </Text>
        </View>
      </View>
      {meta ? (
        <>
          <Barra titulo="Proteínas" consumido={totales.proteina} meta={meta.proteina} color={colors.proteina} />
          <Barra titulo="Carbohidratos" consumido={totales.carbos} meta={meta.carbos} color={colors.carbos} />
        </>
      ) : null}
      {registros.length > 0 ? (
        <Text style={tipografia.secundario}>
          {registros.map((r) => `${r.nombreAlimento} (${textoCantidadRegistro(r)})`).join(' · ')}
        </Text>
      ) : null}
    </Tarjeta>
  );
}

function Barra({ titulo, consumido, meta, color }: { titulo: string; consumido: number; meta: number; color: string }) {
  const pct = porcentaje(consumido, meta);
  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={tipografia.cuerpo}>{titulo}</Text>
        <Text style={tipografia.secundario}>
          {Math.round(consumido)} / {meta} g · {Math.round(pct)}%
        </Text>
      </View>
      <View style={styles.barraPista}>
        <View style={[styles.barraRelleno, { width: `${Math.min(100, pct)}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  resumen: { flexDirection: 'row', gap: espacio.md },
  stat: { flex: 1, gap: 2 },
  statValor: { fontSize: 34, fontWeight: '700', color: colors.texto, letterSpacing: -0.5, marginTop: espacio.xs },
  statTotal: { fontSize: 18, fontWeight: '500', color: colors.textoSecundario },
  navMes: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: espacio.md },
  semana: { flexDirection: 'row' },
  diaSemana: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: colors.textoTenue,
    paddingBottom: espacio.sm,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  celda: { width: `${100 / 7}%`, aspectRatio: 1, padding: 3 },
  dia: {
    flex: 1,
    borderRadius: radios.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  diaHoy: { borderColor: colors.textoTenue },
  diaSeleccionado: { borderColor: colors.acento },
  diaTexto: { fontSize: 15, color: colors.texto },
  leyenda: { flexDirection: 'row', justifyContent: 'center', gap: espacio.lg, marginTop: espacio.md },
  leyendaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  leyendaPunto: { width: 10, height: 10, borderRadius: 3 },
  detalleCabecera: { flexDirection: 'row', alignItems: 'center', gap: espacio.sm },
  insignia: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radios.xl },
  insigniaTexto: { fontSize: 12, fontWeight: '600', color: colors.sobreAcento },
  barraPista: { height: 8, borderRadius: 4, backgroundColor: colors.pistaAnillo, overflow: 'hidden' },
  barraRelleno: { height: 8, borderRadius: 4 },
});
