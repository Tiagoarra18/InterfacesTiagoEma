const MENSAJES_ERROR = {
  obligatorio: 'Este campo es obligatorio',
  email: 'Email inválido',
  contrasena: 'Mínimo 5 caracteres y 1 número',
  coincidencia: 'Las contraseñas no coinciden'
};

const PAGINA_INICIO = 'index.html';
const DURACION_CARGA_MS = 5000;

/* ---------- Mostrar / Ocultar contraseña (Compatible con Registro y Login) ---------- */

function alternarVisibilidad(boton) {
  // Busca el input asociado por el atributo aria-controls o dentro del contenedor padre
  const contenedor = boton.closest('.campo-formulario__contenedor-entrada, .campo');
  const input = contenedor ? contenedor.querySelector('input') : document.getElementById(boton.getAttribute('aria-controls'));
  if (!input) return;

  const mostrar = input.type === 'password';
  input.type = mostrar ? 'text' : 'password';
  
  boton.setAttribute('aria-pressed', String(mostrar));
  boton.setAttribute('aria-label', mostrar ? 'Ocultar contraseña' : 'Mostrar contraseña');
  boton.classList.toggle('campo__ojo--activo', mostrar);
  boton.classList.toggle('campo-formulario__boton-ojo--activo', mostrar);
}

function iniciarOjos() {
  document.addEventListener('click', (evento) => {
    const boton = evento.target.closest('.campo__ojo, .campo-formulario__boton-ojo');
    if (boton) alternarVisibilidad(boton);
  });
}

/* ---------- Mensajes y estado de error ---------- */

function obtenerMensaje(validity) {
  if (validity.valueMissing) return MENSAJES_ERROR.obligatorio;
  if (validity.typeMismatch) return MENSAJES_ERROR.email;
  if (validity.tooShort || validity.patternMismatch) return MENSAJES_ERROR.contrasena;
  if (validity.customError) return MENSAJES_ERROR.coincidencia;
  return '';
}

function obtenerCartel(input) {
  const id = input.getAttribute('aria-describedby');
  return id ? document.getElementById(id) : null;
}

function mostrarError(input) {
  input.classList.add('campo__input--error', 'campo-formulario__entrada--error');
  input.setAttribute('aria-invalid', 'true');

  const cartel = obtenerCartel(input);
  if (!cartel) return;
  cartel.textContent = obtenerMensaje(input.validity);
  cartel.classList.add('campo__error--visible');
}

function ocultarError(input) {
  input.classList.remove('campo__input--error', 'campo-formulario__entrada--error');
  input.removeAttribute('aria-invalid');

  const cartel = obtenerCartel(input);
  if (!cartel) return;
  cartel.textContent = '';
  cartel.classList.remove('campo__error--visible');
}

function actualizarError(input) {
  if (input.checkValidity()) {
    ocultarError(input);
  } else {
    mostrarError(input);
  }
}

/* ---------- Validación de Registro ---------- */

function validarCoincidencia(contrasena, repetir) {
  if (!contrasena || !repetir) return;
  const coinciden = repetir.value === contrasena.value;
  repetir.setCustomValidity(coinciden ? '' : MENSAJES_ERROR.coincidencia);
}

function manejarEnvioRegistro(evento, formulario, contrasena, repetir) {
  evento.preventDefault();
  validarCoincidencia(contrasena, repetir);

  if (formulario.checkValidity()) {
    window.location.href = PAGINA_INICIO;
    return;
  }

  const invalidos = formulario.querySelectorAll('.campo__input:invalid, input:invalid');
  invalidos.forEach(mostrarError);
  if (invalidos.length > 0) invalidos[0].focus();
}

function corregirCampoRegistro(input, contrasena, repetir) {
  if (input === contrasena || input === repetir) {
    validarCoincidencia(contrasena, repetir);
  }
  if (input === contrasena && repetir && repetir.classList.contains('campo__input--error')) {
    actualizarError(repetir);
  }
  if (input.classList.contains('campo__input--error')) {
    actualizarError(input);
  }
}

function iniciarRegistro() {
  const formulario = document.querySelector('.formulario');
  if (!formulario) return;

  const contrasena = formulario.querySelector('#contrasena');
  const repetir = formulario.querySelector('#repetir-contrasena');

  formulario.addEventListener('submit', (evento) => {
    manejarEnvioRegistro(evento, formulario, contrasena, repetir);
  });
  formulario.addEventListener('input', (evento) => {
    corregirCampoRegistro(evento.target, contrasena, repetir);
  });
}

/* ---------- Validación de Login ---------- */

function iniciarLogin() {
  const formularioLogin = document.querySelector('.tarjeta-login__formulario');
  if (!formularioLogin) return;

  formularioLogin.addEventListener('submit', (evento) => {
    evento.preventDefault();

    if (formularioLogin.checkValidity()) {
      window.location.href = PAGINA_INICIO;
    } else {
      const invalidos = formularioLogin.querySelectorAll('input:invalid');
      invalidos.forEach(mostrarError);
      if (invalidos.length > 0) invalidos[0].focus();
    }
  });

  formularioLogin.addEventListener('input', (evento) => {
    const input = evento.target;
    if (input.classList.contains('campo__input--error') || input.classList.contains('campo-formulario__entrada--error')) {
      actualizarError(input);
    }
  });
}

/* ---------- Pantalla de Carga (Preloader) ---------- */

function actualizarProgreso(barra, textoPorcentaje, porcentaje) {
  if (textoPorcentaje) textoPorcentaje.textContent = `${porcentaje}%`;
  if (barra) barra.setAttribute('aria-valuenow', String(porcentaje));
}

function calcularPorcentaje(inicio) {
  const transcurrido = performance.now() - inicio;
  return Math.min(100, Math.floor((transcurrido / DURACION_CARGA_MS) * 100));
}

function ocultarPantallaCarga(pantalla) {
  pantalla.classList.add('pantalla-carga--oculta');
  document.body.classList.remove('sin-scroll');
}

function iniciarPantallaCarga() {
  const pantalla = document.querySelector('[data-js="pantalla-carga"]');
  if (!pantalla) return;

  const progreso = pantalla.querySelector('[data-js="progreso-carga"]');
  const textoPorcentaje = pantalla.querySelector('[data-js="porcentaje-carga"]');
  const barra = pantalla.querySelector('.pantalla-carga__barra');
  let inicio = 0;
  let idFrame = 0;

  function avanzar() {
    actualizarProgreso(barra, textoPorcentaje, calcularPorcentaje(inicio));
    idFrame = requestAnimationFrame(avanzar);
  }

  if (progreso) {
    progreso.addEventListener('animationstart', () => {
      inicio = performance.now();
      idFrame = requestAnimationFrame(avanzar);
    });

    progreso.addEventListener('animationend', () => {
      cancelAnimationFrame(idFrame);
      actualizarProgreso(barra, textoPorcentaje, 100);
      ocultarPantallaCarga(pantalla);
    });
  }

  pantalla.addEventListener('transitionend', (evento) => {
    if (evento.propertyName === 'opacity') pantalla.hidden = true;
  });
}

/* ---------- Carrusel principal ---------- */

const DIRECCIONES_CARRUSEL = { 'carrusel-anterior': -1, 'carrusel-siguiente': 1 };

const CLASES_TRANSICION_CARRUSEL = [
  'carrusel__diapositiva--entrando-derecha',
  'carrusel__diapositiva--entrando-izquierda',
  'carrusel__diapositiva--saliendo-izquierda',
  'carrusel__diapositiva--saliendo-derecha'
];

function calcularIndiceCircular(actual, paso, total) {
  return (actual + paso + total) % total;
}

function actualizarAccesibilidadDiapositivas(diapositivas, indiceActivo) {
  diapositivas.forEach((diapositiva, indice) => {
    const activa = indice === indiceActivo;
    diapositiva.inert = !activa;
    if (activa) {
      diapositiva.removeAttribute('aria-hidden');
    } else {
      diapositiva.setAttribute('aria-hidden', 'true');
    }
  });
}

function actualizarIndicadores(indicadores, indiceActivo) {
  indicadores.forEach((indicador, indice) => {
    const activo = indice === indiceActivo;
    indicador.classList.toggle('carrusel__indicador--activo', activo);
    if (activo) {
      indicador.setAttribute('aria-current', 'true');
    } else {
      indicador.removeAttribute('aria-current');
    }
  });
}

function aplicarClasesTransicion(saliente, entrante, paso) {
  const haciaAdelante = paso > 0;
  saliente.classList.remove('carrusel__diapositiva--activa');
  saliente.classList.add(haciaAdelante ? 'carrusel__diapositiva--saliendo-izquierda' : 'carrusel__diapositiva--saliendo-derecha');
  entrante.classList.add('carrusel__diapositiva--activa', haciaAdelante ? 'carrusel__diapositiva--entrando-derecha' : 'carrusel__diapositiva--entrando-izquierda');
}

function limpiarClasesTransicion(saliente, entrante) {
  saliente.classList.remove(...CLASES_TRANSICION_CARRUSEL);
  entrante.classList.remove(...CLASES_TRANSICION_CARRUSEL);
}

function iniciarCarrusel() {
  const carrusel = document.querySelector('[data-js="carrusel"]');
  if (!carrusel) return;

  const diapositivas = Array.from(carrusel.querySelectorAll('.carrusel__diapositiva'));
  const indicadores = Array.from(carrusel.querySelectorAll('[data-js="carrusel-indicador"]'));
  const estado = { actual: 0, animando: false, saliente: null };

  function irA(destino, paso) {
    if (estado.animando || destino === estado.actual) return;

    estado.animando = true;
    estado.saliente = diapositivas[estado.actual];
    aplicarClasesTransicion(estado.saliente, diapositivas[destino], paso);
    actualizarIndicadores(indicadores, destino);
    actualizarAccesibilidadDiapositivas(diapositivas, destino);
    estado.actual = destino;
  }

  carrusel.addEventListener('click', (evento) => {
    const control = evento.target.closest('[data-js]');
    if (!control) return;

    if (control.dataset.js === 'carrusel-indicador') {
      const destino = Number(control.dataset.indice);
      irA(destino, destino > estado.actual ? 1 : -1);
      return;
    }

    const paso = DIRECCIONES_CARRUSEL[control.dataset.js];
    if (paso === undefined) return;
    irA(calcularIndiceCircular(estado.actual, paso, diapositivas.length), paso);
  });

  carrusel.addEventListener('animationend', (evento) => {
    const entrante = diapositivas[estado.actual];
    if (evento.target !== entrante || !evento.animationName.startsWith('entrar')) return;

    limpiarClasesTransicion(estado.saliente, entrante);
    estado.saliente = null;
    estado.animando = false;
  });
}

/* ---------- Carruseles secundarios ---------- */

const DIRECCIONES_SECUNDARIAS = { 'secundario-anterior': -1, 'secundario-siguiente': 1 };

function moverFilaSecundaria(fila, enFinal) {
  fila.classList.toggle('carrusel-secundario__fila--final', enFinal);
  fila.classList.add(enFinal ? 'carrusel-secundario__fila--moviendo-adelante' : 'carrusel-secundario__fila--moviendo-atras');
}

function actualizarFlechasSecundarias(anterior, siguiente, enFinal) {
  anterior.hidden = !enFinal;
  siguiente.hidden = enFinal;
  (enFinal ? anterior : siguiente).focus();
}

function iniciarCarruselSecundario(carrusel) {
  const fila = carrusel.querySelector('[data-js="fila-secundaria"]');
  const anterior = carrusel.querySelector('[data-js="secundario-anterior"]');
  const siguiente = carrusel.querySelector('[data-js="secundario-siguiente"]');
  const estado = { enFinal: false, animando: false };

  carrusel.addEventListener('click', (evento) => {
    const control = evento.target.closest('[data-js]');
    const paso = control ? DIRECCIONES_SECUNDARIAS[control.dataset.js] : undefined;
    if (paso === undefined || estado.animando) return;

    const enFinal = paso > 0;
    if (enFinal === estado.enFinal) return;

    estado.animando = true;
    estado.enFinal = enFinal;
    moverFilaSecundaria(fila, enFinal);
    actualizarFlechasSecundarias(anterior, siguiente, enFinal);
  });

  fila.addEventListener('transitionend', (evento) => {
    if (evento.target !== fila || evento.propertyName !== 'transform') return;

    fila.classList.remove('carrusel-secundario__fila--moviendo-adelante', 'carrusel-secundario__fila--moviendo-atras');
    estado.animando = false;
  });
}

function iniciarCarruselesSecundarios() {
  document.querySelectorAll('[data-js="carrusel-secundario"]').forEach(iniciarCarruselSecundario);
}

/* ---------- Menú Desplegable de Perfil ---------- */

function iniciarMenuPerfil() {
  const botonAbrir = document.getElementById('boton-perfil-header');
  const botonCerrarInterno = document.getElementById('boton-perfil-interno');
  const menuPerfil = document.getElementById('menu-perfil');
  const overlay = document.getElementById('overlay-perfil');

  if (!botonAbrir || !menuPerfil || !overlay) return;

  function alternarMenu(evento) {
    // Evitar que el clic se propague al overlay si están superpuestos
    if (evento) evento.stopPropagation(); 
    
    const estaAbierto = menuPerfil.classList.contains('menu-perfil--activo');
    
    if (estaAbierto) {
      menuPerfil.classList.remove('menu-perfil--activo');
      overlay.classList.remove('overlay-perfil--activo');
      menuPerfil.setAttribute('aria-hidden', 'true');
      botonAbrir.setAttribute('aria-expanded', 'false');
    } else {
      menuPerfil.classList.add('menu-perfil--activo');
      overlay.classList.add('overlay-perfil--activo');
      menuPerfil.setAttribute('aria-hidden', 'false');
      botonAbrir.setAttribute('aria-expanded', 'true');
    }
  }

  function cerrarMenu() {
    menuPerfil.classList.remove('menu-perfil--activo');
    overlay.classList.remove('overlay-perfil--activo');
    menuPerfil.setAttribute('aria-hidden', 'true');
    botonAbrir.setAttribute('aria-expanded', 'false');
  }

  // Eventos de apertura/cierre
  botonAbrir.addEventListener('click', alternarMenu);
  
  // Cierre por clic afuera (overlay) o botón interno
  overlay.addEventListener('click', cerrarMenu);
  if (botonCerrarInterno) botonCerrarInterno.addEventListener('click', cerrarMenu);
}


/* ---------- Menú Lateral de Categorías (Izquierda) ---------- */

function iniciarMenuCategorias() {
  const botonAbrir = document.getElementById('boton-menu-categorias');
  const botonCerrar = document.getElementById('boton-cerrar-categorias');
  const menuCategorias = document.getElementById('menu-categorias');
  const overlay = document.getElementById('overlay-categorias');

  if (!botonAbrir || !botonCerrar || !menuCategorias || !overlay) return;

  function abrirMenu(evento) {
    if (evento) evento.stopPropagation();
    menuCategorias.classList.add('menu-categorias--activo');
    overlay.classList.add('overlay-categorias--activo');
    menuCategorias.setAttribute('aria-hidden', 'false');
    botonAbrir.setAttribute('aria-expanded', 'true');
  }

  function cerrarMenu() {
    menuCategorias.classList.remove('menu-categorias--activo');
    overlay.classList.remove('overlay-categorias--activo');
    menuCategorias.setAttribute('aria-hidden', 'true');
    botonAbrir.setAttribute('aria-expanded', 'false');
  }

  // Evento para abrir haciendo clic en el menú hamburguesa del header
  botonAbrir.addEventListener('click', abrirMenu);
  
  // Eventos para cerrar desde la X o el overlay
  botonCerrar.addEventListener('click', cerrarMenu);
  overlay.addEventListener('click', cerrarMenu);
}
/* ---------- Inicialización Global ---------- */

iniciarOjos();
iniciarRegistro();
iniciarLogin();
iniciarPantallaCarga();
iniciarCarrusel();
iniciarCarruselesSecundarios();
iniciarMenuPerfil();
iniciarMenuCategorias();
