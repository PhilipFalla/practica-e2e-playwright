import { ConfirmacionPage } from '../pages/ConfirmacionPage';
import { ENVIO_CAPITAL } from '../support/datos';
import { expect, test } from '../support/fixtures';

/*
 * Regla Confirmación: confirmar la compra muestra un número de pedido de 6 dígitos
 * y deja el carrito vacío.
 *
 * Técnica: transición de estados del pedido.
 *   Carrito con productos --continuar--> Datos de envío --continuar--> Resumen
 *   --confirmar--> Confirmado (carrito vacío).
 */
test.describe('Regla Confirmación · Transición de estados', () => {
  test('Confirmación · Transición de estados Resumen → Confirmado · número de pedido de 6 dígitos y carrito vacío', async ({ page, resumen, confirmacion, carrito, flujos }) => {
    await flujos.irAlResumen('estandar', { huehuetenango: 2, filtros: 1 }, ENVIO_CAPITAL);

    await resumen.confirmar();

    await expect(page).toHaveURL(ConfirmacionPage.ruta);
    await expect(confirmacion.numeroPedido, 'Regla Confirmación: el número de pedido tiene 6 dígitos').toHaveText(/^\d{6}$/);
    await expect(confirmacion.encabezado.contadorCarrito, 'Regla Confirmación: después de confirmar el carrito tiene 0 unidades').toHaveText('0');

    await carrito.goto();
    await expect(carrito.lineas, 'Regla Confirmación: después de confirmar el carrito no tiene productos').toHaveCount(0);
    await expect(carrito.mensajeVacio).toBeVisible();
    await expect(carrito.botonContinuar).toBeDisabled();
  });
});
