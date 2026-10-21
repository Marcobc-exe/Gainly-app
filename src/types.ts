export type Sexo = 'hombre' | 'mujer';
export type Objetivo = 'perder_grasa' | 'recomposicion' | 'mantener' | 'ganar_musculo';
export type ActividadDiaria = 'sedentaria' | 'ligera' | 'activa' | 'muy_activa';
export type TipoEntrenamiento = 'calistenia' | 'hipertrofia' | 'cardio';

export interface Umbrales {
  /** % mínimo (del macro más bajo) para considerar el día logrado. */
  logrado: number;
  /** % mínimo para considerar el día casi logrado. */
  casi: number;
}

export interface Metas {
  proteina: number;
  carbos: number;
}

export interface Perfil {
  nombre: string;
  sexo: Sexo;
  edad: number;
  alturaCm: number;
  pesoKg: number;
  objetivo: Objetivo;
  /** Junto con el objetivo decide los g/kg de proteína. Por defecto 'hipertrofia'. */
  tipoEntrenamiento: TipoEntrenamiento;
  diasEntrenoSemana: number;
  actividadDiaria: ActividadDiaria;
  umbrales: Umbrales;
  /** Si existe, reemplaza las metas calculadas. */
  metasManuales?: Metas;
}

export type CategoriaAlimento =
  | 'Carnes'
  | 'Aves'
  | 'Pescados'
  | 'Huevos y lácteos'
  | 'Legumbres'
  | 'Cereales y pastas'
  | 'Tubérculos'
  | 'Verduras y vegetales'
  | 'Panes'
  | 'Frutas'
  | 'Suplementos'
  | 'Leches'
  | 'Cafés'
  | 'Chocolates y batidos'
  | 'Zumos y jugos'
  | 'Bebidas proteicas'
  | 'Otras bebidas'
  | 'Personalizados';

/** Sólidos se miden en gramos y líquidos en mililitros. */
export type Unidad = 'g' | 'ml';

export interface Alimento {
  id: string;
  nombre: string;
  categoria: CategoriaAlimento;
  /** Por cada 100 g, o por cada 100 ml si es líquido. */
  proteinaPor100g: number;
  carbosPor100g: number;
  /** Por defecto 'g'. */
  unidad?: Unidad;
  esPersonalizado?: boolean;
  /** Lo añade `combinarAlimentos`: creado por el usuario, incluido tal cual o incluido con cambios. */
  origen?: 'propio' | 'incluido' | 'modificado';
}

/** Campos de un producto que el usuario puede editar. */
export type CambiosAlimento = Pick<Alimento, 'nombre' | 'proteinaPor100g' | 'carbosPor100g'> & { unidad: Unidad };

export interface RegistroComida {
  id: string;
  /** YYYY-MM-DD */
  fecha: string;
  alimentoId: string;
  nombreAlimento: string;
  /** En gramos o mililitros según `unidad`. */
  cantidad: number;
  unidad: Unidad;
  /** Medida casera elegida, p. ej. "2 vasos". */
  medida?: string;
  proteina: number;
  carbos: number;
  creadoEn: number;
}

export type EstadoDia = 'logrado' | 'casi' | 'no_logrado' | 'vacio';

export type ProveedorAuth = 'google' | 'facebook' | 'apple';

export interface Usuario {
  id: string;
  proveedor: ProveedorAuth;
  nombre: string;
}
