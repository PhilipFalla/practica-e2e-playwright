import { CatalogoPage } from '../pages/CatalogoPage';
import { LoginPage } from '../pages/LoginPage';
import { CLAVE } from '../support/datos';
import { expect, test } from '../support/fixtures';

/*
 * Regla Ingreso: usuario y contraseña son obligatorios. Si falta uno, si no coinciden
 * o si el usuario está bloqueado, se muestra un error y no se entra.
 *
 * Técnica: tabla de decisión.
 *   Condiciones: C1 hay usuario, C2 hay contraseña, C3 usuario y contraseña coinciden,
 *   C4 el usuario no está bloqueado.
 *   Acción: entra al catálogo (solo si C1..C4 se cumplen) o muestra error.
 *   R4 y R5 parten "no coinciden" en sus dos causas: contraseña equivocada y usuario inexistente.
 */
const rechazos = [
  { regla: 'R1', caso: 'falta el usuario', usuario: '', clave: CLAVE },
  { regla: 'R2', caso: 'falta la contraseña', usuario: 'estandar', clave: '' },
  { regla: 'R3', caso: 'faltan usuario y contraseña', usuario: '', clave: '' },
  { regla: 'R4', caso: 'contraseña equivocada', usuario: 'estandar', clave: 'calidad2025' },
  { regla: 'R5', caso: 'usuario inexistente', usuario: 'admin', clave: CLAVE },
  { regla: 'R6', caso: 'usuario bloqueado', usuario: 'bloqueado', clave: CLAVE },
];

test.describe('Regla Ingreso · Tabla de decisión', () => {
  test.beforeEach(async ({ ingreso }) => {
    await ingreso.goto();
  });

  for (const { regla, caso, usuario, clave } of rechazos) {
    test(`Ingreso · Tabla de decisión ${regla} · ${caso}: muestra error y no entra`, async ({ page, ingreso }) => {
      await ingreso.ingresar(usuario, clave);

      await expect(ingreso.mensajeError, `Regla Ingreso (${caso}): la tienda tiene que mostrar un mensaje de error`).not.toBeEmpty();
      await expect(page, `Regla Ingreso (${caso}): la tienda no tiene que dejar entrar`).toHaveURL(LoginPage.ruta);
    });
  }

  for (const usuario of ['estandar', 'problema']) {
    test(`Ingreso · Tabla de decisión R7 · "${usuario}" con contraseña correcta entra al catálogo`, async ({ page, ingreso }) => {
      await ingreso.ingresar(usuario, CLAVE);

      await expect(page, `Regla Ingreso: "${usuario}" con la contraseña correcta tiene que entrar`).toHaveURL(CatalogoPage.ruta);
    });
  }
});

/*
 * Usuario "lento": entra después de unos segundos.
 * Técnica: partición de equivalencia (usuario válido con demora). Sin esperas fijas:
 * se espera a que el botón muestre el estado de carga y luego a la URL del catálogo.
 */
test('Ingreso · Partición de equivalencia · "lento" entra después de unos segundos sin esperas fijas', async ({ page, ingreso }) => {
  await ingreso.goto();
  await ingreso.ingresar('lento', CLAVE);

  await expect(ingreso.botonIngresar, 'Regla Ingreso: mientras "lento" entra, el botón queda deshabilitado').toBeDisabled();
  await expect(page, 'Regla Ingreso: "lento" con la contraseña correcta tiene que entrar').toHaveURL(CatalogoPage.ruta, { timeout: 15_000 });
});
