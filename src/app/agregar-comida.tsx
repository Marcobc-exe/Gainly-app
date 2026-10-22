import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CabeceraModal } from '@/components/CabeceraModal';
import { DialogoConfirmacion, mensajeEliminarAlimento } from '@/components/DialogoConfirmacion';
import { FilaAlimentoDeslizable } from '@/components/FilaAlimentoDeslizable';
import { SelectorCantidad } from '@/components/SelectorCantidad';
import { Boton, Chip, Separador, Tarjeta } from '@/components/ui';
import { buscarAlimentos, macrosPara } from '@/data/alimentos';
import { unidadDe } from '@/data/medidas';
import { formatoLargo, hoy } from '@/lib/fechas';
import { useAlimentos, useApp, useDatosUsuario } from '@/store/useApp';
import { espacio, radios, type Paleta } from '@/theme/colors';
import { useEstilos, useTema } from '@/theme/TemaProvider';
import type { Alimento } from '@/types';

export default function AgregarComida() {
  const { colors, tipografia, esOscuro } = useTema();
  const styles = useEstilos(crearEstilos);
  const { fecha: fechaParam, alimentoId } = useLocalSearchParams<{ fecha?: string; alimentoId?: string }>();
  const fecha = fechaParam ?? hoy();
  const alimentos = useAlimentos();
  const { recientes } = useDatosUsuario();
  const agregarRegistro = useApp((s) => s.agregarRegistro);
  const eliminarAlimento = useApp((s) => s.eliminarAlimento);

  const [consulta, setConsulta] = useState('');
  const [elegido, setElegidoEstado] = useState<Alimento | null>(
    () => alimentos.find((a) => a.id === alimentoId) ?? null,
  );
  // Cantidad en g o ml según el alimento, y la medida casera si se eligió con un atajo.
  const [texto, setTexto] = useState('');
  const [medida, setMedida] = useState<string | undefined>();
  // Lista: solo una casilla deslizada a la vez, y el producto pendiente de confirmar su eliminación.
  const [abiertaId, setAbiertaId] = useState<string | null>(null);
  const [porEliminar, setPorEliminar] = useState<Alimento | null>(null);

  const setElegido = (a: Alimento | null) => {
    setElegidoEstado(a);
    setTexto('');
    setMedida(undefined);
  };

  // Al volver de "Nuevo alimento" llega el id del alimento recién creado.
  const [idAplicado, setIdAplicado] = useState(alimentoId);
  if (alimentoId !== idAplicado) {
    setIdAplicado(alimentoId);
    const nuevo = alimentos.find((x) => x.id === alimentoId);
    if (nuevo) setElegido(nuevo);
  }

  const resultados = useMemo(() => buscarAlimentos(alimentos, consulta), [alimentos, consulta]);
  const alimentosRecientes = useMemo(
    () => recientes.map((id) => alimentos.find((a) => a.id === id)).filter((a): a is Alimento => !!a),
    [recientes, alimentos],
  );

  const cantidad = Number(texto);
  const valido = !!elegido && cantidad > 0 && cantidad <= 10000;
  const vista = elegido && cantidad > 0 ? macrosPara(elegido, cantidad) : { proteina: 0, carbos: 0 };

  const guardar = () => {
    if (!elegido || !valido) return;
    agregarRegistro(fecha, elegido, cantidad, medida);
    router.back();
  };

  return (
    <SafeAreaView style={styles.pantalla} edges={['top', 'bottom']}>
      <View style={styles.cabecera}>
        <CabeceraModal titulo="Agregar comida" />
        <Text style={tipografia.secundario}>{fecha === hoy() ? 'Hoy' : formatoLargo(fecha)}</Text>
      </View>

      {elegido ? (
        <ScrollView
          contentContainerStyle={styles.cuerpo}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
        >
          <Tarjeta style={{ gap: espacio.lg }}>
            <View style={styles.filaElegido}>
              <View style={{ flex: 1 }}>
                <Text style={tipografia.etiqueta}>{elegido.categoria}</Text>
                <Text style={tipografia.subtitulo}>{elegido.nombre}</Text>
                <Text style={tipografia.secundario}>
                  {`Por 100 ${unidadDe(elegido)}: ${elegido.proteinaPor100g} g proteína · ${elegido.carbosPor100g} g carbos`}
                </Text>
              </View>
              <Boton texto="Cambiar" variante="texto" onPress={() => setElegido(null)} />
            </View>

            <SelectorCantidad
              unidad={unidadDe(elegido)}
              valor={texto}
              medida={medida}
              onChange={(v, m) => {
                setTexto(v);
                setMedida(m);
              }}
              onListo={guardar}
            />

            <Separador />
            <View style={styles.vista}>
              <Vista titulo="Proteínas" valor={vista.proteina} color={colors.proteina} />
              <Vista titulo="Carbohidratos" valor={vista.carbos} color={colors.carbos} />
            </View>
          </Tarjeta>
          <Boton texto="Guardar comida" onPress={guardar} deshabilitado={!valido} />
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>
          <View style={styles.buscador}>
            <TextInput
              value={consulta}
              onChangeText={setConsulta}
              placeholder="Buscar: pollo, arroz, atún…"
              placeholderTextColor={colors.textoTenue}
              keyboardAppearance={esOscuro ? 'dark' : 'light'}
              style={styles.input}
              autoCorrect={false}
              autoFocus
            />
          </View>
          <FlatList
            data={resultados}
            keyExtractor={(a) => a.id}
            keyboardShouldPersistTaps="handled"
            extraData={abiertaId}
            onScrollBeginDrag={() => setAbiertaId(null)}
            contentContainerStyle={{ paddingHorizontal: espacio.lg, paddingBottom: espacio.xxl }}
            ItemSeparatorComponent={Separador}
            ListHeaderComponent={
              <View style={{ gap: espacio.md, paddingBottom: espacio.sm }}>
                {consulta === '' && alimentosRecientes.length > 0 ? (
                  <View>
                    <Text style={[tipografia.etiqueta, { marginBottom: espacio.sm }]}>Recientes</Text>
                    <View style={styles.atajos}>
                      {alimentosRecientes.map((a) => (
                        <Chip key={a.id} texto={a.nombre} onPress={() => setElegido(a)} />
                      ))}
                    </View>
                  </View>
                ) : null}
                <Pressable
                  onPress={() => router.push({ pathname: '/alimento-nuevo', params: { fecha, nombre: consulta } })}
                  style={styles.crear}
                >
                  <Text style={[tipografia.cuerpo, { fontWeight: '600' }]}>+ Crear alimento propio</Text>
                  <Text style={tipografia.secundario}>¿No lo encuentras? Añade sus valores por 100 g o 100 ml.</Text>
                </Pressable>
                <Text style={[tipografia.secundario, styles.pista]}>
                  Desliza un producto a la izquierda para editarlo o eliminarlo.
                </Text>
              </View>
            }
            ListEmptyComponent={
              <Text style={[tipografia.secundario, { textAlign: 'center', paddingVertical: espacio.xl }]}>
                No hay resultados para “{consulta}”.
              </Text>
            }
            renderItem={({ item }) => (
              <FilaAlimentoDeslizable
                alimento={item}
                abierta={abiertaId === item.id}
                onAbrir={() => setAbiertaId(item.id)}
                onCerrar={() => setAbiertaId((id) => (id === item.id ? null : id))}
                onElegir={() => {
                  setAbiertaId(null);
                  setElegido(item);
                }}
                onEditar={() => {
                  setAbiertaId(null);
                  router.push({ pathname: '/editar-alimento', params: { id: item.id } });
                }}
                onEliminar={() => {
                  setAbiertaId(item.id);
                  setPorEliminar(item);
                }}
              />
            )}
          />
        </View>
      )}

      <DialogoConfirmacion
        visible={!!porEliminar}
        titulo={porEliminar ? `¿Eliminar «${porEliminar.nombre}»?` : ''}
        mensaje={porEliminar ? mensajeEliminarAlimento(porEliminar) : ''}
        onCancelar={() => {
          setPorEliminar(null);
          setAbiertaId(null);
        }}
        onConfirmar={() => {
          if (porEliminar) eliminarAlimento(porEliminar.id);
          setPorEliminar(null);
          setAbiertaId(null);
        }}
      />
    </SafeAreaView>
  );
}

function Vista({ titulo, valor, color }: { titulo: string; valor: number; color: string }) {
  const { tipografia } = useTema();
  const styles = useEstilos(crearEstilos);
  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.punto, { backgroundColor: color }]} />
      <Text style={styles.vistaValor}>{valor} g</Text>
      <Text style={tipografia.secundario}>{titulo}</Text>
    </View>
  );
}

const crearEstilos = (colors: Paleta) =>
  StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.fondo },
  cabecera: { padding: espacio.lg, paddingBottom: espacio.sm, gap: 2 },
  cuerpo: { padding: espacio.lg, gap: espacio.lg },
  filaElegido: { flexDirection: 'row', alignItems: 'flex-start', gap: espacio.sm },
  buscador: { paddingHorizontal: espacio.lg, paddingBottom: espacio.md },
  input: {
    backgroundColor: colors.superficie,
    borderRadius: radios.md,
    borderWidth: 1,
    borderColor: colors.borde,
    paddingHorizontal: espacio.lg,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.texto,
  },
  pista: { fontSize: 12, color: colors.textoTenue },
  crear: {
    borderRadius: radios.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.textoTenue,
    padding: espacio.md,
    gap: 2,
  },
  atajos: { flexDirection: 'row', flexWrap: 'wrap', gap: espacio.sm },
  vista: { flexDirection: 'row', gap: espacio.lg },
  punto: { width: 8, height: 8, borderRadius: 4, marginBottom: espacio.xs },
  vistaValor: { fontSize: 24, fontWeight: '700', color: colors.texto },
});
