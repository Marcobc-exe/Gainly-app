import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMemo, useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { ALIMENTOS_BASE, combinarAlimentos, macrosPara } from '@/data/alimentos';
import { unidadDe } from '@/data/medidas';
import { esIdLocal } from '@/lib/auth/usuario';
import { estadoDelDia, sumarRegistros } from '@/lib/estadoDia';
import { hoy, nuevoId } from '@/lib/fechas';
import type { PreferenciaTema } from '@/theme/tema';
import { metasDePerfil, TIPO_ENTRENAMIENTO_POR_DEFECTO } from '@/lib/objetivos';
import type {
  Alimento,
  CambiosAlimento,
  EstadoDia,
  Metas,
  Perfil,
  RegistroComida,
  Usuario,
} from '@/types';

interface DatosUsuario {
  perfil?: Perfil;
  registros: RegistroComida[];
  /** Meta vigente en cada fecha registrada, para que cambiar el perfil no altere días pasados. */
  metasPorDia: Record<string, Metas>;
  alimentosPropios: Alimento[];
  /** Cambios del usuario sobre productos incluidos en la app. */
  alimentosEditados: Record<string, CambiosAlimento>;
  /** Productos incluidos que el usuario eliminó de su lista. */
  alimentosOcultos: string[];
  recientes: string[];
}

const datosVacios = (): DatosUsuario => ({
  registros: [],
  metasPorDia: {},
  alimentosPropios: [],
  alimentosEditados: {},
  alimentosOcultos: [],
  recientes: [],
});

interface EstadoApp {
  sesion: Usuario | null;
  datos: Record<string, DatosUsuario>;
  /** Tema elegido en este dispositivo (no depende del usuario). */
  preferenciaTema: PreferenciaTema;

  setPreferenciaTema(p: PreferenciaTema): void;
  setSesion(u: Usuario | null): void;
  guardarPerfil(p: Perfil): void;
  /** `cantidad` en gramos o mililitros según el alimento; `medida` es el texto de la medida casera. */
  agregarRegistro(fecha: string, alimento: Alimento, cantidad: number, medida?: string): void;
  actualizarCantidad(id: string, cantidad: number): void;
  eliminarRegistro(id: string): void;
  guardarAlimentoPropio(a: Omit<Alimento, 'id' | 'categoria' | 'esPersonalizado'>): Alimento;
  /** Propio: lo modifica. Incluido: guarda los cambios solo para este usuario. */
  editarAlimento(id: string, cambios: CambiosAlimento): void;
  /** Propio: lo borra. Incluido: lo oculta (se puede restaurar). */
  eliminarAlimento(id: string): void;
  /** Deshace los cambios de un producto incluido. */
  restaurarAlimento(id: string): void;
  restaurarProductosIncluidos(): void;
}

export const useApp = create<EstadoApp>()(
  persist(
    (set, get) => {
      /** Aplica un cambio sobre los datos del usuario con sesión iniciada. */
      const mutar = (fn: (d: DatosUsuario) => DatosUsuario) => {
        const uid = get().sesion?.id;
        if (!uid) return;
        set((s) => ({ datos: { ...s.datos, [uid]: fn(s.datos[uid] ?? datosVacios()) } }));
      };

      return {
        sesion: null,
        datos: {},
        preferenciaTema: 'sistema',

        setPreferenciaTema: (preferenciaTema) => set({ preferenciaTema }),

        setSesion: (u) =>
          set((s) => {
            if (!u) return { sesion: null };
            // Primer login real: los datos del login simulado anterior pasan a esta cuenta.
            const datos = esIdLocal(u.id) ? s.datos : adoptarDatosLocales(s.datos, u.id);
            return { sesion: u, datos: datos[u.id] ? datos : { ...datos, [u.id]: datosVacios() } };
          }),

        guardarPerfil: (perfil) =>
          mutar((d) => {
            // La nueva meta aplica desde hoy en adelante.
            const metasPorDia = { ...d.metasPorDia };
            const h = hoy();
            for (const f of Object.keys(metasPorDia)) if (f >= h) delete metasPorDia[f];
            if (d.registros.some((r) => r.fecha === h)) metasPorDia[h] = metasDePerfil(perfil);
            return { ...d, perfil, metasPorDia };
          }),

        agregarRegistro: (fecha, alimento, cantidad, medida) =>
          mutar((d) => {
            const { proteina, carbos } = macrosPara(alimento, cantidad);
            const registro: RegistroComida = {
              id: nuevoId(),
              fecha,
              alimentoId: alimento.id,
              nombreAlimento: alimento.nombre,
              cantidad,
              unidad: unidadDe(alimento),
              medida,
              proteina,
              carbos,
              creadoEn: Date.now(),
            };
            const metasPorDia =
              d.metasPorDia[fecha] || !d.perfil
                ? d.metasPorDia
                : { ...d.metasPorDia, [fecha]: metasDePerfil(d.perfil) };
            const recientes = [alimento.id, ...d.recientes.filter((x) => x !== alimento.id)].slice(0, 8);
            return { ...d, registros: [...d.registros, registro], metasPorDia, recientes };
          }),

        actualizarCantidad: (id, cantidad) =>
          mutar((d) => ({
            ...d,
            registros: d.registros.map((r) => {
              if (r.id !== id || r.cantidad <= 0) return r;
              const f = cantidad / r.cantidad;
              return {
                ...r,
                cantidad,
                medida: undefined,
                proteina: Math.round(r.proteina * f * 10) / 10,
                carbos: Math.round(r.carbos * f * 10) / 10,
              };
            }),
          })),

        eliminarRegistro: (id) =>
          mutar((d) => ({ ...d, registros: d.registros.filter((r) => r.id !== id) })),

        guardarAlimentoPropio: (a) => {
          const alimento: Alimento = {
            ...a,
            id: `propio-${nuevoId()}`,
            categoria: 'Personalizados',
            esPersonalizado: true,
          };
          mutar((d) => ({ ...d, alimentosPropios: [...d.alimentosPropios, alimento] }));
          return alimento;
        },

        editarAlimento: (id, cambios) =>
          mutar((d) => {
            if (d.alimentosPropios.some((a) => a.id === id)) {
              return {
                ...d,
                alimentosPropios: d.alimentosPropios.map((a) => {
                  if (a.id !== id) return a;
                  const editado: Alimento = { ...a, ...cambios };
                  if (cambios.unidad === 'g') delete editado.unidad;
                  return editado;
                }),
              };
            }
            return { ...d, alimentosEditados: { ...d.alimentosEditados, [id]: cambios } };
          }),

        eliminarAlimento: (id) =>
          mutar((d) => {
            const recientes = d.recientes.filter((x) => x !== id);
            if (d.alimentosPropios.some((a) => a.id === id)) {
              return { ...d, recientes, alimentosPropios: d.alimentosPropios.filter((a) => a.id !== id) };
            }
            const alimentosOcultos = d.alimentosOcultos.includes(id) ? d.alimentosOcultos : [...d.alimentosOcultos, id];
            return { ...d, recientes, alimentosOcultos };
          }),

        restaurarAlimento: (id) =>
          mutar((d) => {
            const { [id]: _quitado, ...alimentosEditados } = d.alimentosEditados;
            return { ...d, alimentosEditados };
          }),

        restaurarProductosIncluidos: () =>
          mutar((d) => ({ ...d, alimentosEditados: {}, alimentosOcultos: [] })),
      };
    },
    {
      // Clave interna de almacenamiento: se mantiene del nombre anterior para no perder los datos guardados.
      name: 'macros-app',
      version: 4,
      storage: createJSONStorage(() => AsyncStorage),
      migrate: migrarEstado,
      partialize: (s) => ({ sesion: s.sesion, datos: s.datos, preferenciaTema: s.preferenciaTema }),
    },
  ),
);

/**
 * v1 guardaba `gramos`; desde v2 cada registro tiene `cantidad` + `unidad`.
 * v3 añade los cambios y eliminaciones de productos incluidos.
 * v4 añade el tipo de entrenamiento al perfil (Hipertrofia para perfiles existentes).
 */
/**
 * Si la cuenta `nuevoId` aún no tiene perfil y hay datos del login simulado (`local-*`),
 * mueve a esa cuenta el conjunto local con más registros. No toca cuentas que ya tienen datos.
 */
export function adoptarDatosLocales<D extends { perfil?: unknown; registros: unknown[] }>(
  datos: Record<string, D>,
  nuevoId: string,
): Record<string, D> {
  if (datos[nuevoId]?.perfil) return datos;
  const locales = Object.entries(datos).filter(([id, d]) => esIdLocal(id) && d.perfil);
  if (locales.length === 0) return datos;
  const [idOrigen, origen] = locales.sort((a, b) => b[1].registros.length - a[1].registros.length)[0];
  const resto = { ...datos };
  delete resto[idOrigen];
  return { ...resto, [nuevoId]: origen };
}

export function migrarEstado(guardado: unknown, version: number) {
  const estado = guardado as { sesion: Usuario | null; datos: Record<string, DatosUsuario> };
  if (version < 2) {
    for (const d of Object.values(estado.datos ?? {})) {
      d.registros = d.registros.map((r) => {
        const { gramos, ...resto } = r as RegistroComida & { gramos?: number };
        return { ...resto, cantidad: resto.cantidad ?? gramos ?? 0, unidad: resto.unidad ?? 'g' };
      });
    }
  }
  if (version < 3) {
    for (const d of Object.values(estado.datos ?? {})) {
      d.alimentosEditados ??= {};
      d.alimentosOcultos ??= [];
    }
  }
  if (version < 4) {
    for (const d of Object.values(estado.datos ?? {})) {
      if (d.perfil) d.perfil.tipoEntrenamiento ??= TIPO_ENTRENAMIENTO_POR_DEFECTO;
    }
  }
  return estado as unknown as EstadoApp;
}

// ---------- Selectores ----------

const VACIO = datosVacios();

export const useDatosUsuario = (): DatosUsuario =>
  useApp((s) => (s.sesion ? s.datos[s.sesion.id] ?? VACIO : VACIO));

export const usePerfil = () => useDatosUsuario().perfil;

export function useAlimentos(): Alimento[] {
  const { alimentosPropios, alimentosEditados, alimentosOcultos } = useDatosUsuario();
  return useMemo(
    () => combinarAlimentos(ALIMENTOS_BASE, alimentosPropios, alimentosEditados, alimentosOcultos),
    [alimentosPropios, alimentosEditados, alimentosOcultos],
  );
}

export function useRegistrosDe(fecha: string): RegistroComida[] {
  const { registros } = useDatosUsuario();
  return useMemo(
    () => registros.filter((r) => r.fecha === fecha).sort((a, b) => a.creadoEn - b.creadoEn),
    [registros, fecha],
  );
}

/** Meta de una fecha: la guardada ese día si existe, si no la del perfil actual. */
export function metaDeFecha(d: DatosUsuario, fecha: string): Metas | null {
  if (d.metasPorDia[fecha]) return d.metasPorDia[fecha];
  return d.perfil ? metasDePerfil(d.perfil) : null;
}

export function useMetaDe(fecha: string): Metas | null {
  const d = useDatosUsuario();
  return useMemo(() => metaDeFecha(d, fecha), [d, fecha]);
}

/** Estado (logrado/casi/no) de cada fecha con registros. */
export function useEstadosPorDia(): Record<string, EstadoDia> {
  const d = useDatosUsuario();
  return useMemo(() => {
    const porFecha: Record<string, RegistroComida[]> = {};
    for (const r of d.registros) (porFecha[r.fecha] ??= []).push(r);
    const umbrales = d.perfil?.umbrales;
    const res: Record<string, EstadoDia> = {};
    if (!umbrales) return res;
    for (const [fecha, regs] of Object.entries(porFecha)) {
      const meta = metaDeFecha(d, fecha);
      if (!meta) continue;
      res[fecha] = estadoDelDia(sumarRegistros(regs), meta, umbrales, regs.length > 0);
    }
    return res;
  }, [d]);
}

/** true cuando el almacenamiento local ya se cargó. */
export function useHidratado(): boolean {
  return useSyncExternalStore(
    (avisar) => useApp.persist.onFinishHydration(avisar),
    () => useApp.persist.hasHydrated(),
  );
}
