import { capitalizar } from '@/lib/fechas';
import type { Alimento, Unidad } from '@/types';

export interface MedidaLiquido {
  nombre: string;
  ml: number;
}

/** Medidas caseras habituales para líquidos (cada una equivale a una unidad). */
export const MEDIDAS_LIQUIDO: MedidaLiquido[] = [
  { nombre: 'vaso', ml: 200 },
  { nombre: 'taza', ml: 250 },
  { nombre: 'lata', ml: 330 },
  { nombre: 'botella', ml: 500 },
  { nombre: 'cucharada', ml: 15 },
  { nombre: 'cucharadita', ml: 5 },
];

export const unidadDe = (a: Pick<Alimento, 'unidad'>): Unidad => a.unidad ?? 'g';

const numero = (n: number) => String(Math.round(n * 100) / 100).replace('.', ',');

/** "250 ml", "1,5 L", "150 g". */
export function formatoCantidad(cantidad: number, unidad: Unidad): string {
  if (unidad === 'ml' && cantidad >= 1000) return `${numero(cantidad / 1000)} L`;
  return `${numero(cantidad)} ${unidad}`;
}

const GRAMOS_RAPIDOS = [50, 100, 150, 200, 250];

export interface Atajo {
  texto: string;
  cantidad: number;
  /** Texto de la medida casera que se guarda con el registro. */
  medida?: string;
}

/** Atajos bajo el campo de cantidad: gramos para sólidos, medidas caseras para líquidos. */
export function atajosCantidad(unidad: Unidad): Atajo[] {
  if (unidad === 'g') return GRAMOS_RAPIDOS.map((g) => ({ texto: `${g} g`, cantidad: g }));
  return MEDIDAS_LIQUIDO.map((m) => ({
    texto: `${capitalizar(m.nombre)} · ${m.ml} ml`,
    cantidad: m.ml,
    medida: `1 ${m.nombre}`,
  }));
}

/** "1 vaso · 200 ml" o "150 g". */
export function textoCantidadRegistro(r: { cantidad: number; unidad: Unidad; medida?: string }): string {
  const cantidad = formatoCantidad(r.cantidad, r.unidad);
  return r.medida ? `${r.medida} · ${cantidad}` : cantidad;
}
