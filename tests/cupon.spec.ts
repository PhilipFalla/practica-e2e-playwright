import { CheckoutPage } from '../pages/CheckoutPage';
import { ResumenPage } from '../pages/ResumenPage';
import { ENVIO_CAPITAL, ERROR_CUPON, q } from '../support/datos';
import { expect, test } from '../support/fixtures';

/*
 * Regla Cupón: opcional. El único válido es ENVIOGRATIS, en mayúsculas o en minúsculas.
 * Los espacios al inicio y al final no cuentan. Cualquier otro texto, incluido ENVIOGRATIS
 * con letras de más, da el error "El cupón no existe."
 *
 * Técnica: particiones de equivalencia.
 *   Válidas: vacío (es opcional), ENVIOGRATIS, enviogratis, ENVIOGRATIS con espacios alrededor.
 *   Inválidas: letras de más al final, letras de más al inicio, espacio en medio, otro cupón.
 * Se usa un código postal de la capital para que el envío gratis solo dependa del cupón.
 */
const validos = [
  { cupon: '', caso: 'sin cupón (es opcional)', envio: 25 },
  { cupon: 'ENVIOGRATIS', caso: 'en mayúsculas', envio: 0 },
  { cupon: 'enviogratis', caso: 'en minúsculas', envio: 0 },
  { cupon: '  ENVIOGRATIS  ', caso: 'con espacios al inicio y al final', envio: 0 },
];

const invalidos = [
  { cupon: 'ENVIOGRATISS', caso: 'con una letra de más al final' },
  { cupon: 'XENVIOGRATIS', caso: 'con una letra de más al inicio' },
  { cupon: 'ENVIO GRATIS', caso: 'con un espacio en medio' },
  { cupon: 'DESCUENTO10', caso: 'otro texto' },
];

test.describe('Regla Cupón · Particiones de equivalencia', () => {
  test.beforeEach(async ({ flujos }) => {
    // Huehuetenango 1: subtotal Q75, sin descuento y lejos del envío gratis por monto.
    await flujos.irAlCheckout('estandar', { huehuetenango: 1 });
  });

  for (const { cupon, caso, envio } of validos) {
    test(`Cupón · Particiones de equivalencia · "${cupon}" ${caso} se acepta`, async ({ page, checkout, resumen }) => {
      await checkout.enviar({ ...ENVIO_CAPITAL, cupon });

      await expect(page, `Regla Cupón: "${cupon}" (${caso}) es válido y se pasa al resumen`).toHaveURL(ResumenPage.ruta);
      await expect(resumen.envio, `Regla Envío gratis: con "${cupon}" (${caso}) el envío a la capital cuesta Q${envio}`).toHaveText(q(envio));
    });
  }

  for (const { cupon, caso } of invalidos) {
    test(`Cupón · Particiones de equivalencia · "${cupon}" ${caso} da "El cupón no existe."`, async ({ page, checkout }) => {
      await checkout.enviar({ ...ENVIO_CAPITAL, cupon });

      await expect(checkout.mensajeError, `Regla Cupón: "${cupon}" (${caso}) tiene que dar el error "${ERROR_CUPON}"`).toHaveText(ERROR_CUPON);
      await expect(page).toHaveURL(CheckoutPage.ruta);
    });
  }
});
