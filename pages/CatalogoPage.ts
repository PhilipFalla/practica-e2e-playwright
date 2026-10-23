import type { Locator, Page } from '@playwright/test';
import { Encabezado } from './Encabezado';

export type OrdenCatalogo =
  | 'Nombre (A a Z)'
  | 'Nombre (Z a A)'
  | 'Precio (menor a mayor)'
  | 'Precio (mayor a menor)';

/** Catálogo de productos (catalogo.html). */
export class CatalogoPage {
  static readonly ruta = /\/catalogo(\.html)?$/;

  readonly encabezado: Encabezado;
  readonly selectorOrden: Locator;
  readonly productos: Locator;
  /** Nombres de los productos en el orden en que se muestran. */
  readonly nombresProductos: Locator;
  /** Precios de los productos en el orden en que se muestran. */
  readonly preciosProductos: Locator;

  constructor(readonly page: Page) {
    this.encabezado = new Encabezado(page);
    this.selectorOrden = page.getByTestId('orden');
    this.productos = page.getByTestId('producto');
    this.nombresProductos = this.productos.getByRole('heading');
    this.preciosProductos = this.productos.getByTestId('precio');
  }

  async goto() {
    await this.page.goto('/catalogo');
  }

  async ordenarPor(orden: OrdenCatalogo) {
    await this.selectorOrden.selectOption({ label: orden });
  }

  producto(nombre: string): Locator {
    return this.productos.filter({
      has: this.page.getByRole('heading', { name: nombre, exact: true }),
    });
  }

  precioDe(nombre: string): Locator {
    return this.producto(nombre).getByTestId('precio');
  }

  botonAgregar(nombre: string): Locator {
    return this.producto(nombre).getByRole('button', { name: 'Agregar al carrito' });
  }

  botonQuitar(nombre: string): Locator {
    return this.producto(nombre).getByRole('button', { name: 'Quitar' });
  }

  async agregar(nombre: string) {
    await this.botonAgregar(nombre).click();
  }

  async quitar(nombre: string) {
    await this.botonQuitar(nombre).click();
  }
}
