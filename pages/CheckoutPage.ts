import type { Locator, Page } from '@playwright/test';
import type { DatosEnvio } from '../support/datos';
import { Encabezado } from './Encabezado';

/** Datos de envío y cupón (checkout.html). */
export class CheckoutPage {
  static readonly ruta = /\/checkout(\.html)?$/;

  readonly encabezado: Encabezado;
  readonly campoNombre: Locator;
  readonly campoApellido: Locator;
  readonly campoCodigoPostal: Locator;
  readonly campoCupon: Locator;
  readonly mensajeError: Locator;
  readonly botonContinuar: Locator;
  readonly botonCancelar: Locator;

  constructor(readonly page: Page) {
    this.encabezado = new Encabezado(page);
    this.campoNombre = page.getByLabel('Nombre', { exact: true });
    this.campoApellido = page.getByLabel('Apellido', { exact: true });
    this.campoCodigoPostal = page.getByLabel('Código postal', { exact: true });
    this.campoCupon = page.getByLabel('Cupón (opcional)', { exact: true });
    this.mensajeError = page.getByTestId('error');
    this.botonContinuar = page.getByRole('button', { name: 'Continuar', exact: true });
    this.botonCancelar = page.getByRole('button', { name: 'Cancelar' });
  }

  async goto() {
    await this.page.goto('/checkout');
  }

  /** Llena solo los campos que vienen en `datos`; los demás quedan vacíos. */
  async llenar(datos: Partial<DatosEnvio>) {
    if (datos.nombre !== undefined) await this.campoNombre.fill(datos.nombre);
    if (datos.apellido !== undefined) await this.campoApellido.fill(datos.apellido);
    if (datos.cp !== undefined) await this.campoCodigoPostal.fill(datos.cp);
    if (datos.cupon !== undefined) await this.campoCupon.fill(datos.cupon);
  }

  async enviar(datos: Partial<DatosEnvio>) {
    await this.llenar(datos);
    await this.botonContinuar.click();
  }
}
