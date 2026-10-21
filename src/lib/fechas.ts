import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export const claveFecha = (d: Date) => format(d, 'yyyy-MM-dd');
export const hoy = () => claveFecha(new Date());
export const aFecha = (clave: string) => parseISO(clave);

export const capitalizar = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const formatoLargo = (clave: string) =>
  capitalizar(format(aFecha(clave), "EEEE d 'de' MMMM", { locale: es }));

export const formatoMes = (d: Date) => capitalizar(format(d, 'MMMM yyyy', { locale: es }));

export const nuevoId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
