// Paleta por defecto: blancos y grises opacos.
// Los colores de estado son tonos apagados para no romper la estética.
export const colors = {
  fondo: '#F5F5F4',
  superficie: '#FFFFFF',
  superficieAlt: '#EFEFED',
  borde: '#E4E4E2',
  texto: '#2B2B2B',
  textoSecundario: '#7A7A78',
  textoTenue: '#A8A8A5',
  acento: '#3A3A3A',
  sobreAcento: '#FFFFFF',

  pistaAnillo: '#E8E8E6',
  proteina: '#4A4A4A',
  carbos: '#9A9A98',

  logrado: '#8FA58C',
  casi: '#C9B98A',
  noLogrado: '#C19A96',
  peligro: '#A9645E',
} as const;

export const radios = { sm: 8, md: 12, lg: 18, xl: 28 } as const;

export const espacio = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const tipografia = {
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
};
