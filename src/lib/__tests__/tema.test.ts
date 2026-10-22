import { paletas } from '@/theme/colors';
import { resolverTema } from '@/theme/tema';

/** Contraste WCAG 2.1 entre dos colores; admite #RRGGBB y rgba(r,g,b,a) compuesto sobre `fondo`. */
function aRgb(color: string, fondo?: [number, number, number]): [number, number, number] {
  const hex = color.match(/^#([0-9a-f]{6})$/i);
  if (hex) {
    const n = parseInt(hex[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const m = color.match(/^rgba\((\d+),(\d+),(\d+),([\d.]+)\)$/);
  if (!m || !fondo) throw new Error(`Color no soportado: ${color}`);
  const a = Number(m[4]);
  return [1, 2, 3].map((i, k) => Number(m[i]) * a + fondo[k] * (1 - a)) as [number, number, number];
}

function luminancia([r, g, b]: [number, number, number]) {
  const canal = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
}

function contraste(texto: string, fondo: string) {
  const f = aRgb(fondo);
  const [l1, l2] = [luminancia(aRgb(texto, f)), luminancia(f)].sort((a, b) => b - a);
  return (l1 + 0.05) / (l2 + 0.05);
}

describe('resolverTema', () => {
  it('sigue al teléfono cuando la preferencia es "sistema"', () => {
    expect(resolverTema('sistema', 'dark')).toBe('oscuro');
    expect(resolverTema('sistema', 'light')).toBe('claro');
    expect(resolverTema('sistema', null)).toBe('claro');
  });

  it('la elección manual gana al sistema', () => {
    expect(resolverTema('claro', 'dark')).toBe('claro');
    expect(resolverTema('oscuro', 'light')).toBe('oscuro');
  });
});

describe('paletas', () => {
  it('clara y oscura tienen los mismos tokens', () => {
    expect(Object.keys(paletas.oscuro).sort()).toEqual(Object.keys(paletas.claro).sort());
  });

  it('modo oscuro usa la paleta pedida', () => {
    expect(paletas.oscuro).toMatchObject({
      fondo: '#121211',
      superficie: '#1C1C1A',
      superficieAlt: '#262624',
      borde: '#2E2E2B',
      acento: '#F2F1EE',
      texto: '#F2F1EE',
    });
  });

  it('el texto del modo oscuro cumple AA sobre fondo, superficies e inputs', () => {
    const o = paletas.oscuro;
    for (const fondo of [o.fondo, o.superficie, o.superficieAlt]) {
      expect(contraste(o.texto, fondo)).toBeGreaterThanOrEqual(4.5);
      expect(contraste(o.textoSecundario, fondo)).toBeGreaterThanOrEqual(4.5);
      expect(contraste(o.textoTenue, fondo)).toBeGreaterThanOrEqual(3);
    }
    expect(contraste(o.peligro, o.superficie)).toBeGreaterThanOrEqual(3);
    for (const estado of [o.logrado, o.casi, o.noLogrado]) {
      expect(contraste(estado, o.superficie)).toBeGreaterThanOrEqual(3);
    }
    expect(contraste(o.seleccionTexto, o.seleccionFondo)).toBeGreaterThanOrEqual(4.5);
    expect(contraste(o.seleccionTextoSecundario, o.seleccionFondo)).toBeGreaterThanOrEqual(4.5);
  });

  it('el texto del CTA sobre el acento cumple AAA', () => {
    expect(contraste(paletas.oscuro.sobreAcento, paletas.oscuro.acento)).toBeGreaterThanOrEqual(7);
  });
});
