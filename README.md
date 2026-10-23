<h1 align="center">Práctica de pruebas end-to-end con Playwright</h1>

<p align="center">
  Café de Altura es una tienda en línea pequeña, hecha para practicar pruebas end-to-end.<br>
  La suite se escribe con un agente de IA, en TypeScript y con Playwright.<br>
  Calidad y Automatización en Ingeniería de Software, UFM 2026.
</p>

<p align="center">
  <a href="#cómo-abrir-la-tienda">Cómo abrir la tienda</a> |
  <a href="#reglas-de-la-tienda">Reglas de la tienda</a> |
  <a href="#ejercicio">Ejercicio</a> |
  <a href="#resultado-esperado">Resultado esperado</a> |
  <a href="REQUISITOS.md">Requisitos</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Playwright-TypeScript-2EAD33" alt="Playwright con TypeScript">
  <img src="https://img.shields.io/badge/patr%C3%B3n-Page%20Object%20Model-2E5D4B" alt="Page Object Model">
  <img src="https://img.shields.io/badge/dise%C3%B1o-ISTQB-2E5D4B" alt="Técnicas de ISTQB">
  <img src="https://img.shields.io/badge/agentes-Claude%20Code%20%7C%20Codex-545A4E" alt="Claude Code o Codex">
</p>

## Qué hay en el repositorio

| Ruta | Qué es |
|---|---|
| `tienda/` | La tienda: páginas HTML, un `app.js` y un `estilos.css`. No necesita compilarse ni instalar dependencias. |
| `REQUISITOS.md` | Los programas que hay que instalar y cómo conectar el MCP de Playwright a Claude Code o a Codex. |
| `.github/workflows/pages.yml` | Publica la tienda en GitHub Pages en cada push a `main`. |

El repositorio no trae pruebas, porque la suite es el ejercicio.

## Cómo abrir la tienda

La tienda está publicada en https://danihrndzld.github.io/practica-e2e-playwright/, así que se puede abrir en el navegador sin instalar nada. Para correrla en la máquina propia, se usa este comando desde la raíz del repositorio, y la tienda queda en http://localhost:4173:

```bash
npx serve tienda -l 4173
```

`serve` quita la extensión `.html` de las URLs, así que `carrito.html` se abre como http://localhost:4173/carrito y la página de ingreso como http://localhost:4173/.

Todos los usuarios usan la contraseña `calidad2026`.

| Usuario | Comportamiento |
|---|---|
| `estandar` | Usuario normal. |
| `bloqueado` | No puede entrar. |
| `problema` | Entra, pero el catálogo y el pago tienen fallas visibles. |
| `lento` | Entra después de unos segundos. |

## Reglas de la tienda

Las reglas de esta sección son la especificación. Una prueba compara lo que hace la tienda contra estas reglas, y no contra lo que la tienda muestra hoy.

| Producto | Precio |
|---|---|
| Café de Huehuetenango 250 g | Q75 |
| Café de Antigua 500 g | Q140 |
| Taza de barro | Q60 |
| Prensa francesa | Q225 |
| Molino manual | Q350 |
| Filtros de papel (100) | Q25 |

| Concepto | Regla |
|---|---|
| Ingreso | El usuario y la contraseña son obligatorios. Si falta uno, si no coinciden o si el usuario está bloqueado, la tienda muestra un mensaje de error y no deja entrar. |
| Sesión | Sin sesión iniciada, cualquier página lleva al ingreso. Cerrar sesión vacía el carrito. |
| Catálogo | Se ordena por nombre (A a Z y Z a A) o por precio (de menor a mayor y de mayor a menor). Al entrar, el orden es por nombre de A a Z. |
| Carrito | Cada producto se agrega una vez desde el catálogo, y la cantidad se cambia en el carrito. El contador del encabezado muestra el total de unidades. |
| Cantidad | Un número entero de 1 a 5 por producto. Con un número fuera de ese rango, negativo o con decimales, la tienda muestra un error y no deja continuar al pago. |
| Datos de envío | Nombre, apellido y código postal son obligatorios. El código postal tiene exactamente 5 dígitos. |
| Cupón | Es opcional. El único cupón válido es `ENVIOGRATIS`, en mayúsculas o en minúsculas. Los espacios al inicio y al final no cuentan. Cualquier otro texto, incluido `ENVIOGRATIS` con letras de más, da el error "El cupón no existe." |
| Descuento | Subtotal menor de Q200, sin descuento. De Q200 a Q499, 5 %. De Q500 en adelante, 10 %. |
| Envío | Q25 si el código postal empieza con `01` (Ciudad de Guatemala), y Q40 en cualquier otro caso. |
| Envío gratis | El envío cuesta Q0 si el subtotal con descuento es de Q300 o más, o si se usa el cupón `ENVIOGRATIS`. El cupón vale para cualquier código postal. |
| Total | Subtotal, menos el descuento, más el envío. |
| Confirmación | Confirmar la compra muestra un número de pedido de 6 dígitos y deja el carrito vacío. |

La tienda tiene defectos sembrados a propósito. Con el usuario `estandar` hay defectos que solo aparecen cuando las pruebas cubren bien las reglas de la tabla, y el usuario `problema` tiene otros más fáciles de ver.

## Ejercicio

El ejercicio consiste en construir, con un agente de IA, una suite end-to-end de Playwright en TypeScript que pruebe la tienda contra sus reglas. Se permite y se espera que el agente escriba el código. El trabajo del estudiante es decidir qué se prueba, pedirlo bien y revisar lo que el agente entrega.

1. Hacer fork del repositorio y clonarlo.
2. Instalar lo que pide [REQUISITOS.md](REQUISITOS.md), incluido el MCP de Playwright.
3. Pedirle al agente, en Claude Code o en Codex, la suite. El pedido tiene que exigir lo siguiente:
   - Que use Page Object Model, con una clase por página de la tienda, y que las pruebas no escriban localizadores por su cuenta.
   - Que diseñe los casos con técnicas de diseño de pruebas de ISTQB, por ejemplo particiones de equivalencia, análisis de valores límite, tablas de decisión o transición de estados.
   - Que cada prueba diga, en su nombre o en un comentario, qué regla prueba y con qué técnica.
4. Qué técnica se aplica a qué regla, cuántas pruebas hay y cómo se organizan queda a criterio de cada estudiante.
5. Revisar lo que el agente escribe, correr la suite y repetir el ciclo hasta que la suite cubra las reglas.

Una prueba que encuentra un defecto se queda en rojo. La tienda no se modifica para que la suite pase.

## Resultado esperado

- La suite corre con un solo comando y deja el reporte HTML de Playwright.
- Cada prueba en rojo corresponde a un defecto de la tienda, y su mensaje dice qué regla se rompió.
- Un archivo `DEFECTOS.md` en la raíz tiene una línea por defecto encontrado, con la regla, los pasos, el resultado esperado y el resultado obtenido.

Algunas ideas para experimentar después:

- Correr la suite en Chromium, Firefox y WebKit.
- Probar el usuario `lento` sin esperas fijas.
- Comparar los page objects que escribe el agente con el MCP de Playwright conectado y sin él.

## Suite de pruebas

```bash
npm install
npx playwright install    # Chromium, Firefox y WebKit
npm test                  # levanta la tienda en :4173 y corre la suite en los tres navegadores
npm run reporte           # abre el reporte HTML de Playwright
```

`npm run test:chromium` corre solo Chromium. `npm run typecheck` revisa los tipos.

| Ruta | Qué es |
|---|---|
| `pages/` | Page objects: uno por página de la tienda y `Encabezado` para el encabezado común. Son los únicos archivos con localizadores. |
| `support/datos.ts` | Precios, usuarios y cupón tomados de las reglas. Son el oráculo de las pruebas. |
| `support/flujos.ts` | Pasos de precondición (ingresar, llenar el carrito, llegar al resumen) armados con page objects. |
| `tests/` | Un archivo por regla. Cada prueba se llama `Regla · Técnica · caso` y cada aserción dice qué regla revisa. |
| `DEFECTOS.md` | Defectos encontrados, uno por fila. |

| Regla | Técnica | Archivo |
|---|---|---|
| Ingreso | Tabla de decisión, partición de equivalencia (usuario `lento`) | `ingreso.spec.ts` |
| Sesión | Transición de estados | `sesion.spec.ts` |
| Catálogo y precios | Particiones de equivalencia | `catalogo.spec.ts` |
| Carrito | Particiones de equivalencia, transición de estados | `carrito.spec.ts` |
| Cantidad | Valores límite, particiones de equivalencia | `cantidad.spec.ts` |
| Datos de envío | Tabla de decisión, valores límite, particiones de equivalencia | `datos-envio.spec.ts` |
| Cupón | Particiones de equivalencia | `cupon.spec.ts` |
| Descuento y Total | Valores límite | `descuento.spec.ts` |
| Envío, Envío gratis y Total | Particiones de equivalencia, valores límite, tabla de decisión | `envio.spec.ts` |
| Confirmación | Transición de estados | `confirmacion.spec.ts` |
