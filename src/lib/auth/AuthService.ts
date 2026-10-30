import type { ProveedorAuth, ProveedorBoton, Usuario } from '@/types';

/**
 * Contrato de autenticación que usan las pantallas.
 * Lo implementa `supabaseAuth` (real) o `mockAuth` (modo demo sin configuración).
 */
export interface AuthService {
  /** true si es un inicio de sesión real (Supabase). */
  real: boolean;
  /** Apple, Google o Facebook. Lanza `CanceladoError` si el usuario cancela. */
  iniciarSesion(proveedor: ProveedorBoton): Promise<Usuario>;
  /** Envía un código de un solo uso al correo. */
  enviarCodigo(email: string): Promise<void>;
  verificarCodigo(email: string, codigo: string): Promise<Usuario>;
  cerrarSesion(): Promise<void>;
  /** Borra la cuenta del servicio y cierra la sesión. Los datos del teléfono los borra el store. */
  eliminarCuenta(): Promise<void>;
  /** false si no hay sesión guardada en el servicio (p. ej. se cerró en otro lado). */
  haySesion(): Promise<boolean>;
  /** Avisa cuando el servicio cierra la sesión. Devuelve la función para dejar de escuchar. */
  escucharCierre(alCerrar: () => void): () => void;
}

/** El usuario cerró el navegador o el diálogo: no es un error que haya que mostrar. */
export class CanceladoError extends Error {
  constructor() {
    super('Inicio de sesión cancelado');
    this.name = 'CanceladoError';
  }
}

export const NOMBRE_PROVEEDOR: Record<ProveedorAuth, string> = {
  google: 'Google',
  facebook: 'Facebook',
  apple: 'Apple',
  correo: 'tu correo',
};

const textoError = (error: unknown) =>
  (error instanceof Error ? error.message : String(error ?? '')).toLowerCase();
const esErrorDeRed = (texto: string) => texto.includes('network') || texto.includes('fetch');
const MENSAJE_SIN_CONEXION = 'No hay conexión. Revisa tu internet e inténtalo de nuevo.';

/** Mensaje en español para mostrar al usuario a partir de un error al iniciar sesión. */
export function mensajeErrorAuth(error: unknown): string {
  const texto = textoError(error);
  if (texto.includes('rate limit') || texto.includes('security purposes') || texto.includes('too many')) {
    return 'Has pedido demasiados códigos. Espera unos minutos y vuelve a intentarlo.';
  }
  if (texto.includes('error sending')) {
    return 'No se pudo enviar el correo con el código. Inténtalo más tarde o usa otro método.';
  }
  if (texto.includes('expired') || texto.includes('invalid') || texto.includes('otp')) {
    return 'El código no es correcto o ya caducó. Revisa el correo o pide uno nuevo.';
  }
  if (texto.includes('not enabled') || texto.includes('unsupported provider')) {
    return 'Este método de inicio de sesión aún no está activado.';
  }
  if (esErrorDeRed(texto)) return MENSAJE_SIN_CONEXION;
  return 'No se pudo iniciar sesión. Inténtalo de nuevo.';
}

/** Mensaje en español para un error al eliminar la cuenta. */
export function mensajeErrorEliminarCuenta(error: unknown): string {
  const texto = textoError(error);
  // Falta la función SQL `eliminar_cuenta` en el proyecto de Supabase.
  if (texto.includes('could not find the function')) {
    return 'Eliminar la cuenta aún no está activado en el servidor. Inténtalo más tarde.';
  }
  if (esErrorDeRed(texto)) return MENSAJE_SIN_CONEXION;
  return 'No se pudo eliminar la cuenta. Cierra sesión, vuelve a entrar e inténtalo de nuevo.';
}
