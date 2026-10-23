import { test as base } from '@playwright/test';
import { CarritoPage } from '../pages/CarritoPage';
import { CatalogoPage } from '../pages/CatalogoPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { ConfirmacionPage } from '../pages/ConfirmacionPage';
import { LoginPage } from '../pages/LoginPage';
import { ResumenPage } from '../pages/ResumenPage';
import { Flujos, type Paginas } from './flujos';

/** `test` con un page object por página de la tienda y los flujos de precondición. */
export const test = base.extend<Paginas & { flujos: Flujos }>({
  ingreso: async ({ page }, use) => use(new LoginPage(page)),
  catalogo: async ({ page }, use) => use(new CatalogoPage(page)),
  carrito: async ({ page }, use) => use(new CarritoPage(page)),
  checkout: async ({ page }, use) => use(new CheckoutPage(page)),
  resumen: async ({ page }, use) => use(new ResumenPage(page)),
  confirmacion: async ({ page }, use) => use(new ConfirmacionPage(page)),
  flujos: async ({ ingreso, catalogo, carrito, checkout, resumen, confirmacion }, use) =>
    use(new Flujos({ ingreso, catalogo, carrito, checkout, resumen, confirmacion })),
});

export { expect } from '@playwright/test';
