import { CheckoutPage } from '../pages/CheckoutPage';
import { PRODUCTOS, q } from '../support/datos';
import { expect, test } from '../support/fixtures';

/*
 * Regla Cantidad: entero de 1 a 5 por producto. Fuera de rango, negativo o con decimales,
 * la tienda muestra un error y no deja continuar al pago.
 *
 * Técnicas:
 *   - Análisis de valores límite (2 valores) sobre el rango [1, 5]: 0 | 1 ... 5 | 6.
 *   - Particiones de equivalencia: válida (enteros 1..5, representante 3),
 *     inválidas (negativos, representante -1; decimales, representante 2.5).
 */
const { antigua } = PRODUCTOS;

const validas = [
  { valor: 1, tecnica: 'Valores límite', caso: 'límite inferior' },
  { valor: 3, tecnica: 'Particiones de equivalencia', caso: 'partición válida' },
  { valor: 5, tecnica: 'Valores límite', caso: 'límite superior' },
];

const invalidas = [
  { valor: '0', tecnica: 'Valores límite', caso: 'justo debajo del límite inferior' },
  { valor: '6', tecnica: 'Valores límite', caso: 'justo encima del límite superior' },
  { valor: '-1', tecnica: 'Particiones de equivalencia', caso: 'partición de negativos' },
  { valor: '2.5', tecnica: 'Particiones de equivalencia', caso: 'partición de decimales' },
];

test.describe('Regla Cantidad · Valores límite y particiones de equivalencia', () => {
  test.beforeEach(async ({ flujos, carrito }) => {
    await flujos.iniciarSesion('estandar');
    await flujos.llenarCarrito({ antigua: 1 });
    await expect(carrito.botonContinuar).toBeEnabled();
  });

  for (const { valor, tecnica, caso } of validas) {
    test(`Cantidad · ${tecnica} · ${valor} (${caso}) se acepta y deja continuar al pago`, async ({ page, carrito }) => {
      await carrito.cambiarCantidad(antigua.nombre, valor);

      await expect(carrito.mensajeError, `Regla Cantidad: ${valor} es válida y no tiene que mostrar error`).toBeEmpty();
      await expect(carrito.encabezado.contadorCarrito, `Regla Carrito: el contador tiene que mostrar ${valor} unidades`).toHaveText(String(valor));
      await expect(carrito.totalLinea(antigua.nombre)).toHaveText(q(valor * antigua.precio));
      await expect(carrito.botonContinuar, `Regla Cantidad: con ${valor} se puede continuar al pago`).toBeEnabled();

      await carrito.continuar();
      await expect(page).toHaveURL(CheckoutPage.ruta);
    });
  }

  for (const { valor, tecnica, caso } of invalidas) {
    test(`Cantidad · ${tecnica} · ${valor} (${caso}) muestra error y no deja continuar al pago`, async ({ carrito }) => {
      await carrito.cambiarCantidad(antigua.nombre, valor);

      await expect(carrito.mensajeError, `Regla Cantidad: ${valor} no es válida y tiene que mostrar un error`).not.toBeEmpty();
      await expect(carrito.botonContinuar, `Regla Cantidad: con ${valor} no se puede continuar al pago`).toBeDisabled();
    });
  }
});
