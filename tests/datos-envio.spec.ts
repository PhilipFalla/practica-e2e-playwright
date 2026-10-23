import { CheckoutPage } from '../pages/CheckoutPage';
import { ResumenPage } from '../pages/ResumenPage';
import { ENVIO_CAPITAL, type DatosEnvio, type Usuario } from '../support/datos';
import { expect, test } from '../support/fixtures';

/*
 * Regla Datos de envío: nombre, apellido y código postal son obligatorios.
 * El código postal tiene exactamente 5 dígitos.
 */

/*
 * Técnica: tabla de decisión sobre los campos obligatorios.
 *   Condiciones: C1 hay nombre, C2 hay apellido, C3 hay código postal.
 *   R1 todas se cumplen -> pasa al resumen. R2..R4 falta una -> error y no pasa.
 *   R1 se repite con "problema", que tiene que poder pagar igual que "estandar".
 */
const faltantes: { regla: string; campo: string; datos: Partial<DatosEnvio> }[] = [
  { regla: 'R2', campo: 'nombre', datos: { apellido: 'López', cp: '01001' } },
  { regla: 'R3', campo: 'apellido', datos: { nombre: 'Ana', cp: '01001' } },
  { regla: 'R4', campo: 'código postal', datos: { nombre: 'Ana', apellido: 'López' } },
];

const usuarios: Usuario[] = ['estandar', 'problema'];

test.describe('Regla Datos de envío · Tabla de decisión', () => {
  for (const usuario of usuarios) {
    test(`Datos de envío · Tabla de decisión R1 · con nombre, apellido y código postal pasa al resumen (${usuario})`, async ({ page, checkout, flujos }) => {
      await flujos.irAlCheckout(usuario, { huehuetenango: 1 });

      await checkout.enviar(ENVIO_CAPITAL);

      await expect(page, `Regla Datos de envío: con nombre, apellido y código postal válidos se pasa al resumen (${usuario})`).toHaveURL(ResumenPage.ruta);
    });
  }

  for (const { regla, campo, datos } of faltantes) {
    test(`Datos de envío · Tabla de decisión ${regla} · sin ${campo} muestra error y no pasa al resumen`, async ({ page, checkout, flujos }) => {
      await flujos.irAlCheckout('estandar', { huehuetenango: 1 });

      await checkout.enviar(datos);

      await expect(checkout.mensajeError, `Regla Datos de envío: sin ${campo} tiene que mostrar un error`).not.toBeEmpty();
      await expect(page, `Regla Datos de envío: sin ${campo} no se pasa al resumen`).toHaveURL(CheckoutPage.ruta);
    });
  }
});

/*
 * Técnicas sobre el código postal:
 *   - Análisis de valores límite sobre la longitud: 4 | 5 | 6 dígitos.
 *   - Particiones de equivalencia: 5 caracteres con una letra, y 5 caracteres con un guion.
 */
const codigosInvalidos = [
  { cp: '0100', tecnica: 'Valores límite', caso: '4 dígitos' },
  { cp: '010010', tecnica: 'Valores límite', caso: '6 dígitos' },
  { cp: '01A01', tecnica: 'Particiones de equivalencia', caso: 'con una letra' },
  { cp: '01-01', tecnica: 'Particiones de equivalencia', caso: 'con un guion' },
];

test.describe('Regla Datos de envío · Código postal', () => {
  test.beforeEach(async ({ flujos }) => {
    await flujos.irAlCheckout('estandar', { huehuetenango: 1 });
  });

  test('Datos de envío · Valores límite · código postal de 5 dígitos se acepta', async ({ page, checkout }) => {
    await checkout.enviar({ ...ENVIO_CAPITAL, cp: '01001' });

    await expect(page, 'Regla Datos de envío: un código postal de 5 dígitos es válido y se pasa al resumen').toHaveURL(ResumenPage.ruta);
  });

  for (const { cp, tecnica, caso } of codigosInvalidos) {
    test(`Datos de envío · ${tecnica} · código postal "${cp}" (${caso}) muestra error`, async ({ page, checkout }) => {
      await checkout.enviar({ ...ENVIO_CAPITAL, cp });

      await expect(checkout.mensajeError, `Regla Datos de envío: "${cp}" (${caso}) no es un código postal válido`).not.toBeEmpty();
      await expect(page).toHaveURL(CheckoutPage.ruta);
    });
  }
});
