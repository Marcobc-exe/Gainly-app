import type { EstadoDia, Metas, RegistroComida, Umbrales } from '@/types';

export const UMBRALES_POR_DEFECTO: Umbrales = { logrado: 95, casi: 75 };

export interface Totales {
  proteina: number;
  carbos: number;
}

export function sumarRegistros(registros: RegistroComida[]): Totales {
  const t = registros.reduce(
    (acc, r) => ({ proteina: acc.proteina + r.proteina, carbos: acc.carbos + r.carbos }),
    { proteina: 0, carbos: 0 },
  );
  return { proteina: Math.round(t.proteina * 10) / 10, carbos: Math.round(t.carbos * 10) / 10 };
}

export function porcentaje(consumido: number, meta: number): number {
  if (meta <= 0) return 100;
  return (consumido / meta) * 100;
}

/**
 * El estado del día lo marca el macro con menor % de cumplimiento.
 * Sin registros el día queda "vacio" (no cuenta como fallido).
 */
export function estadoDelDia(
  totales: Totales,
  metas: Metas,
  umbrales: Umbrales,
  tieneRegistros: boolean,
): EstadoDia {
  if (!tieneRegistros) return 'vacio';
  const minimo = Math.min(
    porcentaje(totales.proteina, metas.proteina),
    porcentaje(totales.carbos, metas.carbos),
  );
  if (minimo >= umbrales.logrado) return 'logrado';
  if (minimo >= umbrales.casi) return 'casi';
  return 'no_logrado';
}

export interface Conteo {
  logrado: number;
  casi: number;
  no_logrado: number;
  registrados: number;
}

/** Cuenta estados de las fechas cuyo prefijo coincide (p. ej. "2026-10" o "2026"). */
export function contarEstados(estados: Record<string, EstadoDia>, prefijo: string): Conteo {
  const c: Conteo = { logrado: 0, casi: 0, no_logrado: 0, registrados: 0 };
  for (const [fecha, estado] of Object.entries(estados)) {
    if (!fecha.startsWith(prefijo) || estado === 'vacio') continue;
    c[estado] += 1;
    c.registrados += 1;
  }
  return c;
}

export function validarUmbrales(u: Umbrales): string | null {
  if (!Number.isFinite(u.logrado) || !Number.isFinite(u.casi)) return 'Introduce números válidos.';
  if (u.logrado < 1 || u.logrado > 200) return 'El umbral de "logrado" debe estar entre 1 y 200 %.';
  if (u.casi < 0) return 'El umbral de "casi" no puede ser negativo.';
  if (u.casi >= u.logrado) return 'El umbral de "casi" debe ser menor que el de "logrado".';
  return null;
}
