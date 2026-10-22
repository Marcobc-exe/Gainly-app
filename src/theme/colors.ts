// Tokens de color por tema. Ningún componente usa colores fijos: todos leen la paleta activa con useTema().
// Claro: blancos y grises opacos. Oscuro: grafito cálido, misma identidad monocroma (el claro invertido).

const claro = {
  fondo: '#F5F5F4',
  superficie: '#FFFFFF',
  superficieAlt: '#EFEFED',
  borde: '#E4E4E2',
  texto: '#2B2B2B',
  textoSecundario: '#7A7A78',
  textoTenue: '#A8A8A5',
  acento: '#3A3A3A',
  sobreAcento: '#FFFFFF',
  /** Opción o chip elegido. */
  seleccionFondo: '#3A3A3A',
  seleccionBorde: '#3A3A3A',
  seleccionTexto: '#FFFFFF',
  seleccionTextoSecundario: '#DADAD8',
  /** Pestaña activa de la barra inferior. */
  tabActiva: '#2B2B2B',
  /** Contorno del logo (huevo). */
  marca: '#3A3A3A',
  /** Botón "Editar" al deslizar un producto. */
  accionEditar: '#3A3A3A',
  velo: 'rgba(0,0,0,0.35)',

  pistaAnillo: '#E8E8E6',
  proteina: '#4A4A4A',
  carbos: '#9A9A98',

  logrado: '#8FA58C',
  casi: '#C9B98A',
  noLogrado: '#C19A96',
  peligro: '#A9645E',
};

export type Paleta = Record<keyof typeof claro, string>;

const TEXTO_OSCURO = '#F2F1EE';

const oscuro: Paleta = {
  fondo: '#121211',
  superficie: '#1C1C1A',
  superficieAlt: '#262624',
  borde: '#2E2E2B',
  texto: TEXTO_OSCURO,
  textoSecundario: '#A8A7A2',
  textoTenue: '#75746F',
  // Acento por inversión (como el claro, pero al revés): botón claro con texto grafito.
  acento: TEXTO_OSCURO,
  sobreAcento: '#121211',
  seleccionFondo: TEXTO_OSCURO,
  seleccionBorde: TEXTO_OSCURO,
  seleccionTexto: '#121211',
  seleccionTextoSecundario: '#5A5955',
  tabActiva: TEXTO_OSCURO,
  marca: TEXTO_OSCURO,
  accionEditar: '#3A3A37',
  velo: 'rgba(0,0,0,0.6)',

  pistaAnillo: '#2A2A27',
  proteina: TEXTO_OSCURO,
  carbos: '#8E8D88',

  logrado: '#9DB59A',
  casi: '#D6C48F',
  noLogrado: '#D1A19C',
  peligro: '#E07B72',
};

export const paletas = { claro, oscuro } as const;
export type NombreTema = keyof typeof paletas;

export const radios = { sm: 8, md: 12, lg: 18, xl: 28 } as const;

export const espacio = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const crearTipografia = (colors: Paleta) => ({
  titulo: { fontSize: 28, fontWeight: '700' as const, color: colors.texto, letterSpacing: -0.5 },
  subtitulo: { fontSize: 18, fontWeight: '600' as const, color: colors.texto },
  cuerpo: { fontSize: 15, color: colors.texto },
  secundario: { fontSize: 13, color: colors.textoSecundario },
  etiqueta: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.textoSecundario,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
});

export type Tipografia = ReturnType<typeof crearTipografia>;
