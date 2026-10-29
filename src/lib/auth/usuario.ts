import type { ProveedorAuth, Usuario } from '@/types';

/** Lo mínimo que necesitamos de un usuario de Supabase (evita depender del SDK en los tests). */
export interface UsuarioSupabase {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
}

const texto = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);

/** Convierte el usuario de Supabase en el usuario de la app. */
export function usuarioDesdeSupabase(u: UsuarioSupabase, proveedor: ProveedorAuth): Usuario {
  const meta = u.user_metadata ?? {};
  const email = texto(u.email) ?? texto(meta.email);
  const nombre =
    texto(meta.full_name) ??
    texto(meta.name) ??
    texto(meta.user_name) ??
    (email ? email.split('@')[0] : undefined) ??
    'Usuario';
  return { id: u.id, proveedor, nombre, ...(email ? { email } : {}) };
}

/** Sesiones del login simulado anterior (`local-google`, …). */
export const esIdLocal = (id: string) => id.startsWith('local-');
