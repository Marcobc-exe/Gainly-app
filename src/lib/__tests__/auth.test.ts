import { CanceladoError, mensajeErrorAuth } from '@/lib/auth/AuthService';
import { esIdLocal, usuarioDesdeSupabase } from '@/lib/auth/usuario';
import { adoptarDatosLocales, useApp } from '@/store/useApp';

jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

describe('usuarioDesdeSupabase', () => {
  it('usa el nombre completo y el correo', () => {
    expect(
      usuarioDesdeSupabase(
        { id: 'uuid-1', email: 'marco@gmail.com', user_metadata: { full_name: 'Marco Bravo' } },
        'google',
      ),
    ).toEqual({ id: 'uuid-1', proveedor: 'google', nombre: 'Marco Bravo', email: 'marco@gmail.com' });
  });

  it('si no hay nombre usa la parte local del correo', () => {
    expect(usuarioDesdeSupabase({ id: 'u', email: 'ana.lopez@mail.com', user_metadata: {} }, 'correo').nombre).toBe(
      'ana.lopez',
    );
  });

  it('sin nombre ni correo (Apple ocultando datos)', () => {
    expect(usuarioDesdeSupabase({ id: 'u', email: null, user_metadata: null }, 'apple')).toEqual({
      id: 'u',
      proveedor: 'apple',
      nombre: 'Usuario',
    });
  });
});

describe('adoptarDatosLocales', () => {
  const conPerfil = (n: number) => ({ perfil: { nombre: 'X' }, registros: Array(n).fill({}) });
  const vacio = { registros: [] as unknown[] };

  it('mueve a la cuenta real el conjunto local con más registros', () => {
    const datos = { 'local-google': conPerfil(5), 'local-apple': conPerfil(1) };
    const r = adoptarDatosLocales(datos, 'uuid');
    expect(r.uuid).toBe(datos['local-google']);
    expect(r['local-google']).toBeUndefined();
    expect(r['local-apple']).toBe(datos['local-apple']);
  });

  it('no pisa una cuenta que ya tiene perfil', () => {
    const datos = { 'local-google': conPerfil(5), uuid: conPerfil(2) };
    expect(adoptarDatosLocales(datos, 'uuid')).toBe(datos);
  });

  it('adopta aunque la cuenta exista vacía (sin perfil)', () => {
    const datos = { 'local-google': conPerfil(3), uuid: vacio };
    expect(adoptarDatosLocales(datos, 'uuid').uuid).toBe(datos['local-google']);
  });

  it('sin datos locales no cambia nada', () => {
    const datos = { otra: conPerfil(1) };
    expect(adoptarDatosLocales(datos, 'uuid')).toBe(datos);
  });
});

describe('setSesion con cuenta real', () => {
  it('el primer login real se queda con los datos del login simulado', () => {
    useApp.setState({ sesion: null, datos: {} });
    const { setSesion } = useApp.getState();
    setSesion({ id: 'local-google', proveedor: 'google', nombre: 'Demo' });
    useApp.getState().guardarPerfil({
      nombre: 'Marco',
      sexo: 'hombre',
      edad: 29,
      alturaCm: 178,
      pesoKg: 80,
      objetivo: 'mantener',
      tipoEntrenamiento: 'hipertrofia',
      diasEntrenoSemana: 4,
      actividadDiaria: 'activa',
      umbrales: { logrado: 95, casi: 75 },
    });
    setSesion(null);
    setSesion({ id: 'uuid-real', proveedor: 'google', nombre: 'Marco', email: 'm@gmail.com' });
    const { datos } = useApp.getState();
    expect(datos['uuid-real'].perfil?.nombre).toBe('Marco');
    expect(datos['local-google']).toBeUndefined();
    expect(esIdLocal('local-google')).toBe(true);
  });
});

describe('mensajes de error', () => {
  it('traduce los errores habituales', () => {
    expect(mensajeErrorAuth(new Error('Token has expired or is invalid'))).toMatch(/código/);
    expect(mensajeErrorAuth(new Error('email rate limit exceeded'))).toMatch(/demasiados/);
    expect(mensajeErrorAuth(new Error('Unsupported provider: provider is not enabled'))).toMatch(/activado/);
    expect(mensajeErrorAuth(new Error('Network request failed'))).toMatch(/conexión/);
    expect(mensajeErrorAuth(new Error('Error sending confirmation email'))).toMatch(/enviar el correo/);
    expect(mensajeErrorAuth('???')).toMatch(/Inténtalo/);
  });

  it('cancelar no es un error de verdad', () => {
    expect(new CanceladoError()).toBeInstanceOf(Error);
  });
});
