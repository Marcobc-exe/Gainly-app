import type { AuthService } from './AuthService';
import { NOMBRE_PROVEEDOR } from './AuthService';

/**
 * Inicio de sesión simulado: crea un usuario local estable por proveedor,
 * así al volver a entrar con el mismo proveedor se recuperan sus datos.
 */
export const mockAuth: AuthService = {
  async iniciarSesion(proveedor) {
    await new Promise((r) => setTimeout(r, 400));
    return {
      id: `local-${proveedor}`,
      proveedor,
      nombre: `Usuario de ${NOMBRE_PROVEEDOR[proveedor]}`,
    };
  },
  async cerrarSesion() {},
};

export const auth: AuthService = mockAuth;
