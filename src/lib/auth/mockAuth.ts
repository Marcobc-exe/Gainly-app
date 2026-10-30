import type { AuthService } from './AuthService';
import { NOMBRE_PROVEEDOR } from './AuthService';
import { supabase } from './supabase';
import { crearSupabaseAuth } from './supabaseAuth';

/**
 * Modo demo (sin Supabase configurado): crea un usuario local estable por proveedor,
 * así al volver a entrar con el mismo proveedor se recuperan sus datos.
 */
export const mockAuth: AuthService = {
  real: false,
  async iniciarSesion(proveedor) {
    await new Promise((r) => setTimeout(r, 400));
    return { id: `local-${proveedor}`, proveedor, nombre: `Usuario de ${NOMBRE_PROVEEDOR[proveedor]}` };
  },
  async enviarCodigo() {},
  async verificarCodigo(email) {
    return { id: 'local-correo', proveedor: 'correo', nombre: email.split('@')[0], email };
  },
  async cerrarSesion() {},
  async eliminarCuenta() {},
  async haySesion() {
    return true;
  },
  escucharCierre() {
    return () => {};
  },
};

/** Servicio que usa la app: Supabase si hay variables de entorno; si no, el modo demo. */
export const auth: AuthService = supabase ? crearSupabaseAuth(supabase) : mockAuth;
