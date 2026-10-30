// Genera legal/privacidad.html desde src/data/privacidad.json (el mismo texto que muestra la app).
// Uso: npm run privacidad. La página se sube a cualquier hosting estático para tener la URL
// que piden App Store Connect y Meta.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const politica = JSON.parse(readFileSync(join(raiz, 'src/data/privacidad.json'), 'utf8'));

const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const secciones = politica.secciones
  .map((s) => `    <h2>${esc(s.titulo)}</h2>\n${s.parrafos.map((p) => `    <p>${esc(p)}</p>`).join('\n')}`)
  .join('\n');

const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Privacidad · Gainly</title>
  <style>
    :root { --fondo: #F5F5F4; --texto: #1C1B1A; --tenue: #6B6966; --borde: #E2E0DD; }
    @media (prefers-color-scheme: dark) {
      :root { --fondo: #121211; --texto: #F2F1EF; --tenue: #A3A09C; --borde: #2A2927; }
    }
    body { margin: 0; background: var(--fondo); color: var(--texto);
      font: 16px/1.6 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    main { max-width: 680px; margin: 0 auto; padding: 40px 16px 64px; }
    h1 { font-size: 28px; line-height: 1.25; margin: 0 0 4px; }
    h2 { font-size: 19px; margin: 32px 0 8px; padding-top: 24px; border-top: 1px solid var(--borde); }
    .fecha { color: var(--tenue); margin: 0 0 24px; }
    a { color: inherit; font-weight: 600; }
  </style>
</head>
<body>
  <main>
    <h1>${esc(politica.titulo)}</h1>
    <p class="fecha">Última actualización: ${esc(politica.actualizada)}</p>
    <p>${esc(politica.introduccion)}</p>
${secciones}
    <h2>Contacto</h2>
    <p>Si tienes dudas sobre tus datos, escríbenos a <a href="mailto:${esc(politica.contacto)}">${esc(politica.contacto)}</a>.</p>
  </main>
</body>
</html>
`;

mkdirSync(join(raiz, 'legal'), { recursive: true });
writeFileSync(join(raiz, 'legal/privacidad.html'), html);
console.log('Generado legal/privacidad.html');
