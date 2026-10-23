import type { OrdenCatalogo } from '../pages/CatalogoPage';
import { PRODUCTOS, q, type Usuario } from '../support/datos';
import { expect, test } from '../support/fixtures';

/*
 * Regla Catálogo: se ordena por nombre (A a Z, Z a A) o por precio (menor a mayor,
 * mayor a menor). Al entrar, el orden es por nombre de A a Z.
 *
 * Técnica: particiones de equivalencia. Cada criterio de orden es una partición,
 * más el estado inicial. Los órdenes esperados se derivan de la tabla de precios del README.
 * Se repite para los usuarios "estandar" y "problema", que entran al mismo catálogo.
 */
const { huehuetenango, antigua, taza, prensa, molino, filtros } = PRODUCTOS;

const porNombreAZ = [antigua, huehuetenango, filtros, molino, prensa, taza].map((p) => p.nombre);
const porPrecioAsc = [filtros, taza, huehuetenango, antigua, prensa, molino].map((p) => p.nombre);

const ordenes: { orden: OrdenCatalogo; esperado: string[] }[] = [
  { orden: 'Nombre (A a Z)', esperado: porNombreAZ },
  { orden: 'Nombre (Z a A)', esperado: [...porNombreAZ].reverse() },
  { orden: 'Precio (menor a mayor)', esperado: porPrecioAsc },
  { orden: 'Precio (mayor a menor)', esperado: [...porPrecioAsc].reverse() },
];

const usuarios: Usuario[] = ['estandar', 'problema'];

for (const usuario of usuarios) {
  test.describe(`Regla Catálogo · Particiones de equivalencia · usuario "${usuario}"`, () => {
    test.beforeEach(async ({ flujos }) => {
      await flujos.iniciarSesion(usuario);
    });

    test(`Catálogo · Particiones de equivalencia · al entrar, el orden es por nombre de A a Z (${usuario})`, async ({ catalogo }) => {
      await expect(catalogo.selectorOrden).toHaveValue('az');
      await expect(catalogo.nombresProductos, 'Regla Catálogo: al entrar, los productos van por nombre de A a Z').toHaveText(porNombreAZ);
    });

    for (const { orden, esperado } of ordenes) {
      test(`Catálogo · Particiones de equivalencia · ordenar por ${orden} (${usuario})`, async ({ catalogo }) => {
        // Se parte de otro orden para que el cambio sea visible en todas las particiones.
        await catalogo.ordenarPor(orden === 'Nombre (Z a A)' ? 'Precio (menor a mayor)' : 'Nombre (Z a A)');
        await catalogo.ordenarPor(orden);

        await expect(catalogo.nombresProductos, `Regla Catálogo: con "${orden}" los productos no quedan en ese orden`).toHaveText(esperado);
      });
    }
  });
}

/*
 * Tabla de precios del README.
 * Técnica: particiones de equivalencia, una por producto.
 */
test.describe('Tabla de precios · Particiones de equivalencia', () => {
  test.beforeEach(async ({ flujos }) => {
    await flujos.iniciarSesion('estandar');
  });

  for (const { nombre, precio } of Object.values(PRODUCTOS)) {
    test(`Precios · Particiones de equivalencia · ${nombre} cuesta Q${precio}`, async ({ catalogo }) => {
      await expect(catalogo.precioDe(nombre), `Tabla de precios: ${nombre} tiene que costar Q${precio}`).toHaveText(q(precio));
    });
  }
});
