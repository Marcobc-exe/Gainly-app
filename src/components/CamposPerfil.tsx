import { Text, View } from 'react-native';

import { CampoNumero, CampoTexto, Contador, Etiqueta, Opciones } from '@/components/ui';
import { UMBRALES_POR_DEFECTO } from '@/lib/estadoDia';
import { TIPO_ENTRENAMIENTO_POR_DEFECTO, type DatosCalculo } from '@/lib/objetivos';
import { espacio, tipografia } from '@/theme/colors';
import type { ActividadDiaria, Objetivo, Perfil, Sexo, TipoEntrenamiento } from '@/types';

/** Estado editable del formulario (números como texto mientras se escriben). */
export interface BorradorPerfil {
  nombre: string;
  sexo?: Sexo;
  edad: string;
  alturaCm: string;
  pesoKg: string;
  objetivo?: Objetivo;
  tipoEntrenamiento: TipoEntrenamiento;
  diasEntrenoSemana: number;
  actividadDiaria?: ActividadDiaria;
}

export const borradorVacio = (nombre = ''): BorradorPerfil => ({
  nombre,
  edad: '',
  alturaCm: '',
  pesoKg: '',
  tipoEntrenamiento: TIPO_ENTRENAMIENTO_POR_DEFECTO,
  diasEntrenoSemana: 3,
});

export const borradorDesdePerfil = (p: Perfil): BorradorPerfil => ({
  nombre: p.nombre,
  sexo: p.sexo,
  edad: String(p.edad),
  alturaCm: String(p.alturaCm),
  pesoKg: String(p.pesoKg),
  objetivo: p.objetivo,
  tipoEntrenamiento: p.tipoEntrenamiento ?? TIPO_ENTRENAMIENTO_POR_DEFECTO,
  diasEntrenoSemana: p.diasEntrenoSemana,
  actividadDiaria: p.actividadDiaria,
});

export function errorDatosBasicos(b: BorradorPerfil): string | null {
  const edad = Number(b.edad);
  const altura = Number(b.alturaCm);
  const peso = Number(b.pesoKg);
  if (!b.sexo) return 'Selecciona tu sexo.';
  if (!b.edad || !Number.isInteger(edad) || edad < 14 || edad > 100) return 'Introduce una edad entre 14 y 100 años.';
  if (!b.alturaCm || altura < 120 || altura > 230) return 'Introduce una altura entre 120 y 230 cm.';
  if (!b.pesoKg || peso < 35 || peso > 250) return 'Introduce un peso entre 35 y 250 kg.';
  return null;
}

/** Devuelve los datos de cálculo si el borrador está completo y es válido. */
export function datosDeBorrador(b: BorradorPerfil): DatosCalculo | null {
  if (errorDatosBasicos(b) || !b.objetivo || !b.actividadDiaria) return null;
  return {
    sexo: b.sexo!,
    edad: Number(b.edad),
    alturaCm: Number(b.alturaCm),
    pesoKg: Number(b.pesoKg),
    objetivo: b.objetivo,
    tipoEntrenamiento: b.tipoEntrenamiento,
    diasEntrenoSemana: b.diasEntrenoSemana,
    actividadDiaria: b.actividadDiaria,
  };
}

export function perfilDeBorrador(b: BorradorPerfil, anterior?: Perfil): Perfil | null {
  const datos = datosDeBorrador(b);
  if (!datos) return null;
  return {
    ...datos,
    tipoEntrenamiento: b.tipoEntrenamiento,
    nombre: b.nombre.trim(),
    umbrales: anterior?.umbrales ?? UMBRALES_POR_DEFECTO,
    metasManuales: anterior?.metasManuales,
  };
}

export const OPCIONES_OBJETIVO: { valor: Objetivo; titulo: string; descripcion: string }[] = [
  { valor: 'perder_grasa', titulo: 'Déficit · perder grasa', descripcion: 'Déficit calórico moderado y proteína alta para conservar músculo.' },
  {
    valor: 'recomposicion',
    titulo: 'Recomposición · perder grasa y ganar músculo',
    descripcion: 'Déficit pequeño y proteína alta. Requiere entrenar fuerza; el progreso es más lento.',
  },
  { valor: 'mantener', titulo: 'Mantención', descripcion: 'Mantener el peso actual y mejorar la composición.' },
  { valor: 'ganar_musculo', titulo: 'Aumento muscular', descripcion: 'Ligero superávit calórico para progresar en fuerza y masa.' },
];

export const OPCIONES_ACTIVIDAD: { valor: ActividadDiaria; titulo: string; descripcion: string }[] = [
  {
    valor: 'sedentaria',
    titulo: 'Muy sedentaria',
    descripcion: 'Trabajo sentado, casi no camino. Solo me muevo para entrenar.',
  },
  {
    valor: 'ligera',
    titulo: 'Ligera',
    descripcion: 'Trabajo sentado pero camino a diario o hago recados a pie.',
  },
  {
    valor: 'activa',
    titulo: 'Activa',
    descripcion: 'Trabajo de pie o en movimiento y además entreno.',
  },
  {
    valor: 'muy_activa',
    titulo: 'Muy activa',
    descripcion: 'Trabajo físico exigente (obra, reparto, almacén) y además entreno.',
  },
];

export const OPCIONES_TIPO_ENTRENAMIENTO: { valor: TipoEntrenamiento; titulo: string; descripcion: string }[] = [
  { valor: 'calistenia', titulo: 'Calistenia', descripcion: 'Fuerza relativa y peso corporal.' },
  { valor: 'hipertrofia', titulo: 'Hipertrofia', descripcion: 'Pesas y musculación.' },
  { valor: 'cardio', titulo: 'Cardio', descripcion: 'Resistencia y acondicionamiento.' },
];

export const TEXTO_TIPO_ENTRENAMIENTO = Object.fromEntries(
  OPCIONES_TIPO_ENTRENAMIENTO.map((o) => [o.valor, o.titulo]),
) as Record<TipoEntrenamiento, string>;

export const TEXTO_OBJETIVO = Object.fromEntries(OPCIONES_OBJETIVO.map((o) => [o.valor, o.titulo])) as Record<
  Objetivo,
  string
>;
export const TEXTO_ACTIVIDAD = Object.fromEntries(OPCIONES_ACTIVIDAD.map((o) => [o.valor, o.titulo])) as Record<
  ActividadDiaria,
  string
>;

interface CampoProps {
  borrador: BorradorPerfil;
  cambiar: (parcial: Partial<BorradorPerfil>) => void;
}

export function CamposBasicos({ borrador, cambiar }: CampoProps) {
  return (
    <View style={{ gap: espacio.lg }}>
      <CampoTexto
        etiqueta="Nombre (opcional)"
        value={borrador.nombre}
        onChangeText={(nombre) => cambiar({ nombre })}
        placeholder="¿Cómo te llamamos?"
        autoCapitalize="words"
      />
      <View>
        <Etiqueta>Sexo</Etiqueta>
        <Opciones
          horizontal
          valor={borrador.sexo}
          onChange={(sexo) => cambiar({ sexo })}
          opciones={[
            { valor: 'hombre', titulo: 'Hombre' },
            { valor: 'mujer', titulo: 'Mujer' },
          ]}
        />
      </View>
      <View style={{ flexDirection: 'row', gap: espacio.md }}>
        <CampoNumero
          etiqueta="Edad"
          valor={borrador.edad}
          onChange={(edad) => cambiar({ edad: edad.replace('.', '') })}
          sufijo="años"
          keyboardType="number-pad"
          placeholder="30"
        />
        <CampoNumero
          etiqueta="Altura"
          valor={borrador.alturaCm}
          onChange={(alturaCm) => cambiar({ alturaCm })}
          sufijo="cm"
          placeholder="175"
        />
        <CampoNumero
          etiqueta="Peso"
          valor={borrador.pesoKg}
          onChange={(pesoKg) => cambiar({ pesoKg })}
          sufijo="kg"
          placeholder="75"
        />
      </View>
      <Text style={tipografia.secundario}>El sexo se usa solo para estimar tu metabolismo basal.</Text>
    </View>
  );
}

export function CampoObjetivo({ borrador, cambiar }: CampoProps) {
  return (
    <Opciones
      valor={borrador.objetivo}
      onChange={(objetivo) => cambiar({ objetivo })}
      opciones={OPCIONES_OBJETIVO}
    />
  );
}

export function CampoTipoEntrenamiento({ borrador, cambiar }: CampoProps) {
  return (
    <Opciones
      valor={borrador.tipoEntrenamiento}
      onChange={(tipoEntrenamiento) => cambiar({ tipoEntrenamiento })}
      opciones={OPCIONES_TIPO_ENTRENAMIENTO}
    />
  );
}

export function CampoEntreno({ borrador, cambiar }: CampoProps) {
  const d = borrador.diasEntrenoSemana;
  return (
    <Contador
      valor={d}
      min={0}
      max={7}
      onChange={(diasEntrenoSemana) => cambiar({ diasEntrenoSemana })}
      sufijo={d === 1 ? 'día por semana' : 'días por semana'}
    />
  );
}

export function CampoActividad({ borrador, cambiar }: CampoProps) {
  return (
    <Opciones
      valor={borrador.actividadDiaria}
      onChange={(actividadDiaria) => cambiar({ actividadDiaria })}
      opciones={OPCIONES_ACTIVIDAD}
    />
  );
}
