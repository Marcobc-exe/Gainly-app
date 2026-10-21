import type { Alimento, CambiosAlimento, CategoriaAlimento, Unidad } from '@/types';

// Valores aproximados (tablas nutricionales estándar y productos genéricos del mercado).
// Se indica "cocido" o "crudo" cuando cambia mucho el valor.
type Fila = [nombre: string, proteina: number, carbos: number];

type CategoriaLiquido =
  | 'Leches'
  | 'Cafés'
  | 'Chocolates y batidos'
  | 'Zumos y jugos'
  | 'Bebidas proteicas'
  | 'Otras bebidas';
type CategoriaSolido = Exclude<CategoriaAlimento, CategoriaLiquido | 'Personalizados'>;

/** Sólidos: valores por 100 g. */
const solidos: Record<CategoriaSolido, Fila[]> = {
  Carnes: [
    ['Carne de vacuno magra (cocida)', 31, 0],
    ['Carne de vacuno magra (cruda)', 22, 0],
    ['Carne picada 10% grasa (cocida)', 26, 0],
    ['Bistec de ternera (cocido)', 29, 0],
    ['Lomo de cerdo (cocido)', 29, 0],
    ['Lomo de cerdo (crudo)', 21, 0],
    ['Costilla de cerdo (cocida)', 24, 0],
    ['Chuleta de cerdo (cocida)', 27, 0],
    ['Jamón cocido', 18, 1.5],
    ['Jamón serrano', 30, 0],
    ['Cordero (cocido)', 25, 0],
  ],
  Aves: [
    ['Pechuga de pollo (cocida)', 31, 0],
    ['Pechuga de pollo (cruda)', 23, 0],
    ['Muslo de pollo sin piel (cocido)', 26, 0],
    ['Pollo asado con piel', 27, 0],
    ['Pechuga de pavo (cocida)', 29, 0],
    ['Fiambre de pavo', 18, 2],
  ],
  Pescados: [
    ['Atún en lata al natural', 26, 0],
    ['Atún en lata en aceite (escurrido)', 25, 0],
    ['Atún fresco (cocido)', 30, 0],
    ['Salmón (cocido)', 25, 0],
    ['Merluza (cocida)', 18, 0],
    ['Bacalao (cocido)', 23, 0],
    ['Sardinas en lata', 25, 0],
    ['Camarones / gambas (cocidos)', 24, 0],
  ],
  'Huevos y lácteos': [
    ['Huevo entero', 13, 1.1],
    ['Clara de huevo', 11, 0.7],
    ['Yogur natural', 3.5, 4.7],
    ['Yogur griego natural', 9, 4],
    ['Queso fresco', 12, 3],
    ['Queso cottage', 11, 3.4],
    ['Queso curado', 25, 1],
    ['Requesón', 11, 3.5],
  ],
  Legumbres: [
    ['Lentejas (cocidas)', 9, 20],
    ['Garbanzos (cocidos)', 8.9, 27],
    ['Frijoles / porotos negros (cocidos)', 8.9, 24],
    ['Tofu firme', 15, 2],
  ],
  'Cereales y pastas': [
    ['Arroz blanco (cocido)', 2.7, 28],
    ['Arroz blanco (crudo)', 7, 79],
    ['Arroz integral (cocido)', 2.6, 23],
    ['Fideos / pasta (cocidos)', 5.8, 31],
    ['Fideos / pasta (crudos)', 13, 72],
    ['Pasta integral (cocida)', 5.3, 27],
    ['Avena en copos', 13, 60],
    ['Quinoa (cocida)', 4.4, 21],
    ['Cuscús (cocido)', 3.8, 23],
    ['Maíz dulce', 3.3, 19],
  ],
  Tubérculos: [
    ['Puré de patatas', 2, 15],
    ['Patata / papa cocida', 1.9, 20],
    ['Patatas fritas (caseras)', 3.4, 36],
    ['Boniato / batata (cocido)', 2, 21],
    ['Yuca / mandioca (cocida)', 1.4, 38],
  ],
  'Verduras y vegetales': [
    // Hojas verdes y ensaladas
    ['Lechuga iceberg', 0.9, 3],
    ['Lechuga romana', 1.2, 3.3],
    ['Lechuga hoja de roble / morada', 1.3, 2.3],
    ['Mezclum / mezcla de hojas verdes', 2.2, 3.6],
    ['Ensalada mixta (lechuga, tomate y cebolla)', 1, 4],
    ['Rúcula', 2.6, 3.7],
    ['Canónigos', 2, 3.6],
    ['Berros', 2.3, 1.3],
    ['Endibia', 1.3, 3.4],
    ['Escarola', 1.2, 3.2],
    ['Radicchio', 1.4, 4.5],
    ['Espinaca (cruda)', 2.9, 3.6],
    ['Espinaca (cocida)', 3, 3.8],
    ['Acelga (cruda)', 1.8, 3.7],
    ['Acelga (cocida)', 1.9, 4.1],
    ['Kale / col rizada', 2.9, 4.4],
    ['Berza / col forrajera', 3, 5.4],
    ['Grelos / rapini', 3.2, 2.9],
    ['Hojas de mostaza', 2.9, 4.7],
    ['Diente de león (hojas)', 2.7, 9.2],
    ['Borraja (cocida)', 2.1, 3.5],
    // Coles
    ['Col / repollo (crudo)', 1.3, 5.8],
    ['Col / repollo (cocido)', 1.3, 5.5],
    ['Col lombarda', 1.4, 7.4],
    ['Col china / bok choy', 1.5, 2.2],
    ['Coles de Bruselas (cocidas)', 2.6, 7.1],
    ['Brócoli (crudo)', 2.8, 6.6],
    ['Brócoli (cocido)', 2.4, 7.2],
    ['Bimi / brocolini', 3, 5.5],
    ['Coliflor (cruda)', 1.9, 5],
    ['Coliflor (cocida)', 1.8, 4.1],
    ['Romanesco', 2, 4],
    ['Colinabo', 1.7, 6.2],
    // Tallos, bulbos y brotes
    ['Espárrago verde (crudo)', 2.2, 3.9],
    ['Espárrago verde (cocido)', 2.4, 4.1],
    ['Espárrago blanco en conserva', 1.8, 2.5],
    ['Alcachofa (cocida)', 2.9, 11.4],
    ['Cardo (cocido)', 0.8, 5.3],
    ['Apio', 0.7, 3],
    ['Hinojo', 1.2, 7.3],
    ['Puerro', 1.5, 14.2],
    ['Cebolla', 1.1, 9.3],
    ['Cebolla morada', 1, 9],
    ['Cebolleta / cebolla de verdeo', 1.8, 7.3],
    ['Chalota', 2.5, 16.8],
    ['Ajo', 6.4, 33],
    ['Palmito', 2.5, 4.6],
    ['Brotes de soja', 3, 5.9],
    ['Brotes de alfalfa', 4, 2.1],
    // Frutos de huerta
    ['Tomate', 0.9, 3.9],
    ['Tomate cherry', 0.9, 3.9],
    ['Tomate triturado en conserva', 1.6, 7.3],
    ['Tomate seco', 14, 56],
    ['Tomatillo', 1, 5.8],
    ['Pimiento rojo', 1, 6],
    ['Pimiento verde', 0.9, 4.6],
    ['Pimiento amarillo', 1, 6.3],
    ['Pimiento del piquillo en conserva', 1, 4],
    ['Jalapeño', 0.9, 6.5],
    ['Pepino', 0.7, 3.6],
    ['Pepinillos encurtidos', 0.3, 2],
    ['Calabacín / zapallito (crudo)', 1.2, 3.1],
    ['Calabacín / zapallito (cocido)', 1.1, 2.7],
    ['Berenjena (cruda)', 1, 5.9],
    ['Berenjena (asada)', 0.8, 8.7],
    ['Calabaza / zapallo (cocida)', 0.7, 4.9],
    ['Calabaza moscada / butternut (cocida)', 0.9, 10.5],
    ['Calabaza espagueti (cocida)', 0.7, 6.5],
    ['Chayote / guatila', 0.8, 4.5],
    ['Okra / quimbombó', 1.9, 7.5],
    ['Aguacate / palta', 2, 8.5],
    ['Aceitunas verdes', 1, 3.8],
    ['Aceitunas negras', 0.8, 6.3],
    // Raíces
    ['Zanahoria (cruda)', 0.9, 9.6],
    ['Zanahoria (cocida)', 0.8, 8.2],
    ['Remolacha / betarraga (cocida)', 1.7, 10],
    ['Rábano', 0.7, 3.4],
    ['Rábano daikon', 0.6, 4.1],
    ['Nabo (cocido)', 0.7, 5.1],
    ['Chirivía (cocida)', 1.3, 17],
    ['Apionabo', 1.5, 9.2],
    ['Jícama', 0.7, 8.8],
    // Vainas, granos tiernos y mazorca
    ['Judías verdes / chauchas (crudas)', 1.8, 7],
    ['Judías verdes / chauchas (cocidas)', 1.9, 7.9],
    ['Guisantes / arvejas (cocidos)', 5.4, 15.6],
    ['Tirabeques', 2.8, 7.6],
    ['Habas (cocidas)', 7.6, 19.7],
    ['Edamame', 11.9, 8.9],
    ['Mazorca de maíz / choclo (cocida)', 3.4, 21],
    // Setas
    ['Champiñones (crudos)', 3.1, 3.3],
    ['Champiñones en conserva', 1.9, 4.9],
    ['Setas portobello', 2.1, 3.9],
    ['Setas shiitake (cocidas)', 1.6, 14.4],
    ['Setas de ostra / gírgolas', 3.3, 6.1],
    // Algas, hierbas y mezclas
    ['Alga wakame', 3, 9.1],
    ['Alga nori', 5.8, 5.1],
    ['Perejil fresco', 3, 6.3],
    ['Cilantro fresco', 2.1, 3.7],
    ['Albahaca fresca', 3.2, 2.7],
    ['Menestra de verduras (congelada, cocida)', 2.6, 13.1],
  ],
  Panes: [
    ['Pan blanco', 9, 49],
    ['Pan integral', 13, 41],
    ['Pan de molde', 8, 47],
    ['Tortilla de trigo', 8, 50],
    ['Arepa de maíz', 4.5, 33],
  ],
  Frutas: [
    ['Plátano / banana', 1.1, 23],
    ['Manzana', 0.3, 14],
    ['Naranja', 0.9, 12],
    ['Fresas', 0.7, 8],
    ['Uvas', 0.7, 18],
    ['Dátiles', 2.5, 75],
  ],
  Suplementos: [
    ['Proteína whey (polvo)', 78, 8],
    ['Proteína vegetal (polvo)', 75, 6],
    ['Barrita proteica', 30, 40],
    ['Crema de cacahuete / maní', 25, 20],
  ],
};

/** Marcas de acento que quedan tras normalizar a NFD (U+0300 a U+036F). */
/** Líquidos: valores por 100 ml. */
const liquidos: Record<CategoriaLiquido, Fila[]> = {
  Leches: [
    ['Leche entera', 3.2, 4.8],
    ['Leche semidesnatada', 3.3, 4.9],
    ['Leche desnatada', 3.4, 5],
    ['Leche sin lactosa', 3.2, 4.8],
    ['Leche semidesnatada sin lactosa', 3.2, 4.7],
    ['Leche desnatada sin lactosa', 3.4, 4.8],
    ['Leche alta en proteínas', 6, 4.8],
    ['Leche de cabra', 3.6, 4.4],
    ['Leche de oveja', 5.4, 5.1],
    ['Leche evaporada', 6.8, 10],
    ['Leche en polvo reconstituida', 3.4, 5],
    ['Leche fermentada (tipo Actimel)', 2.7, 12],
    ['Suero de leche / buttermilk', 3.3, 4.8],
    ['Kéfir', 3.3, 4.5],
    ['Kéfir desnatado', 3.4, 4.2],
    ['Kéfir de cabra', 3.2, 4],
    ['Yogur bebible', 2.8, 13],
    ['Bebida de soja', 3.3, 2.5],
    ['Bebida de soja sin azúcar', 3.3, 0.3],
    ['Bebida de soja sabor vainilla', 3, 7],
    ['Bebida de avena', 0.5, 7],
    ['Bebida de avena barista', 1, 7.5],
    ['Bebida de almendra', 0.5, 0.3],
    ['Bebida de almendra azucarada', 0.5, 3.5],
    ['Bebida de arroz', 0.1, 9.4],
    ['Bebida de coco', 0.2, 2.7],
    ['Bebida de anacardo', 0.5, 1.5],
    ['Bebida de avellana', 0.4, 6],
    ['Bebida de guisante', 3, 1],
    ['Bebida de espelta', 0.6, 8],
    ['Bebida de quinoa', 0.5, 7.5],
    ['Bebida de cáñamo', 0.8, 1.5],
  ],
  Cafés: [
    ['Café solo / espresso', 0.1, 0],
    ['Café americano', 0.1, 0],
    ['Café cold brew', 0.2, 0],
    ['Café con leche entera', 1.7, 2.5],
    ['Café con leche desnatada', 1.8, 2.6],
    ['Café con leche y azúcar', 1.6, 7],
    ['Café descafeinado con leche', 1.7, 2.5],
    ['Café cortado', 1, 1.5],
    ['Capuchino', 2.2, 3.2],
    ['Café latte', 2.6, 3.9],
    ['Café latte con bebida de avena', 0.6, 5.5],
    ['Café latte con bebida de soja', 2.6, 2.2],
    ['Café con bebida de avena', 0.3, 3.5],
    ['Flat white', 2.8, 4],
    ['Café macchiato', 1.2, 1.8],
    ['Caramel macchiato', 2.2, 10],
    ['Café moca', 2.5, 9],
    ['Café bombón', 2.5, 20],
    ['Café frappé', 1.5, 12],
    ['Café frío embotellado con leche', 2.5, 8],
    ['Café helado con leche', 1.6, 6],
    ['Chai latte', 1.6, 9],
  ],
  'Chocolates y batidos': [
    ['Batido de chocolate', 3.3, 10],
    ['Batido de chocolate desnatado', 3.4, 9],
    ['Batido de chocolate sin azúcar añadido', 3.4, 5.5],
    ['Chocolate a la taza', 3.5, 18],
    ['Leche con cacao soluble', 3.6, 11],
    ['Leche con cacao sin azúcar', 3.5, 5.5],
    ['Chocolate caliente con leche desnatada', 3.6, 12],
    ['Chocolate caliente con bebida de avena', 0.8, 12],
    ['Chocolate caliente con bebida de soja', 3, 9],
    ['Chocolate caliente instantáneo con agua', 0.8, 12],
    ['Chocolate blanco caliente', 3, 14],
    ['Batido de vainilla', 3.2, 11],
    ['Batido de fresa', 3.1, 10.5],
    ['Batido de plátano', 3.1, 11],
    ['Batido de café', 3.2, 10],
  ],
  'Zumos y jugos': [
    ['Zumo / jugo de naranja', 0.7, 10],
    ['Zumo / jugo de mandarina', 0.5, 10],
    ['Zumo / jugo de manzana', 0.1, 11],
    ['Zumo / jugo de piña', 0.4, 12],
    ['Zumo / jugo de uva', 0.4, 15],
    ['Zumo / jugo de pomelo', 0.5, 9],
    ['Zumo / jugo de granada', 0.2, 13],
    ['Zumo / jugo de tomate', 0.8, 3.5],
    ['Zumo / jugo de zanahoria', 0.9, 9],
    ['Zumo / jugo de limón', 0.4, 6.9],
    ['Zumo / jugo multifrutas', 0.4, 11],
    ['Zumo / jugo verde (manzana y espinaca)', 0.5, 9],
    ['Néctar de melocotón / durazno', 0.3, 12],
    ['Néctar de pera', 0.2, 12],
    ['Néctar de mango', 0.2, 13],
    ['Néctar de maracuyá', 0.4, 13],
    ['Néctar de guayaba', 0.2, 13],
    ['Cóctel de arándano rojo', 0, 12],
    ['Limonada', 0, 8],
    ['Smoothie de frutos rojos', 0.7, 12],
    ['Smoothie de mango', 0.6, 13],
    ['Agua de coco', 0.7, 3.7],
  ],
  'Bebidas proteicas': [
    ['Batido proteico listo para beber', 8, 4],
    ['Batido proteico de chocolate listo para beber', 8, 3.5],
    ['Batido proteico de vainilla listo para beber', 8, 3.5],
    ['Batido proteico de fresa listo para beber', 8, 4],
    ['Café proteico listo para beber', 5.5, 3],
    ['Batido de whey con agua (30 g en 300 ml)', 8, 0.8],
    ['Batido de whey con leche desnatada (30 g en 300 ml)', 11, 5.3],
    ['Batido de whey con leche entera (30 g en 300 ml)', 10.7, 5.1],
    ['Batido de whey con bebida de avena (30 g en 300 ml)', 8.3, 7.1],
    ['Batido de whey con bebida de soja (30 g en 300 ml)', 10.8, 3.1],
    ['Batido de caseína con agua (30 g en 300 ml)', 8, 0.6],
    ['Batido de proteína de soja con agua (30 g en 300 ml)', 7, 1],
    ['Batido proteico de plátano casero', 7, 9],
    ['Batido proteico de avena y cacao', 6, 10],
    ['Batido para ganar peso (gainer) con leche', 6, 16],
    ['Leche proteica de chocolate', 6.5, 5],
    ['Yogur bebible alto en proteínas', 6, 5],
    ['Kéfir alto en proteínas', 6, 4],
    ['Bebida proteica vegetal (guisante)', 6, 2],
    ['Agua proteica (aislado de suero)', 4, 0.3],
    ['Bebida de colágeno', 3, 0.5],
  ],
  'Otras bebidas': [
    ['Bebida isotónica', 0, 6],
    ['Refresco de cola', 0, 10.6],
    ['Cerveza', 0.5, 3.6],
  ],
};

const DIACRITICOS = new RegExp(`[${String.fromCharCode(0x300)}-${String.fromCharCode(0x36f)}]`, 'g');

const slug = (s: string) =>
  s
    .normalize('NFD')
    .replace(DIACRITICOS, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const aAlimentos = (tabla: Record<string, Fila[]>, unidad: Unidad): Alimento[] =>
  Object.entries(tabla).flatMap(([categoria, filas]) =>
    filas.map(([nombre, proteinaPor100g, carbosPor100g]) => ({
      id: slug(nombre),
      nombre,
      categoria: categoria as CategoriaAlimento,
      proteinaPor100g,
      carbosPor100g,
      ...(unidad === 'ml' ? { unidad } : {}),
    })),
  );

export const ALIMENTOS_BASE: Alimento[] = [...aAlimentos(solidos, 'g'), ...aAlimentos(liquidos, 'ml')];

export const normalizar = (s: string) =>
  s
    .normalize('NFD')
    .replace(DIACRITICOS, '')
    .toLowerCase()
    .trim();

/**
 * Lista final de productos de un usuario: primero los suyos, luego los incluidos
 * sin los que eliminó y con sus cambios aplicados.
 */
export function combinarAlimentos(
  base: Alimento[],
  propios: Alimento[],
  editados: Record<string, CambiosAlimento>,
  ocultos: string[],
): Alimento[] {
  const ocultosSet = new Set(ocultos);
  const incluidos = base
    .filter((a) => !ocultosSet.has(a.id))
    .map((a): Alimento => {
      const cambios = editados[a.id];
      if (!cambios) return { ...a, origen: 'incluido' };
      const modificado: Alimento = { ...a, ...cambios, origen: 'modificado' };
      if (cambios.unidad === 'g') delete modificado.unidad;
      return modificado;
    });
  return [...propios.map((a): Alimento => ({ ...a, origen: 'propio' })), ...incluidos];
}

/** Busca por nombre o categoría, ignorando tildes y mayúsculas. Todas las palabras deben coincidir. */
export function buscarAlimentos(lista: Alimento[], consulta: string): Alimento[] {
  const palabras = normalizar(consulta).split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return lista;
  return lista.filter((a) => {
    const texto = normalizar(`${a.nombre} ${a.categoria}`);
    return palabras.every((p) => texto.includes(p));
  });
}

/** Macros para una cantidad en gramos (o ml si el alimento es líquido). */
export function macrosPara(alimento: Alimento, cantidad: number) {
  const f = cantidad / 100;
  return {
    proteina: Math.round(alimento.proteinaPor100g * f * 10) / 10,
    carbos: Math.round(alimento.carbosPor100g * f * 10) / 10,
  };
}
