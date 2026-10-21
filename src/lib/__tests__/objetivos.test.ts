import {
  calcularDesglose,
  calcularFactor,
  calcularTMB,
  cambiarPlan,
  cambiarTipoEntrenamiento,
  metasDePerfil,
  PROTEINA_G_KG,
  type DatosCalculo,
} from '../objetivos';
import { UMBRALES_POR_DEFECTO } from '../estadoDia';

const hombre: DatosCalculo = {
  sexo: 'hombre',
  edad: 30,
  alturaCm: 180,
  pesoKg: 80,
  objetivo: 'mantener',
  diasEntrenoSemana: 4,
  actividadDiaria: 'sedentaria',
};

describe('calcularTMB', () => {
  it('aplica Mifflin-St Jeor para hombre', () => {
    // 800 + 1125 - 150 + 5
    expect(calcularTMB(hombre)).toBe(1780);
  });

  it('aplica Mifflin-St Jeor para mujer', () => {
    expect(calcularTMB({ ...hombre, sexo: 'mujer' })).toBe(1614);
  });
});

describe('calcularFactor', () => {
  it('suma los días de entrenamiento al factor base', () => {
    expect(calcularFactor(hombre)).toBeCloseTo(1.2 + 4 * 0.035);
  });

  it('limita los días de entrenamiento a 7', () => {
    expect(calcularFactor({ ...hombre, actividadDiaria: 'muy_activa', diasEntrenoSemana: 10 })).toBeCloseTo(1.895);
  });
});

describe('calcularDesglose', () => {
  it('reparte proteína por kg y carbos con las calorías restantes', () => {
    const d = calcularDesglose(hombre);
    expect(d.proteina).toBe(128); // 80 × 1.6
    expect(d.grasa).toBe(72); // 80 × 0.9
    // GET = 1780 × 1.34 = 2385.2 ; carbos = (2385.2 − 512 − 648) / 4
    expect(d.calorias).toBe(2385);
    expect(d.carbos).toBe(306);
  });

  it('reduce calorías al perder grasa y sube la proteína', () => {
    const d = calcularDesglose({ ...hombre, objetivo: 'perder_grasa' });
    expect(d.proteina).toBe(176);
    expect(d.calorias).toBe(Math.round(2385.2 * 0.8));
  });

  it('si no sobran calorías tras proteínas y grasas, los carbos son 0', () => {
    const d = calcularDesglose({
      ...hombre,
      sexo: 'mujer',
      edad: 60,
      alturaCm: 150,
      pesoKg: 90,
      objetivo: 'perder_grasa',
      diasEntrenoSemana: 2,
    });
    // 1399 kcal − 198·4 − 81·9 < 0
    expect(d.carbos).toBe(0);
  });
});

describe('tipo de entrenamiento', () => {
  const TABLA = {
    hipertrofia: { perder_grasa: 2.2, recomposicion: 2.2, mantener: 1.6, ganar_musculo: 2.0 },
    calistenia: { perder_grasa: 1.85, recomposicion: 1.8, mantener: 1.6, ganar_musculo: 1.7 },
    cardio: { perder_grasa: 1.6, recomposicion: 1.6, mantener: 1.4, ganar_musculo: 1.5 },
  } as const;

  it('usa los g/kg de proteína de cada tipo y plan', () => {
    expect(PROTEINA_G_KG).toEqual(TABLA);
  });

  it('todas las calorías restantes van a carbohidratos en las 12 combinaciones', () => {
    for (const tipo of Object.keys(TABLA) as (keyof typeof TABLA)[]) {
      for (const objetivo of Object.keys(TABLA[tipo]) as (keyof (typeof TABLA)[typeof tipo])[]) {
        const d = calcularDesglose({ ...hombre, tipoEntrenamiento: tipo, objetivo });
        expect(d.proteina).toBe(Math.round(80 * TABLA[tipo][objetivo]));
        expect(d.carbos).toBe(Math.round((d.calorias - d.proteina * 4 - d.grasa * 9) / 4));
        expect(Math.abs(d.proteina * 4 + d.grasa * 9 + d.carbos * 4 - d.calorias)).toBeLessThanOrEqual(2);
      }
    }
  });

  it('calistenia y cardio dejan más carbos que hipertrofia con el mismo plan', () => {
    const hip = calcularDesglose({ ...hombre, tipoEntrenamiento: 'hipertrofia', objetivo: 'perder_grasa' });
    const cal = calcularDesglose({ ...hombre, tipoEntrenamiento: 'calistenia', objetivo: 'perder_grasa' });
    const car = calcularDesglose({ ...hombre, tipoEntrenamiento: 'cardio', objetivo: 'mantener' });
    // 1908 kcal: 148 g P, 72 g G → (1908 − 592 − 648) / 4 = 167
    expect(cal).toMatchObject({ calorias: 1908, proteina: 148, carbos: 167 });
    expect(cal.carbos).toBeGreaterThan(hip.carbos);
    // 2385 kcal: 112 g P → (2385 − 448 − 648) / 4 = 322
    expect(car).toMatchObject({ proteina: 112, carbos: 322 });
  });

  it('sin tipo de entrenamiento se calcula como hipertrofia', () => {
    expect(calcularDesglose(hombre)).toEqual(calcularDesglose({ ...hombre, tipoEntrenamiento: 'hipertrofia' }));
  });

  it('cambiar el tipo descarta las metas manuales y recalcula', () => {
    const perfil = {
      ...hombre,
      tipoEntrenamiento: 'hipertrofia' as const,
      nombre: '',
      umbrales: UMBRALES_POR_DEFECTO,
      metasManuales: { proteina: 150, carbos: 200 },
    };
    const cambiado = cambiarTipoEntrenamiento(perfil, 'cardio');
    expect(cambiado.metasManuales).toBeUndefined();
    expect(metasDePerfil(cambiado)).toEqual({ proteina: 112, carbos: 322 });
  });
});

describe('metasDePerfil', () => {
  it('prioriza las metas manuales', () => {
    const perfil = { ...hombre, tipoEntrenamiento: 'hipertrofia' as const, nombre: '', umbrales: UMBRALES_POR_DEFECTO };
    expect(metasDePerfil(perfil)).toEqual({ proteina: 128, carbos: 306 });
    expect(metasDePerfil({ ...perfil, metasManuales: { proteina: 150, carbos: 200 } })).toEqual({
      proteina: 150,
      carbos: 200,
    });
  });
});

describe('cambiarPlan', () => {
  const perfil = { ...hombre, tipoEntrenamiento: 'hipertrofia' as const, nombre: '', umbrales: UMBRALES_POR_DEFECTO };

  it('recalcula las metas para el nuevo plan', () => {
    const deficit = metasDePerfil(cambiarPlan(perfil, 'perder_grasa'));
    const volumen = metasDePerfil(cambiarPlan(perfil, 'ganar_musculo'));
    expect(deficit.proteina).toBe(176);
    expect(volumen.proteina).toBe(160);
    expect(volumen.carbos).toBeGreaterThan(metasDePerfil(perfil).carbos);
    expect(deficit.carbos).toBeLessThan(metasDePerfil(perfil).carbos);
  });

  it('descarta las metas manuales', () => {
    const conManuales = { ...perfil, metasManuales: { proteina: 150, carbos: 200 } };
    expect(cambiarPlan(conManuales, 'mantener').metasManuales).toBeUndefined();
    expect(cambiarPlan(conManuales, 'recomposicion').metasManuales).toBeUndefined();
  });

  it('la recomposición queda entre déficit y mantención, con proteína alta', () => {
    const recomp = calcularDesglose({ ...hombre, objetivo: 'recomposicion' });
    const deficit = calcularDesglose({ ...hombre, objetivo: 'perder_grasa' });
    const mantener = calcularDesglose(hombre);
    // GET 2385.2 × 0.9 ; carbos = (2146.7 − 176·4 − 72·9) / 4
    expect(recomp).toMatchObject({ calorias: 2147, proteina: 176, carbos: 199 });
    expect(recomp.calorias).toBeGreaterThan(deficit.calorias);
    expect(recomp.calorias).toBeLessThan(mantener.calorias);
    expect(recomp.proteina).toBe(deficit.proteina);
  });
});
