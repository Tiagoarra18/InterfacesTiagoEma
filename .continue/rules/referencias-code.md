---
description: A description of your rule
---

Sitio web de una plataforma de juegos. Se implementa por partes a partir de capturas de Figma: Login/Registro, Home y página del juego (Peg Solitaire).

## Stack
- HTML5, CSS3 y JavaScript vanilla. Sin frameworks ni librerías (nada de React, Vue, Angular, jQuery, Bootstrap, Tailwind, Sass, npm).
- Sin backend: login, registro y sesión se simulan en el front.

## Estructura
- Un `css/variables.css` compartido con todas las variables de `:root` (colores, fuentes, tamaños, espaciados). Se enlaza en cada HTML antes del CSS de la página, y ningún otro archivo redefine esas variables.
- Un archivo CSS de estilos por cada HTML: `index.html` → `css/home.css`, `login.html` → `css/login.css`, etc.
- Un solo archivo JS para todo el sitio: `js/main.js`. Cada funcionalidad se inicializa solo si su elemento existe en la página.
- Imágenes en `assets/img/`, íconos SVG en `assets/icons/`.
- Nombres de archivo en minúsculas y kebab-case. Siempre rutas relativas, nunca empezar con `/`.
- Componentes compartidos entre páginas (header, footer) tienen su propio CSS en `css/` (ej. `css/header.css`), enlazado después de `variables.css` y antes del CSS de la página.

## Reglas generales
- HTML, CSS y JS siempre separados. Prohibido: `style=""`, `<style>`, scripts inline y atributos `on*`.
- El diseño de Figma es la referencia. Si algo es ambiguo, preguntar antes de inventar.
- No agregar elementos, funcionalidades, animaciones ni transiciones que no se pidan.
- Nada de Lorem Ipsum ni textos genéricos. Uso los datos que te paso.
- El Home es Mobile First (media queries con `min-width`). El resto de las páginas es solo desktop (frame de 1440px).

## HTML
- Etiquetas semánticas según el contenido: `header`, `nav`, `main`, `section`, `article`, `footer`, `figure`, `ul`/`li` para listas. Usar `div` solo si no hay otra opción.
- Un `h1` por página y jerarquía de encabezados sin saltos.
- `<a>` para navegar, `<button type="...">` para acciones.
- Formularios con `label`, el `type` correcto en cada input y `required` donde corresponda.
- `alt` en todas las imágenes.

## CSS
- Colores, fuentes, tamaños y espaciados se usan siempre desde las variables de `css/variables.css`. No hardcodear valores.
- Tipografía y color base definidos en `body` y heredados. Aprovechar la cascada.
- Clases reutilizables con BEM (`.card`, `.card__title`, `.btn--primary`).
- Sin IDs para estilos y sin `!important`.
- Unidades `rem`. Layout con Flexbox y Grid.

## JS
- `const`/`let`, nunca `var`. `===` siempre.
- `addEventListener`, y delegación de eventos en listas.
- Cambios visuales solo con `classList`, nunca estilos inline.
- Usar `textContent` o `<template>` para insertar datos, no `innerHTML`.
- Funciones cortas con nombres claros. Sin `alert()`: el feedback se muestra en la interfaz.

## Al trabajar cada tarea
1. Antes de codear, resumir qué archivos se tocan.
2. Implementar solo lo pedido, sin tocar otras páginas.
3. Al terminar, listar los cambios y justificar brevemente las decisiones.
4. Nombres de variables, funciones, clases e IDs en español.