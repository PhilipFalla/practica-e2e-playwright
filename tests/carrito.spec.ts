import { PRODUCTOS, q, type Usuario } from '../support/datos';
import { expect, test } from '../support/fixtures';

/*
 * Regla Carrito: cada producto se agrega una vez desde el catálogo y la cantidad se cambia
 * en el carrito. El contador del encabezado muestra el total de unidades.
 */
const usuarios: Usuario[] = ['estandar', 'problema'];

/*
 * Técnica: particiones de equivalencia, una por producto del catálogo y por usuario.
 * Agregar un producto deja en el carrito ese producto, con su precio y cantidad 1.
 */
for (const usuario of usuarios) {
  test.describe(`Regla Carrito · Particiones de equivalencia · usuario "${usuario}"`, () => {
    test.beforeEach(async ({ flujos }) => {
      await flujos.iniciarSesion(usuario);
    });

    for (const { nombre, precio } of Object.values(PRODUCTOS)) {
      test(`Carrito · Particiones de equivalencia · agregar ${nombre} lo deja en el carrito (${usuario})`, async ({ catalogo, carrito }) => {
        await catalogo.agregar(nombre);
        await carrito.goto();

        await expect(carrito.linea(nombre), `Regla Carrito: al agregar "${nombre}" el carrito tiene que tener ese producto`).toHaveCount(1);
        await expect(carrito.lineas, `Regla Carrito: al agregar solo "${nombre}" el carrito tiene una línea`).toHaveCount(1);
        await expect(carrito.campoCantidad(nombre)).toHaveValue('1');
        await expect(carrito.totalLinea(nombre)).toHaveText(q(precio));
      });
    }
  });
}

/*
 * Técnica: transición de estados de un producto en el catálogo.
 *   No agregado --agregar--> Agregado (solo se puede quitar) --quitar--> No agregado.
 */
test.describe('Regla Carrito · Transición de estados', () => {
  test.beforeEach(async ({ flujos }) => {
    await flujos.iniciarSesion('estandar');
  });

  test('Carrito · Transición de estados · un producto agregado no se puede volver a agregar desde el catálogo', async ({ catalogo }) => {
    const { nombre } = PRODUCTOS.prensa;

    await catalogo.agregar(nombre);

    await expect(catalogo.botonAgregar(nombre), 'Regla Carrito: un producto se agrega una sola vez desde el catálogo').toHaveCount(0);
    await expect(catalogo.botonQuitar(nombre)).toBeVisible();
    await expect(catalogo.encabezado.contadorCarrito).toHaveText('1');

    await catalogo.quitar(nombre);

    await expect(catalogo.botonAgregar(nombre)).toBeVisible();
    await expect(catalogo.encabezado.contadorCarrito).toHaveText('0');
  });

  test('Carrito · Transición de estados · el contador muestra el total de unidades al agregar, cambiar cantidad y quitar', async ({ catalogo, carrito }) => {
    const { huehuetenango, antigua, filtros } = PRODUCTOS;

    await catalogo.agregar(huehuetenango.nombre);
    await catalogo.agregar(antigua.nombre);
    await catalogo.agregar(filtros.nombre);
    await expect(catalogo.encabezado.contadorCarrito, 'Regla Carrito: 3 productos de 1 unidad son 3 unidades').toHaveText('3');

    await carrito.goto();
    await carrito.cambiarCantidad(antigua.nombre, 4);
    await expect(carrito.encabezado.contadorCarrito, 'Regla Carrito: 1 + 4 + 1 son 6 unidades').toHaveText('6');

    await carrito.quitar(huehuetenango.nombre);
    await expect(carrito.encabezado.contadorCarrito, 'Regla Carrito: 4 + 1 son 5 unidades').toHaveText('5');
    await expect(carrito.subtotal).toHaveText(q(4 * antigua.precio + filtros.precio));
  });
});
