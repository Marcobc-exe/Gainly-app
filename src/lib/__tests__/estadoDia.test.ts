import { buscarAlimentos, ALIMENTOS_BASE, macrosPara } from '@/data/alimentos';
import { contarEstados, estadoDelDia, sumarRegistros, validarUmbrales } from '../estadoDia';
import type { RegistroComida } from '@/types';

const metas = { proteina: 100, carbos: 200 };
const umbrales = { logrado: 95, casi: 75 };

describe('estadoDelDia', () => {
  it('sin registros es vacío', () => {
    expect(estadoDelDia({ proteina: 0, carbos: 0 }, metas, umbrales, false)).toBe('vacio');
  });

  it('usa el macro con menor porcentaje', () => {
    expect(estadoDelDia({ proteina: 120, carbos: 150 }, metas, umbrales, true)).toBe('casi'); // 75 %
    expect(estadoDelDia({ proteina: 95, carbos: 190 }, metas, umbrales, true)).toBe('logrado'); // 95 %
    expect(estadoDelDia({ proteina: 74, carbos: 300 }, metas, umbrales, true)).toBe('no_logrado');
  });

  it('respeta umbrales personalizados', () => {
    expect(estadoDelDia({ proteina: 95, carbos: 190 }, metas, { logrado: 100, casi: 90 }, true)).toBe('casi');
  });
});

describe('contarEstados', () => {
  const estados = {
    '2026-10-01': 'logrado',
    '2026-10-02': 'casi',
    '2026-10-03': 'logrado',
    '2026-09-30': 'no_logrado',
    '2025-10-01': 'logrado',
  } as const;

  it('cuenta por mes', () => {
    expect(contarEstados(estados, '2026-10')).toEqual({ logrado: 2, casi: 1, no_logrado: 0, registrados: 3 });
  });

  it('cuenta por año', () => {
    expect(contarEstados(estados, '2026')).toEqual({ logrado: 2, casi: 1, no_logrado: 1, registrados: 4 });
  });
});

describe('validarUmbrales', () => {
  it('exige casi < logrado', () => {
    expect(validarUmbrales({ logrado: 95, casi: 75 })).toBeNull();
    expect(validarUmbrales({ logrado: 80, casi: 80 })).not.toBeNull();
  });
});

describe('alimentos', () => {
  it('busca ignorando tildes y mayúsculas', () => {
    const r = buscarAlimentos(ALIMENTOS_BASE, 'ATUN');
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((a) => a.nombre.toLowerCase().includes('atún'))).toBe(true);
    expect(buscarAlimentos(ALIMENTOS_BASE, 'pure').map((a) => a.nombre)).toContain('Puré de patatas');
  });

  it('incluye 100 verduras y se encuentran por nombre o categoría', () => {
    const verduras = ALIMENTOS_BASE.filter((a) => a.categoria === 'Verduras y vegetales');
    expect(verduras).toHaveLength(100);
    expect(verduras.every((a) => a.unidad === undefined)).toBe(true);
    expect(buscarAlimentos(ALIMENTOS_BASE, 'vegetales').length).toBeGreaterThanOrEqual(100);
    expect(buscarAlimentos(ALIMENTOS_BASE, 'zanahoria').map((a) => a.nombre)).toContain('Zanahoria (cruda)');
    expect(buscarAlimentos(ALIMENTOS_BASE, 'brocoli').length).toBeGreaterThan(0);
  });

  it('ids únicos', () => {
    const ids = ALIMENTOS_BASE.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('calcula macros por gramos y suma registros', () => {
    const pollo = ALIMENTOS_BASE.find((a) => a.nombre === 'Pechuga de pollo (cocida)')!;
    expect(macrosPara(pollo, 200)).toEqual({ proteina: 62, carbos: 0 });
    const regs = [
      { proteina: 62, carbos: 0 },
      { proteina: 4.1, carbos: 42 },
    ] as RegistroComida[];
    expect(sumarRegistros(regs)).toEqual({ proteina: 66.1, carbos: 42 });
  });
});
