# Defensa oral — TP Interfaces de Usuario

Guía de estudio armada **solo a partir del código real** del proyecto (`tp2-interfaces/`).
Las referencias tienen la forma `archivo:línea` o `archivo → selector / función`.

> ⚠️ Antes de leer: hay **requisitos del enunciado que no están implementados** (animación de registro correcto, captcha funcional y el juego jugable). Están detallados en la [sección 6](#6-cosas-para-tener-presentes). Conviene leerla primero.

---

## 1. Visión general

### Qué es el sitio
- Una plataforma de videojuegos: catálogo en el Home, login y registro, y una página de detalle del juego *Peg Football* (adaptación del Peg Solitaire).
- Sin backend: el login y el registro se simulan en el front y redirigen al Home (`js/main.js` → constante `PAGINA_INICIO`).

### Páginas
| Página | HTML | CSS propio | Responsive |
|---|---|---|---|
| Home | `index.html` | `css/home.css` | Mobile First (mobile, tablet y desktop) |
| Registro | `registro.html` | `css/registro.css` | Solo desktop |
| Login | `login.html` | `css/login.css` | Solo desktop |
| Juego | `juego.html` | `css/juego.css` | Solo desktop (frame de 1440px: `css/juego.css` → `.contenido-juego { max-width: 90rem }`) |

### Estructura de carpetas
```
tp2-interfaces/
├── index.html, registro.html, login.html, juego.html
├── css/
│   ├── variables.css   → todas las variables de :root (colores, fuentes, tamaños, espaciados, duraciones)
│   ├── header.css      → componente encabezado + buscador (Mobile First)
│   ├── footer.css      → componente pie de página (Mobile First)
│   ├── home.css        → pantalla de carga, carrusel principal, carruseles secundarios, cards, menús
│   ├── registro.css    → formulario, campos, errores, captcha, botones
│   ├── login.css       → tarjeta de login (incluye su propio footer)
│   └── juego.css       → página del juego (incluye su propio header, footer y menús)
├── js/main.js          → único archivo JS de todo el sitio
└── assets/img, assets/icons
```

### Rol de cada archivo compartido
- **`variables.css`**: fuente única de valores. Los valores de mobile están en `:root` (`css/variables.css:10`) y se **redefinen** en `@media (min-width: 48rem)` (`:370`) y `@media (min-width: 75rem)` (`:436`). Así los componentes no necesitan repetir media queries: cambian solos cuando cambia la variable.
- **`header.css`**: grid de dos filas en mobile (`.encabezado-principal`, `css/header.css:5`) y una sola fila desde tablet (`:84`).
- **`footer.css`**: 2 columnas en mobile (`.pie-pagina__columnas`, `:30`), 4 en tablet (`:112`) y fila flex en desktop (`:119`).
- **`main.js`**: cada funcionalidad tiene su `iniciar…()` que **sale enseguida si su elemento no existe** (ej. `iniciarRegistro` → `if (!formulario) return;`). Por eso el mismo archivo sirve para todas las páginas. Se invocan todas al final (`js/main.js:428-435`).

### Por qué un CSS por página + compartidos
- Cada página carga solo lo que usa: menos reglas sin usar.
- Se evitan choques de nombres: `.tarjeta-juego` existe en `home.css` y en `juego.css` con estructuras distintas y no se pisan.
- Dos personas pueden trabajar en paralelo sin conflictos.
- Lo común (variables, header, footer) vive en un solo lugar para no duplicar.
- Orden de enlace en el `<head>`: `variables.css` → componentes → CSS de la página (`index.html:10-13`). La cascada hace que la página pueda sobrescribir al componente.

> ⚠️ En la práctica solo `index.html` usa `header.css` y `footer.css`. `login.html` no enlaza `footer.css` (repite el footer en `login.css`) y `juego.html` no enlaza ninguno de los dos (los repite en `juego.css`). Ver sección 6.

---

## 2. Cumplimiento del enunciado, punto por punto

### 2.1 Interacción con las páginas y camino al juego
- **Qué se hizo**: el Home tiene carruseles navegables y **cada diapositiva del carrusel principal es un enlace a `juego.html`**. Login y registro redirigen al Home.
- **Dónde**:
  - `index.html:152` → `<a class="carrusel__enlace" href="juego.html">` (envuelve imagen, nombre y precio).
  - `css/home.css:154` → `.carrusel__enlace { display: block; height: 100% }`: toda la diapositiva es clickeable.
  - Registro → Home: `js/main.js` → `manejarEnvioRegistro` (`window.location.href = PAGINA_INICIO`).
  - Juego → Home: `juego.html:142` (enlace "Volver") y logo del header (`juego.html:23`).
  - Registro ↔ Login: `registro.html:94` y `login.html:56`.
- **Cómo se demuestra**: Registro → completar → Home → esperar la carga → clic en la imagen del carrusel → página del juego → "Volver".
- ⚠️ Las cards de los carruseles secundarios **no** son enlaces (solo hover). La página del juego muestra una imagen del tablero, **no un juego jugable** (`juego.html:154`).

### 2.2 Animaciones en el registro correcto
- **No está implementado.** Cuando el formulario es válido, `manejarEnvioRegistro` (`js/main.js:90-92`) redirige al instante, sin animación. No hay `@keyframes` ni clases de éxito en `registro.css`.
- Lo que sí hay es **feedback de error**: borde rojo (`.campo__input--error`, `css/registro.css:108`) y un cartel por campo (`.campo__error--visible`, `:127`).

### 2.3 Animaciones hover en botones (al menos 3 distintas)
Hay **cuatro efectos distintos en botones** (ninguno es el menú hamburguesa):

| # | Botón | Selector | Qué hace | Propiedades |
|---|---|---|---|---|
| 1 | "Crear Cuenta" (registro) | `.btn--primario::before` (`css/registro.css:255-269`) | Un relleno más oscuro "barre" el botón de izquierda a derecha | `transform: scaleX(0) → scaleX(1)`, `transform-origin: left`, `transition: transform var(--duracion-hover) ease-out` (y `ease-in` al entrar) |
| 2 | Facebook / Google (registro) | `.redes__btn:hover` (`css/registro.css:312-317`) | Sube, se agranda y brilla | `transform: translateY(-0.25rem) scale(1.1)` + `box-shadow` violeta; `transition: transform, box-shadow` |
| 3 | Ojo de contraseña (registro) | `.campo__ojo::before` (`css/registro.css:163-177`) | Aparece un círculo gris desde el centro (efecto "ripple") | `transform: scale(0) → scale(1)` en un pseudo-elemento |
| 4 | Flechas del carrusel principal (Home) | `.carrusel__flecha:hover` (`css/home.css:276-294`) | El círculo se agranda, se oscurece y el chevron se corre hacia la dirección de la flecha | `transform: scale(1.1)` + `background-color`; chevron `translateX(...) rotate(45deg)` |

Detalles para explicar:
- Los valores salen de variables: `--duracion-hover: 0.3s`, `--escala-hover: 1.1`, `--desplazamiento-hover: -0.25rem` (`css/variables.css:160-164`).
- **`ease-out` en reposo y `ease-in` en hover**: cada estado define su propio `transition-timing-function`.
- Chevron: `translateX` va **antes** del `rotate` (comentario en `css/home.css:266`), porque los transforms se aplican en orden y si rotás primero el corrimiento sale en diagonal.
- En el Home el hover está dentro de `@media (hover: hover)` (`css/home.css:275`) para que en pantallas táctiles no quede "pegado".
- Cada hover tiene su equivalente con `:focus-visible`, así se ve también con teclado.
- Extras (más simples, solo color): `.formulario-login__boton-submit:hover` (`css/login.css:162`), `.comentario__boton-responder:hover` (`css/juego.css:504`). La card `.tarjeta-juego:hover` (`css/home.css:595`) cambia borde y resplandor, pero es una card, no un botón.

**Demostración**: en `registro.html`, pasar el mouse por "Crear Cuenta", por los íconos de redes y por el ojo. En el Home, por las flechas del carrusel.

### 2.4 Pantalla de carga de 5 segundos (Home)
- **Qué se hizo**: un overlay que tapa el Home con un **spinner CSS**, una **barra de progreso** y un **porcentaje numérico**. Dura 5 s y luego se desvanece.
- **Dónde**:
  - HTML: `index.html:16-24` (`<body class="sin-scroll">` + `section.pantalla-carga`).
  - Spinner: `.pantalla-carga__spinner` + `@keyframes girar` (`css/home.css:35-51`). Es un círculo con `border-radius: 50%` y solo el borde superior de color, rotando `0% → 100%` (0° → 360°).
  - Barra: `.pantalla-carga__progreso` + `@keyframes cargar-barra` (`css/home.css:67-83`): `transform: scaleX(0) → scaleX(1)` con `transform-origin: left`, `linear`, `forwards`, duración `--duracion-carga: 5s` (`css/variables.css:162`).
  - Porcentaje: `js/main.js` → `calcularPorcentaje(inicio)`:
    `Math.min(100, Math.floor((performance.now() - inicio) / 5000 * 100))`.
  - Ocultar: `ocultarPantallaCarga` agrega `.pantalla-carga--oculta` (`opacity: 0; visibility: hidden`, `css/home.css:26`) y saca `sin-scroll` del body.
- **Cómo se mueve la barra**: la anima **CSS**, no JS. JS solo **lee el tiempo** para mostrar el número, así barra y número no se desincronizan:
  - `animationstart` → guarda `inicio` y arranca `requestAnimationFrame(avanzar)`.
  - `animationend` → cancela el frame, fuerza 100 % y oculta.
  - `transitionend` de `opacity` → `pantalla.hidden = true` (la saca del árbol de accesibilidad).
- **Por qué no es un GIF**: todo son elementos HTML animados con `@keyframes` y `transform`. El porcentaje es texto real que JS actualiza con `textContent`.
- **Demostración**: recargar `index.html` (F5). Se ve el spinner girando, la barra llenándose y el número de 0 % a 100 %. No se puede hacer scroll mientras tanto.

### 2.5 Carruseles con animación de transición

#### Carrusel principal ("Nuevos Lanzamientos")
- **Qué se hizo**: 4 diapositivas superpuestas (`position: absolute; inset: 0`). Al cambiar, la saliente se aleja y achica mientras la entrante entra con un pequeño "rebote".
- **Dónde**: `@keyframes` en `css/home.css:328-387`. JS: `iniciarCarrusel` y helpers (`js/main.js:203-296`).
- **Keyframes por porcentajes**:
  - `salir-izquierda` (`:328`): `0%` → `translateX(0) scale(1)`, opacidad 1 · `100%` → `translateX(-30%) scale(0.8)`, opacidad 0.
  - `entrar-derecha` (`:339`): `0%` → `translateX(100%) scale(0.8)`, opacidad 0 · **`70%` → `translateX(-3%) scale(1)`** (se pasa un poco) · `100%` → `translateX(0)`.
  - `salir-derecha` / `entrar-izquierda`: lo mismo espejado, para ir hacia atrás.
  - `aparecer-info` (`:378`): la barra con nombre y precio sube desde abajo (`translateY(100%) → 0`) con **0.4 s de retraso** (`--retraso-info-carrusel`), después de que entra la imagen.
- **Por qué es más que un desplazamiento**: combina **traslación + escala + opacidad**, tiene un **sobrepaso al 70 %** (efecto de inercia), una **curva propia** (`--curva-carrusel: cubic-bezier(0.25, 0.8, 0.25, 1)`, `css/variables.css:233`) y una **segunda animación escalonada** para la información.
- Indicadores: el activo se rellena y se estira (`.carrusel__indicador--activo { transform: scaleX(1.3) }`, `css/home.css:323`) con `transition`.
- **Demostración**: clic en las flechas (hacia un lado y hacia el otro) y en los indicadores. Hacer clic muchas veces rápido: no se rompe.

#### Carruseles secundarios (Tendencias, Para ti, Gratuitos, Pagos)
- **Qué se hizo (desktop)**: se ven 5 de 6 cards. La flecha corre la fila una card con un **rebote** y, mientras tanto, **las cards se inclinan** en la dirección del movimiento.
- **Dónde**: `css/home.css:500-573` (solo dentro de `@media (min-width: 75rem)`). JS: `iniciarCarruselSecundario` (`js/main.js:313-343`).
  - Desplazamiento: `transition: transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)` en `.carrusel-secundario__fila` (`:521`). El `1.56` hace que la curva **pase de largo y vuelva** (overshoot).
  - Estado final: `.carrusel-secundario__fila--final { transform: translateX(-(ancho-card + separación)) }` (`:524`).
  - Inclinación: `@keyframes inclinar-adelante` / `inclinar-atras` (`:550-572`): `0%` `skewX(0)` → **`40%` `skewX(∓8deg)`** → `100%` `skewX(0)`.
- **Por qué es más que un desplazamiento**: la fila se traslada con rebote y **cada card se deforma** (`skew`) como si tuviera inercia. Son dos animaciones distintas que se combinan (una `transition` en el padre y un `@keyframes` en los hijos).
- **Mobile y tablet**: no hay flechas. Es **scroll horizontal nativo con snap** (`scroll-snap-type: x mandatory`, `css/home.css:443-468`).
- **Demostración**: en desktop (≥1200px) hacer clic en la flecha derecha de "Tendencias" y después en la izquierda. En mobile (DevTools), deslizar las cards.

### 2.6 Datos reales
- **Más de un juego, con imágenes distintas**: 4 en el carrusel principal y 24 en los secundarios (`index.html:150-563`), más 5 recomendados en `juego.html:302-370`. Cada uno con su portada.
- **Títulos reales de distinta longitud**: de "F1 25" o "FIFA 14" a "Counter-Strike: Global Offensive" o "Call of Duty 4: Modern Warfare".
- **Corte con "..."** (`text-overflow: ellipsis`):
  - Cards: `.tarjeta-juego__titulo` (`css/home.css:618-626`) → `white-space: nowrap; overflow: hidden; text-overflow: ellipsis`.
  - Carrusel principal: `.carrusel__nombre` (`css/home.css:192-200`), con `min-width: 0` para que el ítem flex pueda achicarse (si no, el flex no deja que el texto se recorte).
  - Juego: `.tarjeta-juego__nombre` y `__genero` (`css/juego.css:577, 589`).
- **Variedad de colores**: GTA 6 (rosa y naranja), Dota 2 (rojo), RDR2 (sepia), Marvel Rivals, Uncharted, Counter-Strike, NBA, F1, etc.
- **Demostración**: en mobile, la card de "Counter-Strike: Global Offensive" muestra "COUNTER-STRIKE: GLO…".
- ⚠️ Puntos débiles: ver sección 6 (muchos FIFA/PES parecidos, textos genéricos en `juego.html` y `alt` repetidos).

### 2.7 Mobile First en el Home
- **Base = mobile**, sin media query. Después solo `min-width`:
  - **Tablet**: `@media (min-width: 48rem)` = 768px.
  - **Desktop**: `@media (min-width: 75rem)` = 1200px.
  - Documentado en `css/variables.css:1-8`.
- **Qué cambia en cada uno**:

| Elemento | Mobile (base) | Tablet (48rem) | Desktop (75rem) |
|---|---|---|---|
| Header | 2 filas: íconos arriba y buscador abajo (`grid-template-areas`, `css/header.css:10`) | Una fila flex (`css/header.css:84`) | Igual, con medidas del diseño |
| Área táctil header | 44×44 (`--area-tactil-encabezado: 2.75rem`, `css/variables.css:339`) | 44×44 | 0 (mide lo que el ícono) |
| Carrusel principal | Proporción 16/9 | 21/9 | 1440/528.39 (Figma) (`--proporcion-carrusel`) |
| Cards secundarias | ~2,4 cards visibles, scroll con snap | ~3,5 cards visibles, scroll | 5 visibles, flechas y animación |
| Footer | 2 columnas | 4 columnas | Fila con bloque central (`css/footer.css`) |

- **Cards grandes (carrusel principal)**: la imagen usa `aspect-ratio` + `object-fit: cover` (`.carrusel__imagen`, `css/home.css:167`): ocupa todo el ancho y recorta sin deformarse. Los textos usan `clamp()` para escalar con la pantalla (`--tamano-nombre-carrusel`, `css/variables.css`).
- **Cards secundarias**: el ancho se calcula para que **siempre se vea una card cortada**, lo que indica que se puede deslizar:
  - Mobile: `--ancho-card: clamp(6.5rem, (100vw - 5rem) / 2.4, 12rem)` (`css/variables.css:261`) → 2 cards y el 40 % de la tercera.
  - Tablet: `(100vw - 8.25rem) / 3.5` (`:409`).
  - Desktop: ancho fijo del diseño y ventana de 5 cards (`--ancho-ventana-secundaria`, `:273`).
- Los transforms del carrusel secundario viven **solo** en desktop (comentario en `css/home.css:498-499`), así en mobile la fila nunca queda corrida.
- **Demostración**: DevTools → modo responsive → 375px, 800px y 1440px.

### 2.8 Sin frameworks ni librerías
- No hay `package.json` ni `node_modules`, y no se importa ningún script externo.
- Los HTML solo cargan `css/*.css`, `js/main.js` y **Google Fonts** (fuente tipográfica, no es un framework).
- `main.js` es JavaScript vanilla: `querySelector`, `addEventListener`, `classList`, `requestAnimationFrame`, Constraint Validation API.

---

## 3. Decisiones de diseño y buenas prácticas

### HTML semántico
- `header`, `main`, `footer`, `nav`, `aside` en `index.html` y `juego.html` (`index.html:27, 55, 145, 575`).
- **`ul` / `li`** para el carrusel (`.carrusel__diapositivas`, `index.html:149`) y las filas de cards: son **listas de juegos**.
- **`ol`** para los indicadores (`index.html:204`): tienen orden.
- **`article`** para cada juego (`.carrusel__juego`, `.tarjeta-juego`): es contenido que tiene sentido por sí solo.
- `section` + `h2` para cada carrusel, y `aria-labelledby` apuntando a ese título (`index.html:214`).
- `<a>` para navegar (diapositiva → juego) y `<button type="button">` para acciones (flechas, ojo, carrito).
- Formulario con `label for`, `type="email"`, `type="password"`, `type="number"`, `required`, `minlength`, `pattern` y `autocomplete` (`registro.html:20-65`).
- **Por qué**: lectores de pantalla, navegación por teclado y SEO entienden la estructura sin depender del CSS.
- ⚠️ No se usa `figure` en ningún lado.

### CSS
- **Variables** (`css/variables.css`): un solo lugar para cambiar colores y medidas. Además, el responsive se hace **cambiando variables** en las media queries, no redefiniendo selectores.
- **Herencia y cascada**: `font-family` y `color` se definen en `body` (`css/home.css:1-6`) y los heredan todos. `.carrusel__enlace { color: inherit }` (`:157`). El orden de enlace (variables → componente → página) aprovecha la cascada.
- **BEM**: bloque `carrusel`, elementos `carrusel__flecha` y `carrusel__indicador`, modificadores `carrusel__diapositiva--activa` y `btn--primario`. Ventaja: especificidad baja y pareja (una clase), sin IDs para estilos ni `!important` (no hay ninguno en el proyecto).
- **Reutilización**: `.carrusel__chevron` se reutiliza en las flechas secundarias con el modificador `--chico` (`index.html:222`, `css/home.css:493`). `.tarjeta-juego` se repite en los 4 carruseles secundarios. `iniciarCarruselSecundario` se aplica a los 4 con `forEach`.
- **Mobile First**: el CSS base es el más simple (mobile) y se agregan capas hacia arriba. El celular no descarga reglas que no usa y obliga a priorizar el contenido.
- **`rem`** para casi todo, también en los breakpoints (`48rem`, `75rem`): respeta el tamaño de fuente que el usuario configura en el navegador.

### JavaScript
- **Un solo archivo** (`js/main.js`) con guardas `if (!elemento) return;`: un solo pedido HTTP y un solo lugar donde buscar.
- **Una función por funcionalidad** y helpers cortos con nombre claro: `calcularPorcentaje`, `calcularIndiceCircular`, `aplicarClasesTransicion`, `actualizarIndicadores`…
- **Delegación de eventos**:
  - Ojos: un solo `click` en `document` con `closest('.campo__ojo, …')` (`iniciarOjos`, `js/main.js:28`).
  - Carrusel principal: un solo listener en el `section` para flechas e indicadores (`js/main.js:273`), distinguidos por `data-js`.
  - Carruseles secundarios: un listener por carrusel (`js/main.js:319`).
  - **Por qué**: menos listeners y funciona aunque se agreguen elementos.
- **`data-js` para JS y clases para CSS** (`data-js="carrusel"`): si alguien renombra una clase de estilo, el JS no se rompe.
- **`classList`** para todo cambio visual (`add`, `remove`, `toggle`). JS **no escribe estilos**: solo cambia estados y el CSS decide cómo se ven.
- **`animationend` / `transitionend` en vez de `setTimeout`** (no hay ningún `setTimeout` en el archivo):
  - El fin real de la animación lo informa el navegador. Si se cambia la duración en `variables.css`, el JS sigue funcionando sin tocarlo.
  - Con `setTimeout` habría que duplicar la duración en dos lugares y se desincronizaría.
- `const` / `let`, `===` siempre, `textContent` (nunca `innerHTML`), sin `alert()`.

### Separación de lenguajes
- Cada lenguaje en su archivo: el HTML describe, el CSS presenta y el JS se comporta. Así es más fácil de mantener, se puede cachear y se puede trabajar en paralelo.
- El `<script defer>` en el `<head>` (`index.html:14`) baja el JS en paralelo y lo ejecuta cuando el DOM está listo.
- ⚠️ Hay **dos estilos inline**: `index.html:78` y `juego.html:69` (`style="transform: rotate(180deg);"` en el ícono "Nuevos"). Conviene saberlo.

### Accesibilidad
- **Errores de formulario**: `aria-describedby` vincula el input con su cartel, el cartel tiene `aria-live="polite"` (se anuncia solo) y se agrega `aria-invalid="true"` (`mostrarError`, `js/main.js:50`).
- **Ojo**: `aria-pressed` y `aria-label` cambian entre "Mostrar" y "Ocultar" (`alternarVisibilidad`).
- **Carrusel**: `aria-roledescription="carrusel"` / `"diapositiva"`, `aria-label="1 de 4"`, `aria-current` en el indicador activo y las diapositivas ocultas con **`inert` + `aria-hidden`** para que el Tab no entre en ellas (`actualizarAccesibilidadDiapositivas`).
- **Carga**: `role="status"` y `role="progressbar"` con `aria-valuenow` actualizado en cada frame.
- **Foco visible**: `:focus-visible` con outline cian (`--color-foco`) en botones, enlaces e indicadores. En el carrusel, `outline-offset` negativo porque el visor recorta (`css/home.css:161-165`).
- **Carrusel secundario**: cuando la flecha clickeada se oculta, el foco pasa a la otra (`actualizarFlechasSecundarias`), así no se pierde.
- **`alt`**: descriptivo en las portadas (`"Portada de Uncharted 4: A Thief's End, con Nathan Drake de espaldas"`) y `alt=""` en los íconos decorativos dentro de botones con `aria-label`.
- **Táctil**: área mínima de 44×44 en el header en mobile (`css/header.css:41`).
- `overflow-x: clip` en desktop (`css/home.css:507-514`) evita que el foco en una card oculta desplace la ventana.

### Patrones de interfaz y su justificación
| Patrón | Dónde | Justificación de usabilidad |
|---|---|---|
| Carrusel con flechas e indicadores | Carrusel principal | Muestra mucho en poco espacio. Los indicadores dan **visibilidad del estado** ("estoy en el 2 de 4"). |
| Scroll horizontal con card cortada | Secundarios en mobile | La card a medias es una **pista visual** de que hay más. Gesto natural en táctil. |
| Indicador de progreso con porcentaje | Pantalla de carga | **Visibilidad del estado del sistema** (Nielsen #1): el usuario sabe cuánto falta. |
| Feedback visual en hover/foco | Botones y cards | Confirma qué es interactivo (**affordance**) y qué está seleccionado. |
| Validación con mensaje por campo | Registro | **Prevención y recuperación de errores**: dice qué falló y dónde. El foco va al primer error. |
| Corrección en vivo solo después del error | `corregirCampoRegistro` | No marca en rojo mientras el usuario escribe por primera vez, pero el error se va apenas lo corrige. |
| Mostrar/ocultar contraseña | Registro | Reduce errores de tipeo sin un campo de confirmación extra. |
| Menús laterales con overlay | Hamburguesa y perfil | Libera espacio. Clic afuera para cerrar (convención conocida). |

---

## 4. Recorrido por el código de las partes más complejas

### 4.1 Validación del registro (y captcha)
1. `iniciarRegistro()` busca `.formulario`. Si no existe, sale.
2. Guarda las referencias a `#contrasena` y `#repetir-contrasena`.
3. El formulario tiene `novalidate` (`registro.html:17`): se desactivan los globos nativos, pero **se sigue usando la API de validación** del navegador.
4. **Al enviar** (`manejarEnvioRegistro`):
   1. `preventDefault()`.
   2. `validarCoincidencia()`: si las contraseñas no coinciden, `setCustomValidity('…')`, que marca el campo como inválido.
   3. `formulario.checkValidity()`: si todo es válido, redirige a `index.html`.
   4. Si no, toma los `:invalid`, llama a `mostrarError` en cada uno y hace foco en el primero.
5. **`obtenerMensaje(validity)`** traduce el `ValidityState` a un texto: `valueMissing` → obligatorio, `typeMismatch` → email, `tooShort` / `patternMismatch` → contraseña (`minlength="5"` y `pattern=".*\d.*"`), `customError` → no coinciden.
6. **Mientras escribe** (`input` delegado en el form → `corregirCampoRegistro`):
   - Si toca alguna contraseña, recalcula la coincidencia.
   - Si cambia la contraseña y "repetir" ya estaba en error, la revalida.
   - Solo revalida campos **que ya estaban en error** (`actualizarError`).
7. El cartel se ubica **fuera del formulario, a la derecha** del input (`.campo__error`, `css/registro.css:113-125`, `left: calc(100% + …)`).

**Captcha**: es solo visual. `.captcha__caja` es un `<button type="button">` con un cuadrado vacío (`registro.html:67-72`, `css/registro.css:200-234`). **No tiene JS**: no se tilda, no cambia de estado y no se valida al enviar.

### 4.2 Pantalla de carga
1. El HTML ya viene con la pantalla visible y `body.sin-scroll` (`overflow: hidden`).
2. Apenas carga el CSS, arrancan dos animaciones: `girar` (infinita) y `cargar-barra` (5 s, `forwards`).
3. `iniciarPantallaCarga()` toma la pantalla, la barra, el progreso y el texto por `data-js`.
4. `animationstart` en la barra → `inicio = performance.now()` → `requestAnimationFrame(avanzar)`.
5. `avanzar()` en cada frame (~60 fps): `calcularPorcentaje(inicio)` → `actualizarProgreso()` escribe `"NN%"` y `aria-valuenow`, y se vuelve a programar.
6. `animationend` (a los 5 s) → `cancelAnimationFrame`, fuerza `100%` y llama a `ocultarPantallaCarga()`: agrega `.pantalla-carga--oculta` y saca `sin-scroll`.
7. La clase dispara la `transition` de `opacity` (0.5 s). Al terminar (`transitionend`, filtrando `propertyName === 'opacity'`) → `hidden = true` → `display: none` (`css/home.css:31`).
8. `scrollbar-gutter: stable` (`css/variables.css:511`) reserva el lugar de la barra de scroll, así la página no "salta" cuando se libera el scroll.

### 4.3 Carrusel principal
1. `iniciarCarrusel()` arma el array de diapositivas e indicadores y un `estado = { actual: 0, animando: false, saliente: null }`.
2. **Clic** (un solo listener en el `section`):
   - Si es un indicador → `destino = data-indice` y la dirección según si es mayor o menor que el actual.
   - Si es una flecha → `paso = ±1` desde `DIRECCIONES_CARRUSEL` → `calcularIndiceCircular(actual, paso, total)` = `(actual + paso + total) % total` (del 4 vuelve al 1 y del 1 va al 4).
3. `irA(destino, paso)`:
   - **Guarda**: si `animando` o si ya está en el destino, no hace nada.
   - `animando = true`.
   - `aplicarClasesTransicion`: saca `--activa` de la saliente y le pone `--saliendo-izquierda/derecha`. A la entrante le pone `--activa` + `--entrando-derecha/izquierda`.
   - Actualiza los indicadores (`aria-current`, clase activa) y la accesibilidad (`inert`, `aria-hidden`).
   - `estado.actual = destino`.
4. El CSS corre `salir-*` y `entrar-*` a la vez (0.8 s). La entrante va arriba (`z-index`). La info aparece con retraso.
5. **`animationend`** (delegado en el carrusel): solo cuenta si el `target` es la diapositiva entrante **y** la animación empieza con `"entrar"`. Así se ignoran `salir-*` y `aparecer-info`, que también burbujean.
6. `limpiarClasesTransicion` quita las 4 clases de transición y pone `animando = false`. La info se engancha a `--activa` y no a la clase de entrada (comentario en `css/home.css:187`), por eso no se corta al limpiar.

### 4.4 Carruseles secundarios
1. `iniciarCarruselesSecundarios()` → `forEach` sobre los `[data-js="carrusel-secundario"]`: **cada uno con su propio estado** `{ enFinal, animando }`.
2. **Clic** delegado en el carrusel → `paso` desde `DIRECCIONES_SECUNDARIAS`. Si está animando, sale.
3. `enFinal = paso > 0`. Si ya está en ese extremo, sale (solo hay dos posiciones: inicio y final).
4. `moverFilaSecundaria`: `toggle('…--final')` dispara la `transition` del `transform` (desplazamiento con rebote) y agrega `--moviendo-adelante/atras`, que dispara `inclinar-*` en cada card.
5. `actualizarFlechasSecundarias`: oculta la flecha que ya no sirve (`hidden`), muestra la otra y le pasa el foco.
6. **`transitionend`** en la fila: filtra `target === fila` y `propertyName === 'transform'` (los `box-shadow` del hover de las cards también burbujean) → saca las clases de movimiento → `animando = false`.
7. **`transitioncancel`** con el mismo manejador: si la ventana pasa a mobile en pleno movimiento, el `transform` desaparece (vive solo en la media query), la transición se cancela y nunca llega `transitionend`. Sin esto, el carrusel quedaría bloqueado (comentario en `js/main.js:341`).

---

## 5. Preguntas probables del profesor

1. **¿Qué es Mobile First y cómo lo aplicaron?**
   Diseñar primero para la pantalla más chica y agregar mejoras con `min-width`. La base mobile está en `:root` y en los selectores sin media query. Tablet en `48rem` y desktop en `75rem` (`css/variables.css:370, 436`).

2. **¿Por qué `rem` y no `px`?**
   `rem` es relativo al tamaño de fuente raíz que elige el usuario. Si agranda la letra del navegador, todo escala proporcionalmente, incluso los breakpoints.

3. **¿Cómo evitan que dos animaciones del carrusel se pisen?**
   Con la bandera `estado.animando`: `irA()` sale si es `true` y solo vuelve a `false` en `animationend` de la entrante (`js/main.js:263, 288-295`). Lo mismo en los secundarios con `transitionend` (`:322, 333-338`).

4. **¿Por qué `animationend` y no `setTimeout`?**
   La duración vive en CSS (`--duracion-carrusel`). Con `setTimeout` habría que repetirla en JS y podrían desincronizarse. El evento se dispara cuando la animación **realmente** termina.

5. **¿Qué pasa si se redimensiona la ventana?**
   El layout responde solo porque todo depende de variables redefinidas en media queries y de `clamp()` / `vw`. El carrusel secundario: si se achica a mobile en medio de un movimiento, `transitioncancel` libera el estado. Como el `transform` de `--final` está solo en desktop, en mobile la fila nunca queda corrida y al volver a desktop recupera su posición.

6. **¿Cómo se calcula el porcentaje de carga?**
   `(performance.now() - inicio) / 5000 * 100`, con `floor` y tope 100 (`calcularPorcentaje`). La barra la anima CSS. JS solo lee el tiempo con `requestAnimationFrame`.

7. **¿Por qué el carrusel principal no es "solo un desplazamiento"?**
   Combina `translateX` + `scale` + `opacity`, tiene un sobrepaso al 70 % y la información aparece después con su propia animación (`css/home.css:328-387`).

8. **¿Por qué eligieron esas animaciones?**
   El rebote y la escala dan **sensación física** y dirección: el usuario entiende hacia dónde fue. La inclinación de las cards refuerza el movimiento. El spinner y la barra son patrones conocidos de "cargando". Los hovers dan feedback inmediato de que el elemento es clickeable.

9. **¿Por qué los títulos se cortan con "..." en lugar de bajar de línea?**
   Para que todas las cards midan lo mismo y la grilla quede alineada. `nowrap` + `overflow: hidden` + `text-overflow: ellipsis` (`css/home.css:618-626`). El `alt` y el `h3` completo siguen disponibles para lectores de pantalla.

10. **¿Qué es BEM y por qué lo usan?**
    Bloque__elemento--modificador. Da nombres predecibles, evita colisiones y mantiene la especificidad en una sola clase, así no hacen falta IDs ni `!important`.

11. **¿Por qué `data-js` además de clases?**
    Separa ganchos de comportamiento y de estilo: se puede renombrar una clase CSS sin romper el JS.

12. **¿Por qué el hover está dentro de `@media (hover: hover)`?**
    En pantallas táctiles el `:hover` queda "pegado" después del toque. Para teclado está el equivalente `:focus-visible`.

13. **¿Cómo funciona la validación sin librerías?**
    Con la Constraint Validation API: atributos HTML (`required`, `type`, `minlength`, `pattern`), `checkValidity()`, `validity.*` y `setCustomValidity()` para la coincidencia de contraseñas.

14. **¿Cómo se hace accesible el carrusel?**
    Las diapositivas ocultas tienen `inert` + `aria-hidden`, los indicadores usan `aria-current`, las flechas tienen `aria-label` y hay `aria-roledescription` (`actualizarAccesibilidadDiapositivas`, `actualizarIndicadores`).

15. **¿Por qué `transform` y `opacity` para animar y no `left` o `width`?**
    El navegador los puede animar en la GPU sin recalcular el layout. Son más fluidos y no mueven al resto de la página. La barra de carga usa `scaleX` y no `width` por eso.

---

## 6. Cosas para tener presentes

### Requisitos no cubiertos o cubiertos a medias
| Requisito | Estado | Detalle |
|---|---|---|
| Animaciones cuando el registro es correcto | ❌ **Falta** | `manejarEnvioRegistro` redirige al instante (`js/main.js:90-92`). |
| Captcha | ❌ **Solo visual** | `.captcha__caja` no tiene JS ni estado y no se valida (`registro.html:67-72`). |
| Página de ejecución del juego | ⚠️ Parcial | `juego.html` existe y se llega desde el Home, pero el tablero es una imagen (`juego.html:154`). No hay juego jugable ni `canvas`. |
| Login | ⚠️ Parcial | `login.html` **no incluye `main.js`**, así que `iniciarLogin` y el ojo no funcionan ahí. El botón "Iniciar Sesión" es un `<a href="index.html">` (`login.html:42`) que pasa por alto la validación. Con Enter, el form envía por `GET` y la contraseña queda en la URL. |
| Datos no genéricos en el juego | ⚠️ Parcial | `<h1>Nombre del juego</h1>` (`juego.html:170`), comentarios de "Nombre de usuario" y `alt="Juego"` en los 5 recomendados. |
| Variedad de imágenes | ⚠️ Mejorable | De 24 cards secundarias, 16 son FIFA / EA FC / PES, con portadas parecidas. |
| Hover en ≥3 botones | ✅ | 4 efectos distintos (sección 2.3). |
| Carga de 5 s con % y spinner | ✅ | |
| Carrusel con transición animada | ✅ | Dos tipos distintos. |
| Mobile First en el Home | ✅ | |
| Sin frameworks | ✅ | |

### Limitaciones y puntos débiles del código
- **`alt` repetido**: las diapositivas 2, 3 y 4 del carrusel principal tienen el `alt` de GTA 6 (`index.html:164, 175, 186`).
- **Estilos inline**: `style="transform: rotate(180deg);"` en `index.html:78` y `juego.html:69`. Esto contradice la separación de lenguajes.
- **Componentes duplicados**: `juego.css` repite el header, el footer y los menús. `login.css` repite el footer. Solo el Home usa `header.css` y `footer.css`.
- **Valores hardcodeados**: `juego.css` tiene ~30 líneas con `px` y ~21 colores hex. Los menús de `home.css` (`:670-874`) usan `z-index` fijos (998, 1000, 1050, 1100), `0.3s`, `rgba(...)`, `#14B8A6` y `px`.
- **Variables duplicadas** en `variables.css`: `--color-texto-blanco` (`:44` y `:179`), `--color-tarjeta-fondo` (`:41` y `:183`), `--peso-regular` y `--fuente-inter`.
- **Jerarquía de encabezados en `juego.html`**: aparece un `h3` ("Review del juego", `:158`) antes del `h1`, y las cards usan `h4` sin un `h3` previo.
- **Menús laterales**:
  - Se ocultan con `aria-hidden` pero no con `inert`: sus enlaces siguen recibiendo foco con Tab aunque estén fuera de pantalla.
  - El botón para cerrar el perfil es un `<img>` clickeable (`index.html:126`), sin acceso por teclado.
  - No se cierran con Escape.
  - `alternarMenu` repite la lógica de `cerrarMenu` (`js/main.js:359-383`).
- **Buscador**: el input no tiene `label` y tiene `outline: none` (`css/header.css:113`), así que no se ve el foco.
- **Carrito del header**: es un `<img>`, no un botón.
- **Hover en registro**: no está dentro de `@media (hover: hover)` como en el Home (inconsistencia menor).
- **Flechas de los carruseles secundarios**: no tienen hover (solo `:focus-visible`).
- **Cards secundarias**: no llevan a ningún lado. Solo las diapositivas del carrusel principal enlazan a `juego.html`.
- **Pantalla de carga sin JS**: si `main.js` falla, nadie agrega `--oculta` y el Home queda tapado y sin scroll.
- **`prefers-reduced-motion`**: no se contempla en ninguna animación.
- `juego.html` tiene un `</body>` duplicado al final (`:452-454`).

### Consejos para la defensa
- Mostrar primero lo que está sólido: **carga → carrusel principal → carruseles secundarios en desktop y en mobile → hovers del registro → validación con errores**.
- Si preguntan por la animación de registro o el captcha, reconocer que faltan y explicar cómo se harían con lo que ya existe: una clase `--exito` con `@keyframes` y la redirección en `animationend`, igual que en el carrusel.
