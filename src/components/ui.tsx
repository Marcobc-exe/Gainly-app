import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, espacio, radios, tipografia } from '@/theme/colors';

export function Pantalla({
  children,
  scroll = true,
  bordes = ['top'],
}: {
  children: ReactNode;
  scroll?: boolean;
  bordes?: ('top' | 'bottom')[];
}) {
  return (
    <SafeAreaView style={styles.pantalla} edges={bordes}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.contenido}
          keyboardShouldPersistTaps="handled"
          // iOS: deja sitio al teclado y desplaza hasta el campo enfocado.
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.contenido, { flex: 1 }]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

export function Tarjeta({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.tarjeta, style]}>{children}</View>;
}

export function Titulo({ children }: { children: ReactNode }) {
  return <Text style={tipografia.titulo}>{children}</Text>;
}

export function Etiqueta({ children }: { children: ReactNode }) {
  return <Text style={[tipografia.etiqueta, { marginBottom: espacio.sm }]}>{children}</Text>;
}

export function Boton({
  texto,
  onPress,
  variante = 'primario',
  deshabilitado,
  cargando,
  icono,
  style,
}: {
  texto: string;
  onPress: () => void;
  variante?: 'primario' | 'secundario' | 'texto' | 'peligro';
  deshabilitado?: boolean;
  cargando?: boolean;
  icono?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const primario = variante === 'primario';
  const colorTexto = primario
    ? colors.sobreAcento
    : variante === 'peligro'
      ? colors.peligro
      : colors.texto;
  return (
    <Pressable
      onPress={onPress}
      disabled={deshabilitado || cargando}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.boton,
        primario && styles.botonPrimario,
        variante === 'secundario' && styles.botonSecundario,
        (variante === 'texto' || variante === 'peligro') && styles.botonTexto,
        (deshabilitado || cargando) && { opacity: 0.4 },
        pressed && { opacity: 0.7 },
        style,
      ]}
    >
      {cargando ? (
        <ActivityIndicator color={colorTexto} />
      ) : (
        <>
          {icono}
          <Text style={[styles.botonTexto_, { color: colorTexto }]}>{texto}</Text>
        </>
      )}
    </Pressable>
  );
}

export function CampoNumero({
  etiqueta,
  valor,
  onChange,
  sufijo,
  ...rest
}: {
  etiqueta?: string;
  valor: string;
  onChange: (v: string) => void;
  sufijo?: string;
} & Omit<TextInputProps, 'value' | 'onChangeText' | 'onChange'>) {
  return (
    <View style={{ flex: 1 }}>
      {etiqueta ? <Etiqueta>{etiqueta}</Etiqueta> : null}
      <View style={styles.campo}>
        <TextInput
          value={valor}
          onChangeText={(t) => onChange(t.replace(',', '.').replace(/[^0-9.]/g, ''))}
          keyboardType="decimal-pad"
          placeholderTextColor={colors.textoTenue}
          style={styles.campoInput}
          {...rest}
        />
        {sufijo ? <Text style={styles.sufijo}>{sufijo}</Text> : null}
      </View>
    </View>
  );
}

export function CampoTexto(props: TextInputProps & { etiqueta?: string }) {
  const { etiqueta, style, ...rest } = props;
  return (
    <View>
      {etiqueta ? <Etiqueta>{etiqueta}</Etiqueta> : null}
      <View style={styles.campo}>
        <TextInput placeholderTextColor={colors.textoTenue} style={[styles.campoInput, style]} {...rest} />
      </View>
    </View>
  );
}

/** Lista de opciones excluyentes, con descripción opcional. */
export function Opciones<T extends string>({
  opciones,
  valor,
  onChange,
  horizontal,
}: {
  opciones: { valor: T; titulo: string; descripcion?: string }[];
  valor: T | undefined;
  onChange: (v: T) => void;
  horizontal?: boolean;
}) {
  return (
    <View style={horizontal ? { flexDirection: 'row', gap: espacio.sm } : { gap: espacio.sm }}>
      {opciones.map((o) => {
        const activo = o.valor === valor;
        return (
          <Pressable
            key={o.valor}
            onPress={() => onChange(o.valor)}
            accessibilityRole="radio"
            accessibilityState={{ selected: activo }}
            style={[styles.opcion, horizontal && { flex: 1, alignItems: 'center' }, activo && styles.opcionActiva]}
          >
            <Text style={[styles.opcionTitulo, activo && { color: colors.sobreAcento }]}>{o.titulo}</Text>
            {o.descripcion ? (
              <Text style={[tipografia.secundario, { marginTop: 2 }, activo && { color: '#DADAD8' }]}>
                {o.descripcion}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

/** Selector de entero con botones − / +. */
export function Contador({
  valor,
  onChange,
  min,
  max,
  sufijo,
}: {
  valor: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  sufijo?: string;
}) {
  return (
    <View style={styles.contador}>
      <Pressable
        onPress={() => onChange(Math.max(min, valor - 1))}
        style={styles.contadorBtn}
        accessibilityLabel="Restar"
      >
        <Text style={styles.contadorSigno}>−</Text>
      </Pressable>
      <View style={{ alignItems: 'center', minWidth: 90 }}>
        <Text style={styles.contadorValor}>{valor}</Text>
        {sufijo ? <Text style={tipografia.secundario}>{sufijo}</Text> : null}
      </View>
      <Pressable
        onPress={() => onChange(Math.min(max, valor + 1))}
        style={styles.contadorBtn}
        accessibilityLabel="Sumar"
      >
        <Text style={styles.contadorSigno}>+</Text>
      </Pressable>
    </View>
  );
}

export function Chip({ texto, activo, onPress }: { texto: string; activo?: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!activo }}
      style={[styles.chip, activo && styles.chipActivo]}
    >
      <Text style={[styles.chipTexto, activo && { color: colors.sobreAcento }]} numberOfLines={1}>
        {texto}
      </Text>
    </Pressable>
  );
}

export function Separador() {
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.borde }} />;
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.fondo },
  contenido: { padding: espacio.lg, paddingBottom: 120, gap: espacio.lg },
  tarjeta: {
    backgroundColor: colors.superficie,
    borderRadius: radios.lg,
    padding: espacio.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borde,
  },
  boton: {
    minHeight: 52,
    borderRadius: radios.md,
    paddingHorizontal: espacio.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: espacio.sm,
  },
  botonPrimario: { backgroundColor: colors.acento },
  botonSecundario: { backgroundColor: colors.superficie, borderWidth: 1, borderColor: colors.borde },
  botonTexto: { backgroundColor: 'transparent', minHeight: 44 },
  botonTexto_: { fontSize: 16, fontWeight: '600' },
  campo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.superficie,
    borderRadius: radios.md,
    borderWidth: 1,
    borderColor: colors.borde,
    paddingHorizontal: espacio.md,
  },
  campoInput: { flex: 1, fontSize: 17, color: colors.texto, paddingVertical: 14, minWidth: 0 },
  sufijo: { fontSize: 15, color: colors.textoSecundario, marginLeft: espacio.xs },
  opcion: {
    backgroundColor: colors.superficie,
    borderRadius: radios.md,
    borderWidth: 1,
    borderColor: colors.borde,
    paddingVertical: 14,
    paddingHorizontal: espacio.lg,
  },
  opcionActiva: { backgroundColor: colors.acento, borderColor: colors.acento },
  opcionTitulo: { fontSize: 16, fontWeight: '600', color: colors.texto },
  contador: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.superficie,
    borderRadius: radios.lg,
    borderWidth: 1,
    borderColor: colors.borde,
    padding: espacio.sm,
  },
  contadorBtn: {
    width: 56,
    height: 56,
    borderRadius: radios.md,
    backgroundColor: colors.superficieAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contadorSigno: { fontSize: 26, color: colors.texto, fontWeight: '500' },
  contadorValor: { fontSize: 34, fontWeight: '700', color: colors.texto },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radios.xl,
    backgroundColor: colors.superficie,
    borderWidth: 1,
    borderColor: colors.borde,
    maxWidth: '100%',
  },
  chipActivo: { backgroundColor: colors.acento, borderColor: colors.acento },
  chipTexto: { fontSize: 14, color: colors.texto, fontWeight: '500' },
});
