// Datos tomados de las reglas del README. Son el oráculo de las pruebas:
// los valores esperados salen de aquí, nunca de lo que muestra la tienda.

export const CLAVE = 'calidad2026';

export type Usuario = 'estandar' | 'bloqueado' | 'problema' | 'lento';

export const PRODUCTOS = {
  huehuetenango: { nombre: 'Café de Huehuetenango 250 g', precio: 75 },
  antigua: { nombre: 'Café de Antigua 500 g', precio: 140 },
  taza: { nombre: 'Taza de barro', precio: 60 },
  prensa: { nombre: 'Prensa francesa', precio: 225 },
  molino: { nombre: 'Molino manual', precio: 350 },
  filtros: { nombre: 'Filtros de papel (100)', precio: 25 },
} as const;

export type ClaveProducto = keyof typeof PRODUCTOS;

/** Productos y cantidades de un pedido, por ejemplo { molino: 1, huehuetenango: 2 }. */
export type Pedido = Partial<Record<ClaveProducto, number>>;

export interface DatosEnvio {
  nombre: string;
  apellido: string;
  cp: string;
  cupon?: string;
}

export const ENVIO_CAPITAL: DatosEnvio = { nombre: 'Ana', apellido: 'López', cp: '01001' };
export const ENVIO_INTERIOR: DatosEnvio = { nombre: 'Ana', apellido: 'López', cp: '02001' };

export const CUPON_VALIDO = 'ENVIOGRATIS';
export const ERROR_CUPON = 'El cupón no existe.';

/** Formato de dinero de la tienda: Q75 se muestra como "Q75.00". */
export const q = (monto: number) => 'Q' + monto.toFixed(2);
