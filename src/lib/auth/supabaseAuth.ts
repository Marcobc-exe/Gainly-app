import type { SupabaseClient } from '@supabase/supabase-js';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { CanceladoError, type AuthService } from './AuthService';
import { usuarioDesdeSupabase } from './usuario';

// En web cierra la ventana emergente de OAuth al volver.
WebBrowser.maybeCompleteAuthSession();

/** Inicio de sesión real con Supabase: Apple (nativo), Google/Facebook (navegador) y código por correo. */
export function crearSupabaseAuth(supabase: SupabaseClient): AuthService {
  return {
    real: true,

    async iniciarSesion(proveedor) {
      if (proveedor === 'apple') {
        let credencial: AppleAuthentication.AppleAuthenticationCredential;
        try {
          credencial = await AppleAuthentication.signInAsync({
            requestedScopes: [
              AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
              AppleAuthentication.AppleAuthenticationScope.EMAIL,
            ],
          });
        } catch (e) {
          if ((e as { code?: string }).code === 'ERR_REQUEST_CANCELED') throw new CanceladoError();
          throw e;
        }
        if (!credencial.identityToken) throw new Error('Apple no devolvió el token de identidad.');
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: credencial.identityToken,
        });
        if (error) throw error;

        // Apple solo envía el nombre la primera vez: se guarda en el perfil de Supabase.
        const nombre = [credencial.fullName?.givenName, credencial.fullName?.familyName]
          .filter(Boolean)
          .join(' ');
        const meta = data.user.user_metadata ?? {};
        if (nombre && !meta.full_name) {
          await supabase.auth.updateUser({ data: { full_name: nombre } }).catch(() => {});
        }
        return usuarioDesdeSupabase(
          { ...data.user, user_metadata: { ...meta, ...(nombre && !meta.full_name ? { full_name: nombre } : {}) } },
          'apple',
        );
      }

      // Google y Facebook: el navegador del sistema hace el login y vuelve a la app con un código.
      // Se vuelve a la ruta del login (existe y es pública): si el sistema abre el enlace, no pasa nada.
      // En iOS la URL es fija: la sesión del navegador captura la vuelta por el esquema aunque Expo Go
      // no lo tenga registrado, y Supabase rechaza la de Expo Go con el servidor local (host = IP del PC).
      const redirectTo = Platform.OS === 'ios' ? 'gainly://login' : Linking.createURL('login');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: proveedor,
        options: {
          redirectTo,
          skipBrowserRedirect: true,
          // Google siempre deja elegir (o cambiar) la cuenta.
          ...(proveedor === 'google' ? { queryParams: { prompt: 'select_account' } } : {}),
        },
      });
      if (error) throw error;

      // Sesión privada: iOS no muestra el aviso "quiere usar … para iniciar sesión"
      // y no reutiliza las cuentas abiertas en Safari.
      const resultado = await WebBrowser.openAuthSessionAsync(data.url, redirectTo, {
        preferEphemeralSession: true,
      });
      if (resultado.type !== 'success') throw new CanceladoError();

      const { queryParams } = Linking.parse(resultado.url);
      const errorDescripcion = queryParams?.error_description ?? queryParams?.error;
      if (errorDescripcion) throw new Error(String(errorDescripcion));
      const codigo = queryParams?.code;
      if (typeof codigo !== 'string') throw new Error('No se recibió el código de inicio de sesión.');

      const { data: sesion, error: errorSesion } = await supabase.auth.exchangeCodeForSession(codigo);
      if (errorSesion) throw errorSesion;
      return usuarioDesdeSupabase(sesion.user, proveedor);
    },

    async enviarCodigo(email) {
      const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
      if (error) throw error;
    },

    async verificarCodigo(email, codigo) {
      const { data, error } = await supabase.auth.verifyOtp({ email, token: codigo, type: 'email' });
      if (error) throw error;
      if (!data.user) throw new Error('invalid otp');
      return usuarioDesdeSupabase(data.user, 'correo');
    },

    async cerrarSesion() {
      // Aunque falle la red, la sesión local se borra.
      await supabase.auth.signOut().catch(() => {});
    },

    async eliminarCuenta() {
      // Función SQL `eliminar_cuenta` (supabase/eliminar_cuenta.sql): borra solo al usuario con sesión.
      const { error } = await supabase.rpc('eliminar_cuenta');
      if (error) throw error;
      // El usuario ya no existe en el servidor: basta con olvidar la sesión en el teléfono.
      await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
    },

    async haySesion() {
      // Un error (p. ej. sin red al refrescar el token) no cuenta como sesión cerrada.
      const { data, error } = await supabase.auth.getSession();
      return !!error || !!data.session;
    },

    escucharCierre(alCerrar) {
      const { data } = supabase.auth.onAuthStateChange((evento) => {
        if (evento === 'SIGNED_OUT') alCerrar();
      });
      return () => data.subscription.unsubscribe();
    },
  };
}
