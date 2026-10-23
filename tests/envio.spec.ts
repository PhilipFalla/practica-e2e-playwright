import { CUPON_VALIDO, ENVIO_CAPITAL, ENVIO_INTERIOR, q, type Pedido } from '../support/datos';
import { expect, test } from '../support/fixtures';

/*
 * Regla Envío: Q25 si el código postal empieza con 01 (Ciudad de Guatemala), Q40 en cualquier otro caso.
 * Regla Envío gratis: Q0 si el subtotal con descuento es de Q300 o más, o si se usa ENVIOGRATIS.
 *   El cupón vale para cualquier código postal.
 * Regla Total: subtotal, menos el descuento, más el envío.
 */

/*
 * Técnica: particiones de equivalencia sobre el código postal.
 *   Empieza con 01 -> Q25. No empieza con 01 -> Q40, con dos representantes engañosos:
 *   empieza con 0 pero no con 01, y contiene 01 pero no al inicio.
 * Pedido de Q75: sin descuento y sin envío gratis por monto.
 */
const codigos = [
  { cp: '01001', caso: 'empieza con 01', envio: 25 },
  { cp: '02001', caso: 'empieza con 0 pero no con 01', envio: 40 },
  { cp: '10101', caso: 'contiene 01 pero no al inicio', envio: 40 },
];

test.describe('Regla Envío · Particiones de equivalencia', () => {
  for (const { cp, caso, envio } of codigos) {
    test(`Envío · Particiones de equivalencia · código postal ${cp} (${caso}) cuesta Q${envio}`, async ({ resumen, flujos }) => {
      await flujos.irAlResumen('estandar', { huehuetenango: 1 }, { ...ENVIO_CAPITAL, cp });

      await expect(resumen.envio, `Regla Envío: con código postal ${cp} (${caso}) el envío cuesta Q${envio}`).toHaveText(q(envio));
      await expect(resumen.total, 'Regla Total: Q75 + envío').toHaveText(q(75 + envio));
    });
  }
});

/*
 * Técnica: análisis de valores límite sobre "subtotal con descuento >= Q300".
 * Con precios múltiplos de Q5 no existe un pedido que dé exactamente Q300 con descuento:
 * los valores más cercanos son Q315 (Q299.25 con 5 %) y Q320 (Q304 con 5 %).
 * Q315 además prueba que la regla mira el subtotal con descuento y no el subtotal.
 */
const limitesGratis: { subtotal: number; pedido: Pedido; base: number; envio: number }[] = [
  { subtotal: 315, pedido: { taza: 4, huehuetenango: 1 }, base: 299.25, envio: 25 },
  { subtotal: 320, pedido: { antigua: 1, taza: 3 }, base: 304, envio: 0 },
];

test.describe('Regla Envío gratis · Valores límite', () => {
  for (const { subtotal, pedido, base, envio } of limitesGratis) {
    test(`Envío gratis · Valores límite · subtotal Q${subtotal} (Q${base} con descuento) paga envío Q${envio}`, async ({ resumen, flujos }) => {
      await flujos.irAlResumen('estandar', pedido, ENVIO_CAPITAL);

      await expect(resumen.subtotal).toHaveText(q(subtotal));
      await expect(resumen.envio, `Regla Envío gratis: con ${q(base)} después del descuento el envío cuesta Q${envio}`).toHaveText(q(envio));
      await expect(resumen.total, `Regla Total: ${q(base)} + ${q(envio)}`).toHaveText(q(base + envio));
    });
  }
});

/*
 * Técnica: tabla de decisión completa del costo de envío.
 *   C1 se usa ENVIOGRATIS, C2 el código postal empieza con 01, C3 subtotal con descuento >= Q300.
 *   Pedido con C3 = no: Huehuetenango 1 (Q75). Con C3 = sí: Antigua 1 + Taza 3 (Q320, Q304 con 5 %).
 *
 *   Regla | C1 | C2 | C3 | Envío
 *   R1    | no | sí | no | Q25
 *   R2    | no | no | no | Q40
 *   R3    | no | sí | sí | Q0
 *   R4    | no | no | sí | Q0
 *   R5    | sí | sí | no | Q0
 *   R6    | sí | no | no | Q0
 *   R7    | sí | sí | sí | Q0
 *   R8    | sí | no | sí | Q0
 */
const pedidoBajo: Pedido = { huehuetenango: 1 };
const pedidoAlto: Pedido = { antigua: 1, taza: 3 };

const tabla = [
  { regla: 'R1', cupon: false, capital: true, alto: false, envio: 25 },
  { regla: 'R2', cupon: false, capital: false, alto: false, envio: 40 },
  { regla: 'R3', cupon: false, capital: true, alto: true, envio: 0 },
  { regla: 'R4', cupon: false, capital: false, alto: true, envio: 0 },
  { regla: 'R5', cupon: true, capital: true, alto: false, envio: 0 },
  { regla: 'R6', cupon: true, capital: false, alto: false, envio: 0 },
  { regla: 'R7', cupon: true, capital: true, alto: true, envio: 0 },
  { regla: 'R8', cupon: true, capital: false, alto: true, envio: 0 },
];

test.describe('Regla Envío gratis · Tabla de decisión', () => {
  for (const { regla, cupon, capital, alto, envio } of tabla) {
    const destino = capital ? ENVIO_CAPITAL : ENVIO_INTERIOR;
    const base = alto ? 304 : 75;
    const descripcion = `${cupon ? 'con' : 'sin'} cupón, CP ${destino.cp}, ${alto ? 'Q304' : 'Q75'} con descuento`;

    test(`Envío gratis · Tabla de decisión ${regla} · ${descripcion}: envío Q${envio}`, async ({ resumen, flujos }) => {
      await flujos.irAlResumen('estandar', alto ? pedidoAlto : pedidoBajo, {
        ...destino,
        cupon: cupon ? CUPON_VALIDO : '',
      });

      await expect.soft(resumen.envio, `Regla Envío gratis (${regla}): ${descripcion} el envío cuesta Q${envio}`).toHaveText(q(envio));
      await expect.soft(resumen.total, `Regla Total (${regla}): ${q(base)} + ${q(envio)}`).toHaveText(q(base + envio));
    });
  }
});
