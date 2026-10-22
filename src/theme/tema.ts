import type { NombreTema } from '@/theme/colors';

/** 'sistema' sigue al teléfono; 'claro' u 'oscuro' es una elección manual guardada. */
export type PreferenciaTema = 'sistema' | NombreTema;

/** Tema que se aplica: la elección manual gana; si no, el del sistema (claro si no lo informa). */
export function resolverTema(
  preferencia: PreferenciaTema,
  esquemaSistema: string | null | undefined,
): NombreTema {
  if (preferencia !== 'sistema') return preferencia;
  return esquemaSistema === 'dark' ? 'oscuro' : 'claro';
}
