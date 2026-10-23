import type { Locator, Page } from '@playwright/test';

/** Encabezado común a todas las páginas con sesión: contador del carrito y cierre de sesión. */
export class Encabezado {
  readonly contadorCarrito: Locator;
  readonly enlaceCarrito: Locator;
  readonly botonCerrarSesion: Locator;

  constructor(page: Page) {
    this.contadorCarrito = page.getByTestId('contador-carrito');
    this.enlaceCarrito = page.getByTestId('enlace-carrito');
    this.botonCerrarSesion = page.getByRole('button', { name: 'Cerrar sesión' });
  }

  async irAlCarrito() {
    await this.enlaceCarrito.click();
  }

  async cerrarSesion() {
    await this.botonCerrarSesion.click();
  }
}
