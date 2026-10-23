import { ENVIO_INTERIOR, q, type Pedido } from '../support/datos';
import { expect, test } from '../support/fixtures';

/*
 * Regla Descuento: subtotal menor de Q200 sin descuento; de Q200 a Q499, 5 %;
 * de Q500 en adelante, 10 %.
 * Regla Total: subtotal, menos el descuento, más el envío.
 *
 * Técnica: análisis de valores límite (2 valores) en las fronteras Q200 y Q500.
 * Todos los precios son múltiplos de Q5, así que el valor vecino de cada frontera
 * es Q5 menos: 195 | 200 y 495 | 500. Se agrega Q505 como valor dentro del tramo de 10 %.
 * Envío al interior (02001, Q40) y sin cupón; desde Q300 con descuento el envío es Q0.
 * Los montos usan expect.soft para que el reporte muestre todos los que no cuadran.
 */
const casos: { subtotal: number; pedido: Pedido; pct: number; descuento: number; envio: number }[] = [
  { subtotal: 195, pedido: { huehuetenango: 1, taza: 2 }, pct: 0, descuento: 0, envio: 40 },
  { subtotal: 200, pedido: { antigua: 1, taza: 1 }, pct: 5, descuento: 10, envio: 40 },
  { subtotal: 495, pedido: { huehuetenango: 1, antigua: 3 }, pct: 5, descuento: 24.75, envio: 0 },
  { subtotal: 500, pedido: { molino: 1, huehuetenango: 2 }, pct: 10, descuento: 50, envio: 0 },
  { subtotal: 505, pedido: { prensa: 1, antigua: 2 }, pct: 10, descuento: 50.5, envio: 0 },
];

test.describe('Regla Descuento · Valores límite', () => {
  for (const { subtotal, pedido, pct, descuento, envio } of casos) {
    const total = subtotal - descuento + envio;

    test(`Descuento · Valores límite · subtotal Q${subtotal} aplica ${pct} % y el total es Q${total}`, async ({ resumen, flujos }) => {
      await flujos.irAlResumen('estandar', pedido, ENVIO_INTERIOR);

      await expect(resumen.subtotal).toHaveText(q(subtotal));
      await expect.soft(resumen.porcentajeDescuento, `Regla Descuento: con subtotal Q${subtotal} el descuento es ${pct} %`).toHaveText(String(pct));
      await expect.soft(resumen.descuento, `Regla Descuento: con subtotal Q${subtotal} se descuentan ${q(descuento)}`).toHaveText('-' + q(descuento));
      await expect.soft(resumen.envio).toHaveText(q(envio));
      await expect.soft(resumen.total, `Regla Total: ${q(subtotal)} - ${q(descuento)} + ${q(envio)} = ${q(total)}`).toHaveText(q(total));
    });
  }
});
