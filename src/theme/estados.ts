import { useTema } from '@/theme/TemaProvider';
import type { Paleta } from '@/theme/colors';
import type { EstadoDia } from '@/types';

export const TEXTO_ESTADO: Record<EstadoDia, string> = {
  logrado: 'Meta lograda',
  casi: 'Casi logrado',
  no_logrado: 'Meta no lograda',
  vacio: 'Sin registros',
};

export const crearColorEstado = (colors: Paleta): Record<EstadoDia, string> => ({
  logrado: colors.logrado,
  casi: colors.casi,
  no_logrado: colors.noLogrado,
  vacio: colors.borde,
});

/** Colores de logrado / casi / no logrado del tema activo. */
export function useColorEstado(): Record<EstadoDia, string> {
  return crearColorEstado(useTema().colors);
}
