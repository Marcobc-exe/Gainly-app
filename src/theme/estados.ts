import { colors } from '@/theme/colors';
import type { EstadoDia } from '@/types';

export const TEXTO_ESTADO: Record<EstadoDia, string> = {
  logrado: 'Meta lograda',
  casi: 'Casi logrado',
  no_logrado: 'Meta no lograda',
  vacio: 'Sin registros',
};

export const COLOR_ESTADO: Record<EstadoDia, string> = {
  logrado: colors.logrado,
  casi: colors.casi,
  no_logrado: colors.noLogrado,
  vacio: colors.borde,
};
