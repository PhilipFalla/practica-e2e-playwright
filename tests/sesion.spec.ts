import { CatalogoPage } from '../pages/CatalogoPage';
import { LoginPage } from '../pages/LoginPage';
import { CLAVE, PRODUCTOS } from '../support/datos';
import { expect, test } from '../support/fixtures';

/*
 * Regla Sesión: sin sesión, cualquier página lleva al ingreso. Cerrar sesión vacía el carrito.
 *
 * Técnica: transición de estados.
 *   Estados: S0 sin sesión, S1 con sesión y carrito vacío, S2 con sesión y carrito con productos.
 *   Transiciones: S0 --ingresar--> S1, S1 --agregar--> S2, S2 --cerrar sesión--> S0,
 *   y S0 --abrir página protegida--> S0 (la transición inválida: nunca deja ver la página).
 */
const paginasProtegidas = ['/catalogo', '/carrito', '/checkout', '/resumen', '/confirmacion'];

test.describe('Regla Sesión · Transición de estados', () => {
  for (const ruta of paginasProtegidas) {
    test(`Sesión · Transición de estados S0 · sin sesión, abrir ${ruta} lleva al ingreso`, async ({ page, ingreso }) => {
      await page.goto(ruta);

      await expect(page, `Regla Sesión: sin sesión, ${ruta} tiene que llevar al ingreso`).toHaveURL(LoginPage.ruta);
      await expect(ingreso.botonIngresar).toBeVisible();
    });
  }

  test('Sesión · Transición de estados S2 → S0 → S1 · cerrar sesión vacía el carrito', async ({ page, ingreso, catalogo, carrito, flujos }) => {
    await flujos.iniciarSesion('estandar');
    await catalogo.agregar(PRODUCTOS.huehuetenango.nombre);
    await catalogo.agregar(PRODUCTOS.taza.nombre);
    await expect(catalogo.encabezado.contadorCarrito).toHaveText('2');

    await catalogo.encabezado.cerrarSesion();
    await expect(page, 'Regla Sesión: cerrar sesión lleva al ingreso').toHaveURL(LoginPage.ruta);

    await ingreso.ingresar('estandar', CLAVE);
    await expect(page).toHaveURL(CatalogoPage.ruta);
    await expect(catalogo.encabezado.contadorCarrito, 'Regla Sesión: después de cerrar sesión el carrito tiene 0 unidades').toHaveText('0');

    await carrito.goto();
    await expect(carrito.lineas, 'Regla Sesión: después de cerrar sesión el carrito no tiene productos').toHaveCount(0);
    await expect(carrito.mensajeVacio).toBeVisible();
  });

  test('Sesión · Transición de estados S2 → S0 · después de cerrar sesión, el catálogo lleva al ingreso', async ({ page, catalogo, flujos }) => {
    await flujos.iniciarSesion('estandar');
    await catalogo.agregar(PRODUCTOS.molino.nombre);
    await catalogo.encabezado.cerrarSesion();

    await catalogo.goto();

    await expect(page, 'Regla Sesión: sin sesión, el catálogo tiene que llevar al ingreso').toHaveURL(LoginPage.ruta);
  });
});
