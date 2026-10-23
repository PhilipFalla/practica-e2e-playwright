import { expect } from '@playwright/test';
import { CarritoPage } from '../pages/CarritoPage';
import { CatalogoPage } from '../pages/CatalogoPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { ConfirmacionPage } from '../pages/ConfirmacionPage';
import { LoginPage } from '../pages/LoginPage';
import { ResumenPage } from '../pages/ResumenPage';
import { CLAVE, PRODUCTOS, type ClaveProducto, type DatosEnvio, type Pedido, type Usuario } from './datos';

export interface Paginas {
  ingreso: LoginPage;
  catalogo: CatalogoPage;
  carrito: CarritoPage;
  checkout: CheckoutPage;
  resumen: ResumenPage;
  confirmacion: ConfirmacionPage;
}

/**
 * Pasos que muchas pruebas usan como precondición. Solo combinan page objects:
 * no tienen localizadores propios.
 */
export class Flujos {
  constructor(private readonly p: Paginas) {}

  async iniciarSesion(usuario: Usuario) {
    await this.p.ingreso.goto();
    await this.p.ingreso.ingresar(usuario, CLAVE);
    await expect(this.p.ingreso.page, `Precondición: "${usuario}" entra al catálogo`).toHaveURL(CatalogoPage.ruta);
  }

  /** Agrega cada producto desde el catálogo y ajusta las cantidades en el carrito. Termina en el carrito. */
  async llenarCarrito(pedido: Pedido) {
    const lineas = Object.entries(pedido) as [ClaveProducto, number][];
    for (const [clave] of lineas) await this.p.catalogo.agregar(PRODUCTOS[clave].nombre);
    await this.p.carrito.goto();
    for (const [clave, cantidad] of lineas) {
      if (cantidad !== 1) await this.p.carrito.cambiarCantidad(PRODUCTOS[clave].nombre, cantidad);
    }
  }

  async irAlCheckout(usuario: Usuario, pedido: Pedido) {
    await this.iniciarSesion(usuario);
    await this.llenarCarrito(pedido);
    await this.p.carrito.continuar();
    await expect(this.p.carrito.page, 'Precondición: el carrito pasa a los datos de envío').toHaveURL(CheckoutPage.ruta);
  }

  async irAlResumen(usuario: Usuario, pedido: Pedido, datos: DatosEnvio) {
    await this.irAlCheckout(usuario, pedido);
    await this.p.checkout.enviar(datos);
    await expect(this.p.checkout.page, 'Precondición: los datos de envío pasan al resumen').toHaveURL(ResumenPage.ruta);
  }
}
