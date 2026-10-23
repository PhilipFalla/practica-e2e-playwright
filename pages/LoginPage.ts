import type { Locator, Page } from '@playwright/test';

/** Página de ingreso (index.html). */
export class LoginPage {
  /** "/", "/index", "/index.html" y las mismas con query string, por ejemplo "/?sesion". */
  static readonly ruta = /\/(index(\.html)?)?(\?.*)?$/;

  readonly campoUsuario: Locator;
  readonly campoClave: Locator;
  readonly botonIngresar: Locator;
  readonly mensajeError: Locator;

  constructor(readonly page: Page) {
    this.campoUsuario = page.getByLabel('Usuario');
    this.campoClave = page.getByLabel('Contraseña');
    this.botonIngresar = page.getByTestId('ingresar');
    this.mensajeError = page.getByTestId('error');
  }

  async goto() {
    await this.page.goto('/');
  }

  async ingresar(usuario: string, clave: string) {
    await this.campoUsuario.fill(usuario);
    await this.campoClave.fill(clave);
    await this.botonIngresar.click();
  }
}
