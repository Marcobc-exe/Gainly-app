import { ALIMENTOS_BASE, buscarAlimentos, macrosPara } from '@/data/alimentos';
import { atajosCantidad, formatoCantidad, textoCantidadRegistro, unidadDe } from '@/data/medidas';
import { migrarEstado } from '@/store/useApp';

jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

describe('alimentos líquidos', () => {
  it('la leche se mide en ml y los sólidos en g', () => {
    const leche = ALIMENTOS_BASE.find((a) => a.nombre === 'Leche entera')!;
    const pollo = ALIMENTOS_BASE.find((a) => a.nombre === 'Pechuga de pollo (cocida)')!;
    expect(unidadDe(leche)).toBe('ml');
    expect(unidadDe(pollo)).toBe('g');
    expect(buscarAlimentos(ALIMENTOS_BASE, 'leche').every((a) => unidadDe(a) === 'ml')).toBe(true);
  });

  it('incluye 115 bebidas, todas en ml y con id único', () => {
    const liquidos = ALIMENTOS_BASE.filter((a) => unidadDe(a) === 'ml');
    expect(liquidos).toHaveLength(115);
    expect(new Set(ALIMENTOS_BASE.map((a) => a.id)).size).toBe(ALIMENTOS_BASE.length);
    for (const c of ['Leches', 'Cafés', 'Chocolates y batidos', 'Zumos y jugos', 'Bebidas proteicas']) {
      expect(liquidos.some((a) => a.categoria === c)).toBe(true);
    }
    expect(buscarAlimentos(ALIMENTOS_BASE, 'cafe').length).toBeGreaterThan(20);
    expect(buscarAlimentos(ALIMENTOS_BASE, 'jugo').length).toBeGreaterThan(10);
  });

  it('calcula macros por ml', () => {
    const leche = ALIMENTOS_BASE.find((a) => a.nombre === 'Leche entera')!;
    expect(macrosPara(leche, 250)).toEqual({ proteina: 8, carbos: 12 });
  });
});

describe('atajosCantidad', () => {
  it('sólidos: gramos habituales sin medida casera', () => {
    const atajos = atajosCantidad('g');
    expect(atajos.map((a) => a.texto)).toEqual(['50 g', '100 g', '150 g', '200 g', '250 g']);
    expect(atajos.every((a) => a.medida === undefined)).toBe(true);
  });

  it('líquidos: medidas caseras en ml', () => {
    const atajos = atajosCantidad('ml');
    expect(atajos[0]).toEqual({ texto: 'Vaso · 200 ml', cantidad: 200, medida: '1 vaso' });
    expect(atajos.find((a) => a.medida === '1 taza')?.cantidad).toBe(250);
  });
});

describe('formato', () => {
  it('muestra litros a partir de 1000 ml', () => {
    expect(formatoCantidad(250, 'ml')).toBe('250 ml');
    expect(formatoCantidad(1500, 'ml')).toBe('1,5 L');
    expect(formatoCantidad(1500, 'g')).toBe('1500 g');
  });

  it('describe el registro con su medida casera', () => {
    expect(textoCantidadRegistro({ cantidad: 400, unidad: 'ml', medida: '2 vasos' })).toBe('2 vasos · 400 ml');
    expect(textoCantidadRegistro({ cantidad: 150, unidad: 'g' })).toBe('150 g');
  });
});

describe('migración v1 → v2', () => {
  it('convierte gramos en cantidad + unidad', () => {
    const v1 = {
      sesion: null,
      datos: { u: { registros: [{ id: '1', gramos: 200, proteina: 62, carbos: 0 }], metasPorDia: {} } },
    };
    const r = (migrarEstado(v1, 1) as unknown as typeof v1).datos.u.registros[0];
    expect(r).toMatchObject({ cantidad: 200, unidad: 'g' });
    expect(r).not.toHaveProperty('gramos');
  });
});
