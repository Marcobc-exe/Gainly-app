// Genera los iconos de Gainly (diseño "Huevo") a partir de un único dibujo vectorial.
// Uso: npm run iconos
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { Resvg } from '@resvg/resvg-js';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const assets = join(raiz, 'assets');

const COLORES = {
  fondo: '#F5F5F4',
  borde: '#E4E4E2',
  trazo: '#3A3A3A',
  pista: '#E4E4E2',
  yema: '#9A9A98',
};

/** Huevo con la yema como anillo de progreso, en coordenadas 0–96 (centro 48,48). */
const dibujo = ({ trazo, pista, yema }) => `
  <path d="M48 14 C64 14 76 38 76 55 C76 71 64 82 48 82 C32 82 20 71 20 55 C20 38 32 14 48 14 Z"
        fill="none" stroke="${trazo}" stroke-width="6"/>
  <circle cx="48" cy="57" r="12" fill="none" stroke="${pista}" stroke-width="7"/>
  <circle cx="48" cy="57" r="12" fill="none" stroke="${yema}" stroke-width="7" stroke-linecap="round"
          stroke-dasharray="52.8 300" transform="rotate(-90 48 57)"/>`;

/** viewBox cuadrado centrado en el dibujo; cuanto mayor `lado`, más pequeño se ve el huevo. */
const vista = (lado) => `${48 - lado / 2} ${48 - lado / 2} ${lado} ${lado}`;

const svg = (contenido, viewBox = '0 0 96 96') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${contenido}</svg>`;

const variantes = {
  // iOS y tiendas: fondo opaco a sangre (el sistema aplica su propia máscara).
  completo: svg(`<rect width="96" height="96" fill="${COLORES.fondo}"/>${dibujo(COLORES)}`),
  // Android adaptativo: el huevo ocupa ~58 % para quedar dentro de la zona segura.
  primerPlano: svg(dibujo(COLORES), vista(128)),
  fondo: svg(`<rect width="96" height="96" fill="${COLORES.fondo}"/>`),
  // Iconos temáticos de Android: solo cuenta la forma (alfa).
  monocromo: svg(dibujo({ trazo: '#000', pista: '#000', yema: '#000' }), vista(128)),
  // Web: esquinas redondeadas como en el escritorio del teléfono.
  favicon: svg(
    `<rect x="0.5" y="0.5" width="95" height="95" rx="21.5" fill="${COLORES.fondo}" stroke="${COLORES.borde}"/>${dibujo(COLORES)}`,
  ),
  // Pantalla de carga: solo el huevo sobre transparente.
  splash: svg(dibujo(COLORES), vista(92)),
  // Pantalla de carga en modo oscuro (fondo #121211): huevo claro.
  splashOscuro: svg(dibujo({ trazo: '#F2F1EE', pista: '#2A2A27', yema: '#8E8D88' }), vista(92)),
};

const salidas = [
  // Nombre distinto de icon.png para que Expo Go no reutilice el icono por defecto que ya tenía en caché.
  ['icono-gainly.png', variantes.completo, 1024],
  ['android-icon-foreground.png', variantes.primerPlano, 512],
  ['android-icon-background.png', variantes.fondo, 512],
  ['android-icon-monochrome.png', variantes.monocromo, 432],
  ['favicon.png', variantes.favicon, 48],
  ['splash-icon.png', variantes.splash, 1024],
  ['splash-icon-dark.png', variantes.splashOscuro, 1024],
];

// Fuentes vectoriales, para poder editarlas o reutilizarlas.
mkdirSync(join(assets, 'icono'), { recursive: true });
writeFileSync(join(assets, 'icono', 'huevo.svg'), variantes.completo);
writeFileSync(join(assets, 'icono', 'huevo-primer-plano.svg'), variantes.primerPlano);
writeFileSync(join(assets, 'icono', 'huevo-monocromo.svg'), variantes.monocromo);

for (const [nombre, contenido, tamano] of salidas) {
  const png = new Resvg(contenido, { fitTo: { mode: 'width', value: tamano } }).render().asPng();
  writeFileSync(join(assets, nombre), png);
  console.log(`${nombre.padEnd(30)} ${tamano}×${tamano}`);
}
