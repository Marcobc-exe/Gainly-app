import { ALIMENTOS_BASE, buscarAlimentos, combinarAlimentos } from '@/data/alimentos';
import { migrarEstado, useApp } from '@/store/useApp';
import type { Alimento } from '@/types';

jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const pollo = ALIMENTOS_BASE.find((a) => a.nombre === 'Pechuga de pollo (cocida)')!;
const leche = ALIMENTOS_BASE.find((a) => a.nombre === 'Leche entera')!;
const propio: Alimento = {
  id: 'propio-1',
  nombre: 'Batido casero',
  categoria: 'Personalizados',
  proteinaPor100g: 6,
  carbosPor100g: 9,
  unidad: 'ml',
  esPersonalizado: true,
};

describe('combinarAlimentos', () => {
  it('pone los propios primero y marca el origen', () => {
    const lista = combinarAlimentos(ALIMENTOS_BASE, [propio], {}, []);
    expect(lista[0]).toMatchObject({ id: 'propio-1', origen: 'propio' });
    expect(lista.find((a) => a.id === pollo.id)?.origen).toBe('incluido');
    expect(lista).toHaveLength(ALIMENTOS_BASE.length + 1);
  });

  it('aplica las ediciones a los incluidos', () => {
    const lista = combinarAlimentos(
      ALIMENTOS_BASE,
      [],
      { [pollo.id]: { nombre: 'Pollo a la plancha', proteinaPor100g: 30, carbosPor100g: 0, unidad: 'g' } },
      [],
    );
    const editado = lista.find((a) => a.id === pollo.id)!;
    expect(editado).toMatchObject({ nombre: 'Pollo a la plancha', proteinaPor100g: 30, origen: 'modificado' });
    expect(editado.unidad).toBeUndefined();
  });

  it('puede cambiar un líquido a sólido y viceversa', () => {
    const lista = combinarAlimentos(
      ALIMENTOS_BASE,
      [],
      { [leche.id]: { nombre: 'Leche entera', proteinaPor100g: 3.2, carbosPor100g: 4.8, unidad: 'g' } },
      [],
    );
    expect(lista.find((a) => a.id === leche.id)?.unidad).toBeUndefined();
  });

  it('quita los ocultos de la lista y de la búsqueda', () => {
    const lista = combinarAlimentos(ALIMENTOS_BASE, [], {}, [leche.id]);
    expect(lista.some((a) => a.id === leche.id)).toBe(false);
    expect(buscarAlimentos(lista, 'leche entera').some((a) => a.id === leche.id)).toBe(false);
  });
});

describe('acciones sobre productos', () => {
  beforeEach(() => {
    useApp.setState({ sesion: null, datos: {} });
    useApp.getState().setSesion({ id: 'u1', proveedor: 'google', nombre: 'Prueba' });
  });
  const datos = () => useApp.getState().datos.u1;

  it('eliminar un incluido lo oculta y lo quita de recientes', () => {
    useApp.getState().agregarRegistro('2026-10-20', leche, 250);
    expect(datos().recientes).toContain(leche.id);
    useApp.getState().eliminarAlimento(leche.id);
    expect(datos().alimentosOcultos).toEqual([leche.id]);
    expect(datos().recientes).not.toContain(leche.id);
    // El registro ya hecho no cambia.
    expect(datos().registros[0]).toMatchObject({ nombreAlimento: 'Leche entera', cantidad: 250 });
  });

  it('eliminar un propio lo borra', () => {
    const creado = useApp.getState().guardarAlimentoPropio({
      nombre: 'Batido casero',
      proteinaPor100g: 6,
      carbosPor100g: 9,
      unidad: 'ml',
    });
    useApp.getState().eliminarAlimento(creado.id);
    expect(datos().alimentosPropios).toHaveLength(0);
    expect(datos().alimentosOcultos).toHaveLength(0);
  });

  it('editar un incluido guarda el cambio y restaurar lo deshace', () => {
    const cambios = { nombre: 'Pollo plancha', proteinaPor100g: 30, carbosPor100g: 0, unidad: 'g' as const };
    useApp.getState().editarAlimento(pollo.id, cambios);
    expect(datos().alimentosEditados[pollo.id]).toEqual(cambios);
    useApp.getState().restaurarAlimento(pollo.id);
    expect(datos().alimentosEditados).toEqual({});
  });

  it('editar un propio lo modifica directamente', () => {
    const creado = useApp.getState().guardarAlimentoPropio({
      nombre: 'Batido casero',
      proteinaPor100g: 6,
      carbosPor100g: 9,
      unidad: 'ml',
    });
    useApp.getState().editarAlimento(creado.id, { nombre: 'Batido', proteinaPor100g: 7, carbosPor100g: 8, unidad: 'ml' });
    expect(datos().alimentosPropios[0]).toMatchObject({ nombre: 'Batido', proteinaPor100g: 7, unidad: 'ml' });
    expect(datos().alimentosEditados).toEqual({});
  });

  it('restaurar productos incluidos vacía cambios y eliminaciones', () => {
    useApp.getState().eliminarAlimento(leche.id);
    useApp.getState().editarAlimento(pollo.id, { nombre: 'X', proteinaPor100g: 1, carbosPor100g: 1, unidad: 'g' });
    useApp.getState().restaurarProductosIncluidos();
    expect(datos().alimentosOcultos).toEqual([]);
    expect(datos().alimentosEditados).toEqual({});
  });
});

describe('migración v3 → v4', () => {
  it('pone Hipertrofia como tipo de entrenamiento sin perder datos', () => {
    const v3 = {
      sesion: null,
      datos: {
        u: { perfil: { nombre: 'A', pesoKg: 80 }, registros: [{ id: '1' }], alimentosEditados: {}, alimentosOcultos: [] },
        sinPerfil: { registros: [], alimentosEditados: {}, alimentosOcultos: [] },
      },
    };
    const d = (migrarEstado(v3, 3) as unknown as { datos: Record<string, { perfil?: Record<string, unknown>; registros: unknown[] }> })
      .datos;
    expect(d.u.perfil).toMatchObject({ nombre: 'A', pesoKg: 80, tipoEntrenamiento: 'hipertrofia' });
    expect(d.u.registros).toHaveLength(1);
    expect(d.sinPerfil.perfil).toBeUndefined();
  });
});

describe('migración v2 → v3', () => {
  it('añade cambios y ocultos vacíos sin perder registros', () => {
    const v2 = {
      sesion: null,
      datos: { u: { registros: [{ id: '1', cantidad: 200, unidad: 'g' }], alimentosPropios: [], recientes: [] } },
    };
    const d = (migrarEstado(v2, 2) as unknown as { datos: Record<string, Record<string, unknown>> }).datos.u;
    expect(d.alimentosEditados).toEqual({});
    expect(d.alimentosOcultos).toEqual([]);
    expect(d.registros).toHaveLength(1);
  });
});
