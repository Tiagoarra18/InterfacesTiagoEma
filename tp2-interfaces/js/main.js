const MENSAJES_ERROR = {
  obligatorio: 'Este campo es obligatorio',
  email: 'Email inválido',
  contrasena: 'Mínimo 5 caracteres y 1 número',
  coincidencia: 'Las contraseñas no coinciden'
};

const PAGINA_INICIO = 'index.html';
const DURACION_CARGA_MS = 5000;

/* ---------- Mostrar / ocultar contraseña ---------- */

function alternarVisibilidad(boton) {
  const input = document.getElementById(boton.getAttribute('aria-controls'));
  const mostrar = input.type === 'password';

  input.type = mostrar ? 'text' : 'password';
  boton.setAttribute('aria-pressed', String(mostrar));
  boton.setAttribute('aria-label', mostrar ? 'Ocultar contraseña' : 'Mostrar contraseña');
  boton.classList.toggle('campo__ojo--activo', mostrar);
}

function iniciarOjos() {
  const formulario = document.querySelector('.formulario');
  if (!formulario || !formulario.querySelector('.campo__ojo')) return;

  formulario.addEventListener('click', (evento) => {
    const boton = evento.target.closest('.campo__ojo');
    if (boton) alternarVisibilidad(boton);
  });
}

/* ---------- Validación del registro ---------- */

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
  input.classList.add('campo__input--error');
  input.setAttribute('aria-invalid', 'true');

  const cartel = obtenerCartel(input);
  if (!cartel) return;
  cartel.textContent = obtenerMensaje(input.validity);
  cartel.classList.add('campo__error--visible');
}

function ocultarError(input) {
  input.classList.remove('campo__input--error');
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

function validarCoincidencia(contrasena, repetir) {
  const coinciden = repetir.value === contrasena.value;
  repetir.setCustomValidity(coinciden ? '' : MENSAJES_ERROR.coincidencia);
}

function iniciarCarga(boton) {
  window.location.href = PAGINA_INICIO;
}

function manejarEnvio(evento, formulario, contrasena, repetir) {
  evento.preventDefault();
  validarCoincidencia(contrasena, repetir);

  if (formulario.checkValidity()) {
    iniciarCarga(formulario.querySelector('.btn--primario'));
    return;
  }

  const invalidos = formulario.querySelectorAll('.campo__input:invalid');
  invalidos.forEach(mostrarError);
  if (invalidos.length > 0) invalidos[0].focus();
}

function corregirCampo(input, contrasena, repetir) {
  if (input === contrasena || input === repetir) {
    validarCoincidencia(contrasena, repetir);
  }
  if (input === contrasena && repetir.classList.contains('campo__input--error')) {
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
    manejarEnvio(evento, formulario, contrasena, repetir);
  });
  formulario.addEventListener('input', (evento) => {
    corregirCampo(evento.target, contrasena, repetir);
  });
}

/* ---------- Pantalla de carga ---------- */

function actualizarProgreso(barra, textoPorcentaje, porcentaje) {
  textoPorcentaje.textContent = `${porcentaje}%`;
  barra.setAttribute('aria-valuenow', String(porcentaje));
}

function calcularPorcentaje(inicio) {
  const transcurrido = performance.now() - inicio;
  return Math.min(100, Math.floor(transcurrido / DURACION_CARGA_MS * 100));
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

  progreso.addEventListener('animationstart', () => {
    inicio = performance.now();
    idFrame = requestAnimationFrame(avanzar);
  });

  progreso.addEventListener('animationend', () => {
    cancelAnimationFrame(idFrame);
    actualizarProgreso(barra, textoPorcentaje, 100);
    ocultarPantallaCarga(pantalla);
  });

  pantalla.addEventListener('transitionend', (evento) => {
    if (evento.propertyName === 'opacity') pantalla.hidden = true;
  });
}

iniciarOjos();
iniciarRegistro();
iniciarPantallaCarga();
