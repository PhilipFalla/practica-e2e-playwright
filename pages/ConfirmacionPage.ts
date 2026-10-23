import type { Locator, Page } from '@playwright/test';
import { Encabezado } from './Encabezado';

/** Pedido confirmado (confirmacion.html). */
export class ConfirmacionPage {
  static readonly ruta = /\/confirmacion(\.html)?$/;

  readonly encabezado: Encabezado;
  readonly numeroPedido: Locator;
  readonly enlaceVolver: Locator;

  constructor(readonly page: Page) {
    this.encabezado = new Encabezado(page);
    this.numeroPedido = page.getByTestId('pedido');
    this.enlaceVolver = page.getByRole('link', { name: 'Volver al catálogo' });
  }

  async goto() {
    await this.page.goto('/confirmacion');
  }
}
