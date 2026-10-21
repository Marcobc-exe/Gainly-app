import type { ActividadDiaria, Metas, Objetivo, Perfil, TipoEntrenamiento } from '@/types';

export const FACTOR_ACTIVIDAD: Record<ActividadDiaria, number> = {
  sedentaria: 1.2,
  ligera: 1.35,
  activa: 1.5,
  muy_activa: 1.65,
};

/** Ajuste por día de entrenamiento semanal, sumado al factor base. */
export const FACTOR_POR_DIA_ENTRENO = 0.035;
export const FACTOR_MAXIMO = 1.9;

export const AJUSTE_CALORIAS: Record<Objetivo, number> = {
  perder_grasa: -0.2,
  // Recomposición: déficit pequeño para perder grasa sin frenar la ganancia muscular.
  recomposicion: -0.1,
  mantener: 0,
  ganar_musculo: 0.1,
};

export const TIPO_ENTRENAMIENTO_POR_DEFECTO: TipoEntrenamiento = 'hipertrofia';

/** Proteína (g por kg de peso) según el tipo de entrenamiento y el plan de dieta. */
export const PROTEINA_G_KG: Record<TipoEntrenamiento, Record<Objetivo, number>> = {
  // Máxima síntesis proteica por daño muscular con pesas.
  hipertrofia: { perder_grasa: 2.2, recomposicion: 2.2, mantener: 1.6, ganar_musculo: 2.0 },
  // Fuerza relativa con peso corporal: algo menos de proteína y más reserva de glucógeno.
  calistenia: { perder_grasa: 1.85, recomposicion: 1.8, mantener: 1.6, ganar_musculo: 1.7 },
  // Resistencia: prioriza reponer glucógeno.
  cardio: { perder_grasa: 1.6, recomposicion: 1.6, mantener: 1.4, ganar_musculo: 1.5 },
};

export const GRASA_G_KG = 0.9;

export type DatosCalculo = Pick<
  Perfil,
  'sexo' | 'edad' | 'alturaCm' | 'pesoKg' | 'objetivo' | 'diasEntrenoSemana' | 'actividadDiaria'
> &
  Partial<Pick<Perfil, 'tipoEntrenamiento'>>;

export interface Desglose extends Metas {
  tmb: number;
  factor: number;
  get: number;
  calorias: number;
  grasa: number;
}

/** Tasa metabólica basal (Mifflin-St Jeor). */
export function calcularTMB({ sexo, edad, alturaCm, pesoKg }: DatosCalculo): number {
  return 10 * pesoKg + 6.25 * alturaCm - 5 * edad + (sexo === 'hombre' ? 5 : -161);
}

export function calcularFactor({ actividadDiaria, diasEntrenoSemana }: DatosCalculo): number {
  const dias = Math.max(0, Math.min(7, diasEntrenoSemana));
  return Math.min(FACTOR_MAXIMO, FACTOR_ACTIVIDAD[actividadDiaria] + dias * FACTOR_POR_DIA_ENTRENO);
}

export function calcularDesglose(d: DatosCalculo): Desglose {
  const tmb = calcularTMB(d);
  const factor = calcularFactor(d);
  const get = tmb * factor;
  const calorias = Math.round(get * (1 + AJUSTE_CALORIAS[d.objetivo]));

  const tipo = d.tipoEntrenamiento ?? TIPO_ENTRENAMIENTO_POR_DEFECTO;
  const proteina = Math.round(d.pesoKg * PROTEINA_G_KG[tipo][d.objetivo]);
  const grasa = Math.round(d.pesoKg * GRASA_G_KG);
  // Todas las calorías que quedan tras proteínas y grasas van a carbohidratos.
  const carbos = Math.max(0, Math.round((calorias - proteina * 4 - grasa * 9) / 4));

  return {
    tmb: Math.round(tmb),
    factor: Math.round(factor * 1000) / 1000,
    get: Math.round(get),
    calorias,
    grasa,
    proteina,
    carbos,
  };
}

/** Cambia el plan de dieta; las metas pasan a ser las recomendadas para el nuevo plan. */
export function cambiarPlan(perfil: Perfil, objetivo: Objetivo): Perfil {
  return { ...perfil, objetivo, metasManuales: undefined };
}

/** Cambia el tipo de entrenamiento; como con el plan, las metas pasan a ser las recomendadas. */
export function cambiarTipoEntrenamiento(perfil: Perfil, tipoEntrenamiento: TipoEntrenamiento): Perfil {
  return { ...perfil, tipoEntrenamiento, metasManuales: undefined };
}

/** Metas efectivas del perfil: las manuales si existen, si no las calculadas. */
export function metasDePerfil(perfil: Perfil): Metas {
  if (perfil.metasManuales) return perfil.metasManuales;
  const { proteina, carbos } = calcularDesglose(perfil);
  return { proteina, carbos };
}
