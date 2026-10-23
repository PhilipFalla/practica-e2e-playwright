import type { Locator, Page } from '@playwright/test';
import { Encabezado } from './Encabezado';

/** Carrito de compras (carrito.html). */
export class CarritoPage {
  static readonly ruta = /\/carrito(\.html)?$/;

  readonly encabezado: Encabezado;
  readonly lineas: Locator;
  readonly mensajeVacio: Locator;
  readonly mensajeError: Locator;
  readonly subtotal: Locator;
  readonly botonContinuar: Locator;

  constructor(readonly page: Page) {
    this.encabezado = new Encabezado(page);
    this.lineas = page.getByTestId('linea');
    this.mensajeVacio = page.getByTestId('vacio');
    this.mensajeError = page.getByTestId('error');
    this.subtotal = page.getByTestId('subtotal');
    this.botonContinuar = page.getByRole('button', { name: 'Continuar al pago' });
  }

  async goto() {
    await this.page.goto('/carrito');
  }

  linea(nombre: string): Locator {
    return this.lineas.filter({ hasText: nombre });
  }

  campoCantidad(nombre: string): Locator {
    return this.page.getByRole('spinbutton', { name: `Cantidad de ${nombre}`, exact: true });
  }

  totalLinea(nombre: string): Locator {
    return this.linea(nombre).getByTestId('total-linea');
  }

  /** Escribe la cantidad y sale del campo, que es cuando la tienda la valida. */
  async cambiarCantidad(nombre: string, cantidad: string | number) {
    const campo = this.campoCantidad(nombre);
    await campo.fill(String(cantidad));
    await campo.blur();
  }

  async quitar(nombre: string) {
    await this.linea(nombre).getByRole('button', { name: 'Quitar' }).click();
  }

  async continuar() {
    await this.botonContinuar.click();
  }
}
