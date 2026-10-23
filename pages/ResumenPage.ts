import type { Locator, Page } from '@playwright/test';
import { Encabezado } from './Encabezado';

/** Resumen del pedido con los montos (resumen.html). */
export class ResumenPage {
  static readonly ruta = /\/resumen(\.html)?$/;

  readonly encabezado: Encabezado;
  readonly lineas: Locator;
  readonly subtotal: Locator;
  /** Solo el número del porcentaje, por ejemplo "10". */
  readonly porcentajeDescuento: Locator;
  readonly descuento: Locator;
  readonly envio: Locator;
  readonly total: Locator;
  readonly botonConfirmar: Locator;
  readonly botonCancelar: Locator;

  constructor(readonly page: Page) {
    this.encabezado = new Encabezado(page);
    this.lineas = page.getByTestId('lineas').getByRole('listitem');
    this.subtotal = page.getByTestId('subtotal');
    this.porcentajeDescuento = page.getByTestId('descuento-pct');
    this.descuento = page.getByTestId('descuento');
    this.envio = page.getByTestId('envio');
    this.total = page.getByTestId('total');
    this.botonConfirmar = page.getByRole('button', { name: 'Confirmar compra' });
    this.botonCancelar = page.getByRole('button', { name: 'Cancelar' });
  }

  async goto() {
    await this.page.goto('/resumen');
  }

  async confirmar() {
    await this.botonConfirmar.click();
  }
}
