import { router, useLocalSearchParams } from 'expo-router';
import { Fragment, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CabeceraModal } from '@/components/CabeceraModal';
import { DialogoConfirmacion, mensajeEliminarAlimento } from '@/components/DialogoConfirmacion';
import { FormularioAlimento } from '@/components/FormularioAlimento';
import { Boton, Etiqueta, Pantalla, Separador, Tarjeta } from '@/components/ui';
import { macrosPara } from '@/data/alimentos';
import { atajosCantidad, unidadDe } from '@/data/medidas';
import { useAlimentos, useApp } from '@/store/useApp';
import { espacio, type Paleta } from '@/theme/colors';
import { useEstilos, useTema } from '@/theme/TemaProvider';
import type { Alimento } from '@/types';

const TEXTO_ORIGEN: Record<NonNullable<Alimento['origen']>, string> = {
  incluido: 'Incluido en la app',
  modificado: 'Incluido · modificado por ti',
  propio: 'Creado por ti',
};

export default function EditarAlimento() {
  const { tipografia } = useTema();
  const styles = useEstilos(crearEstilos);
  const { id } = useLocalSearchParams<{ id: string }>();
  const alimento = useAlimentos().find((a) => a.id === id);
  const editarAlimento = useApp((s) => s.editarAlimento);
  const eliminarAlimento = useApp((s) => s.eliminarAlimento);
  const restaurarAlimento = useApp((s) => s.restaurarAlimento);
  const [confirmando, setConfirmando] = useState(false);

  const volver = () => (router.canGoBack() ? router.back() : router.replace('/'));

  if (!alimento) {
    return (
      <Pantalla bordes={['top', 'bottom']}>
        <CabeceraModal titulo="Producto" tipo="atras" />
        <Text style={tipografia.secundario}>Este producto ya no está en tu lista.</Text>
      </Pantalla>
    );
  }

  const unidad = unidadDe(alimento);
  // Primero la referencia por 100 g/ml y luego las porciones habituales (sin repetir los 100 g).
  const porciones = [
    { texto: `100 ${unidad}`, cantidad: 100 },
    ...atajosCantidad(unidad).filter((a) => a.medida || a.cantidad !== 100),
  ];

  return (
    <Pantalla bordes={['top', 'bottom']}>
      <CabeceraModal titulo="Producto" tipo="atras" />

      <Tarjeta style={{ gap: espacio.md }}>
        <View>
          <Text style={tipografia.etiqueta}>{alimento.categoria}</Text>
          <Text style={tipografia.subtitulo}>{alimento.nombre}</Text>
          <Text style={tipografia.secundario}>
            {alimento.origen ? TEXTO_ORIGEN[alimento.origen] : ''} ·{' '}
            {unidad === 'ml' ? 'Líquido (ml)' : 'Sólido (g)'}
          </Text>
        </View>
        <Separador />
        <View style={styles.fila}>
          <Text style={[tipografia.etiqueta, styles.colPorcion]}>Porción</Text>
          <Text style={[tipografia.etiqueta, styles.colValor]}>Proteínas</Text>
          <Text style={[tipografia.etiqueta, styles.colValor]}>Carbos</Text>
        </View>
        {porciones.map((p, i) => {
          const m = macrosPara(alimento, p.cantidad);
          return (
            <Fragment key={p.texto}>
              {i === 1 ? <Separador /> : null}
              <View style={styles.fila}>
                <Text style={[tipografia.cuerpo, styles.colPorcion]}>{p.texto}</Text>
                <Text style={[tipografia.cuerpo, styles.colValor]}>{m.proteina} g</Text>
                <Text style={[tipografia.cuerpo, styles.colValor]}>{m.carbos} g</Text>
              </View>
            </Fragment>
          );
        })}
      </Tarjeta>

      <View>
        <Etiqueta>Editar</Etiqueta>
        <Tarjeta>
          <FormularioAlimento
            // Al restaurar cambian los valores y el formulario se reinicia.
            key={`${alimento.nombre}|${alimento.proteinaPor100g}|${alimento.carbosPor100g}|${unidad}`}
            inicial={{
              nombre: alimento.nombre,
              proteinaPor100g: alimento.proteinaPor100g,
              carbosPor100g: alimento.carbosPor100g,
              unidad,
            }}
            textoGuardar="Guardar cambios"
            onGuardar={(cambios) => {
              editarAlimento(alimento.id, cambios);
              volver();
            }}
          />
        </Tarjeta>
      </View>

      {alimento.origen !== 'propio' ? (
        <Text style={tipografia.secundario}>
          Los cambios en productos incluidos solo afectan a tu cuenta. Tus registros anteriores no cambian.
        </Text>
      ) : null}

      {alimento.origen === 'modificado' ? (
        <Boton
          texto="Restaurar valores originales"
          variante="secundario"
          onPress={() => restaurarAlimento(alimento.id)}
        />
      ) : null}
      <Boton texto="Eliminar producto" variante="peligro" onPress={() => setConfirmando(true)} />

      <DialogoConfirmacion
        visible={confirmando}
        titulo={`¿Eliminar «${alimento.nombre}»?`}
        mensaje={mensajeEliminarAlimento(alimento)}
        onCancelar={() => setConfirmando(false)}
        onConfirmar={() => {
          setConfirmando(false);
          eliminarAlimento(alimento.id);
          volver();
        }}
      />
    </Pantalla>
  );
}

const crearEstilos = (colors: Paleta) =>
  StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center' },
  colPorcion: { flex: 1.6 },
  colValor: { flex: 1, textAlign: 'right' },
});
