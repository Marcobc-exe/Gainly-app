import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { useApp } from '@/store/useApp';
import { crearTipografia, paletas, type NombreTema, type Paleta, type Tipografia } from '@/theme/colors';
import { resolverTema, type PreferenciaTema } from '@/theme/tema';

interface ValorTema {
  nombre: NombreTema;
  esOscuro: boolean;
  colors: Paleta;
  tipografia: Tipografia;
  preferencia: PreferenciaTema;
  setPreferencia: (p: PreferenciaTema) => void;
}

const Contexto = createContext<ValorTema | null>(null);

/** Une el tema del teléfono con la preferencia guardada y lo reparte a toda la app. */
export function TemaProvider({ children }: { children: ReactNode }) {
  const sistema = useColorScheme();
  const preferencia = useApp((s) => s.preferenciaTema);
  const setPreferencia = useApp((s) => s.setPreferenciaTema);
  const nombre = resolverTema(preferencia, sistema);

  const valor = useMemo<ValorTema>(() => {
    const colors = paletas[nombre];
    return {
      nombre,
      esOscuro: nombre === 'oscuro',
      colors,
      tipografia: crearTipografia(colors),
      preferencia,
      setPreferencia,
    };
  }, [nombre, preferencia, setPreferencia]);

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useTema(): ValorTema {
  const valor = useContext(Contexto);
  if (!valor) throw new Error('useTema debe usarse dentro de TemaProvider');
  return valor;
}

/** Estilos que dependen del tema: se recrean solo cuando cambia la paleta. */
export function useEstilos<T>(fabrica: (colors: Paleta) => T): T {
  const { colors } = useTema();
  return useMemo(() => fabrica(colors), [fabrica, colors]);
}
