// Publica una versión nueva de Gainly para Expo Go (EAS Update, rama "produccion").
// Uso: npm run publicar -- "Qué cambió"
import { spawnSync } from 'node:child_process';

const mensaje = process.argv.slice(2).join(' ').trim() || 'Actualización de Gainly';

const args = [
  'eas-cli@latest',
  'update',
  '--branch',
  'produccion',
  '--platform',
  'ios',
  '--environment',
  'production',
  '--message',
  mensaje,
  '--non-interactive',
];

// En Windows npx es un .cmd y necesita shell; se pasa el mensaje entre comillas.
const enWindows = process.platform === 'win32';
const resultado = spawnSync(
  'npx',
  enWindows ? args.map((a) => (/\s/.test(a) ? `"${a.replace(/"/g, '\\"')}"` : a)) : args,
  { stdio: 'inherit', shell: enWindows },
);
process.exit(resultado.status ?? 1);
