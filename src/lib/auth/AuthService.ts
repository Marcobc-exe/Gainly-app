import type { ProveedorAuth, Usuario } from '@/types';

/**
 * Contrato de autenticación. Hoy lo implementa `mockAuth` (local);
 * más adelante se puede añadir una implementación con Firebase o Supabase
 * (Google, Facebook y Sign in with Apple) sin tocar las pantallas.
 */
export interface AuthService {
  iniciarSesion(proveedor: ProveedorAuth): Promise<Usuario>;
  cerrarSesion(): Promise<void>;
}

export const NOMBRE_PROVEEDOR: Record<ProveedorAuth, string> = {
  google: 'Google',
  facebook: 'Facebook',
  apple: 'Apple',
};
