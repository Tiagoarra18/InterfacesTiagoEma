const MENSAJES_ERROR = {
  obligatorio: 'Este campo es obligatorio',
  email: 'Email inválido',
  contrasena: 'Mínimo 5 caracteres y 1 número',
  coincidencia: 'Las contraseñas no coinciden'
};

const PAGINA_INICIO = 'index.html';
const FACTOR_BRILLO = 0.3;
// Filtros que puede sortear cada pieza según el nivel de Blocka
const FILTROS_POR_NIVEL = {
    1: ['grises', 'brillo', 'negativo'],
    2: ['grises', 'brillo', 'negativo'],
    3: ['grises', 'brillo', 'negativo']
};
// Máximo de Ayuditas por nivel (cantidad de piezas), compartido entre todas sus imágenes
const AYUDAS_POR_NIVEL = { 9: 2, 16: 5 };
// Ayuditas gastadas por nivel; se reinicia solo al recargar la página
const ayudasUsadasPorNivel = { 9: 0, 16: 0 };
const DURACION_CARGA_MS = 5000;

/* ---------- Mostrar / Ocultar contraseña ---------- */

function alternarVisibilidad(boton) {
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
    mostrarExitoBoton(formulario.querySelector('.btn--primario'));
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

const PAUSA_TRAS_EXITO_MS = 500;

function mostrarExitoBoton(boton) {
  boton.classList.add('btn--exito');

  boton.addEventListener('animationend', (evento) => {
    if (evento.animationName === 'aparecer-exito') {
      setTimeout(() => {
        window.location.href = PAGINA_INICIO;
      }, PAUSA_TRAS_EXITO_MS);
    }
  });
}

/* ---------- Validación de Login ---------- */

function iniciarLogin() {
  const formularioLogin = document.querySelector('.tarjeta-login__formulario');
  if (!formularioLogin) return;

  formularioLogin.addEventListener('submit', (evento) => {
    evento.preventDefault();

    if (formularioLogin.checkValidity()) {
      mostrarExitoBoton(formularioLogin.querySelector('.btn--primario'));
      return;
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

/* ---------- Pantalla de Carga ---------- */

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

/* ---------- Carruseles secundarios (3 Estados: Inicio, Medio, Fin) ---------- */

const DIRECCIONES_SECUNDARIAS = { 'secundario-anterior': -1, 'secundario-siguiente': 1 };
// Índice = estado (0: inicio, 1: medio, 2: fin). El inicio no lleva clase
const CLASES_ESTADO_SECUNDARIO = [null, 'carrusel-secundario__fila--medio', 'carrusel-secundario__fila--fin'];
const CLASES_MOVIMIENTO_SECUNDARIO = ['carrusel-secundario__fila--moviendo-adelante', 'carrusel-secundario__fila--moviendo-atras'];

function moverFilaSecundaria(fila, estado, paso) {
  CLASES_ESTADO_SECUNDARIO.forEach((clase, indice) => {
    if (clase) fila.classList.toggle(clase, indice === estado);
  });
  fila.classList.add(CLASES_MOVIMIENTO_SECUNDARIO[paso > 0 ? 0 : 1]);
}

function actualizarFlechasSecundarias(anterior, siguiente, estado) {
  const ultimo = CLASES_ESTADO_SECUNDARIO.length - 1;
  anterior.hidden = estado === 0;
  siguiente.hidden = estado === ultimo;
  // Si la flecha presionada se ocultó, el foco pasa a la otra
  if (estado === 0) siguiente.focus();
  if (estado === ultimo) anterior.focus();
}

function iniciarCarruselSecundario(carrusel) {
  const fila = carrusel.querySelector('[data-js="fila-secundaria"]');
  const anterior = carrusel.querySelector('[data-js="secundario-anterior"]');
  const siguiente = carrusel.querySelector('[data-js="secundario-siguiente"]');
  const estado = { actual: 0, animando: false };

  carrusel.addEventListener('click', (evento) => {
    const control = evento.target.closest('[data-js]');
    const paso = control ? DIRECCIONES_SECUNDARIAS[control.dataset.js] : undefined;
    if (paso === undefined || estado.animando) return;

    const destino = estado.actual + paso;
    if (destino < 0 || destino >= CLASES_ESTADO_SECUNDARIO.length) return;

    estado.animando = true;
    estado.actual = destino;
    moverFilaSecundaria(fila, destino, paso);
    actualizarFlechasSecundarias(anterior, siguiente, destino);
  });

  function terminarMovimiento(evento) {
    if (evento.target !== fila || evento.propertyName !== 'transform') return;

    fila.classList.remove(...CLASES_MOVIMIENTO_SECUNDARIO);
    estado.animando = false;
  }

  fila.addEventListener('transitionend', terminarMovimiento);
  // Si se achica la pantalla a mobile en pleno movimiento, la transición se cancela sin transitionend
  fila.addEventListener('transitioncancel', terminarMovimiento);
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

  botonAbrir.addEventListener('click', alternarMenu);
  overlay.addEventListener('click', cerrarMenu);
  if (botonCerrarInterno) botonCerrarInterno.addEventListener('click', cerrarMenu);
}

/* ---------- Menú Lateral de Categorías ---------- */

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

  botonAbrir.addEventListener('click', abrirMenu);
  botonCerrar.addEventListener('click', cerrarMenu);
  overlay.addEventListener('click', cerrarMenu);
}


/* ---------- BLOCKA GAME LOGIC ---------- */
function initBlocka() {
    const tablero = document.getElementById('blocka-tablero');
    if (!tablero) return;

    let timerInterval = null;
    let tiempo = 0;
    let nivel = 1;
    const maxNivel = 3;
    let jugando = false;
    let juegoTerminado = false;
    let piezasState = [];
    let piezas = 4;
    const dificultades = [4, 9, 16];
    const pantalla = document.querySelector('.pantalla-blocka');
    let partidaIniciada = false;
    let cargandoNivel = false; // Bloquea Comenzar mientras carga la imagen
    let idCarga = 0; // Identifica la última carga pedida para descartar las anteriores
    
    const segundosAyudita = 5;
    // Píxeles de imagen extra por lado de cada pieza; debe coincidir con --solape-pieza-blocka
    const SOLAPE_PIEZA = 1;
    const btnComenzar = document.getElementById('btn-blocka-comenzar');
    const btnAyudita = document.getElementById('btn-blocka-ayudita');
    const textoAyudita = btnAyudita.querySelector('.btn__texto');
    
    const imagenes = [
        'assets/img/blocka/1.webp',
        'assets/img/blocka/2.webp',
        'assets/img/blocka/3.webp',
        'assets/img/blocka/4.webp',
        'assets/img/blocka/5.webp',
        'assets/img/blocka/6.webp'
    ];

    const timerEl = document.getElementById('blocka-timer');
    const recordEl = document.getElementById('blocka-record');
    const nivelEl = document.getElementById('blocka-nivel-actual');
    
    // --- FILTROS CANVAS (Técnica de las slides) ---

    function aplicarFiltroGrises(imageData) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = (x + y * width) * 4;
                const gris = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
                data[i] = gris;
                data[i+1] = gris;
                data[i+2] = gris;
            }
        }
    }

    function aplicarFiltroBrillo(imageData) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = (x + y * width) * 4;
                data[i] = data[i] * FACTOR_BRILLO;
                data[i+1] = data[i+1] * FACTOR_BRILLO;
                data[i+2] = data[i+2] * FACTOR_BRILLO;
            }
        }
    }

    function aplicarFiltroNegativo(imageData) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = (x + y * width) * 4;
                data[i] = 255 - data[i];
                data[i+1] = 255 - data[i+1];
                data[i+2] = 255 - data[i+2];
            }
        }
    }

    const FUNCIONES_FILTRO = {
        grises: aplicarFiltroGrises,
        brillo: aplicarFiltroBrillo,
        negativo: aplicarFiltroNegativo
    };

    function sortearFiltro() {
        const disponibles = FILTROS_POR_NIVEL[nivel];
        return disponibles[Math.floor(Math.random() * disponibles.length)];
    }

    // Lee los píxeles de la pieza, les aplica su único filtro y los vuelve a escribir
    function filtrarPieza(ctxPieza, ancho, alto, filtro) {
        const imageData = ctxPieza.getImageData(0, 0, ancho, alto);
        FUNCIONES_FILTRO[filtro](imageData);
        ctxPieza.putImageData(imageData, 0, 0);
    }

    // Dibuja el centro cuadrado de la imagen original (sin filtro) al tamaño del tablero
    function crearImagenRecortada(img, tamano) {
        const canvasImg = document.createElement('canvas');
        canvasImg.width = tamano;
        canvasImg.height = tamano;
        const ctxImg = canvasImg.getContext('2d');

        const ladoRecorte = Math.min(img.width, img.height);
        const origenX = (img.width - ladoRecorte) / 2;
        const origenY = (img.height - ladoRecorte) / 2;
        ctxImg.drawImage(img, origenX, origenY, ladoRecorte, ladoRecorte, 0, 0, tamano, tamano);
        return canvasImg;
    }

    function claveRecord(cantidad) {
        return 'blocka_record_' + cantidad;
    }

    function textoRecord(cantidad) {
        const r = localStorage.getItem(claveRecord(cantidad));
        return r ? formatTime(parseInt(r)) : '-';
    }

    function actualizarRecordUI() {
        recordEl.textContent = textoRecord(piezas);
        dificultades.forEach((cantidad) => {
            document.getElementById('blocka-record-' + cantidad).textContent = textoRecord(cantidad);
        });
    }

    function formatTime(secs) {
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    function ayudasRestantes() {
        return AYUDAS_POR_NIVEL[piezas] - ayudasUsadasPorNivel[piezas];
    }

    // Muestra las Ayuditas que le quedan al nivel actual y lo marca agotado al llegar a 0
    function actualizarBotonAyudita() {
        const tieneAyudita = piezas in AYUDAS_POR_NIVEL;
        btnAyudita.classList.toggle('btn--oculto', !(tieneAyudita && partidaIniciada));
        if (!tieneAyudita) return;

        const restantes = ayudasRestantes();
        textoAyudita.textContent = `Ayudita (${restantes})`;
        btnAyudita.classList.toggle('btn--agotado', restantes === 0);
        btnAyudita.disabled = restantes === 0 || !jugando;
    }

    function actualizarBotones() {
        // Bloquear Comenzar si ya empezó o si la imagen todavía está cargando
        btnComenzar.disabled = partidaIniciada || cargandoNivel;
        actualizarBotonAyudita();
    }

    function detenerTemporizador() {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    function reiniciarJuego() {
        jugando = false;
        juegoTerminado = false;
        partidaIniciada = false;
        detenerTemporizador();
        tiempo = 0;
        nivel = 1;
        timerEl.textContent = formatTime(tiempo);
        actualizarRecordUI();
        setupNivel();
    }

    function setupNivel() {
        nivelEl.textContent = nivel;
        cargandoNivel = true;
        actualizarBotones();
      
        tablero.innerHTML = '';
        tablero.className = `blocka-tablero blocka-tablero--${piezas}-piezas`;
        
        const imgPath = imagenes[Math.floor(Math.random() * imagenes.length)];
        const img = new Image();
        const cargaActual = ++idCarga;
        img.onload = () => {
            // Si mientras cargaba se pidió otro nivel o se volvió al menú, esta carga se descarta
            if (cargaActual !== idCarga) return;

            const lado = Math.sqrt(piezas);
            piezasState = [];

            // Lado entero en píxeles para que los cortes no caigan en medio de un píxel
            const ladoPieza = Math.ceil(tablero.clientWidth / lado);
            const canvasImg = crearImagenRecortada(img, ladoPieza * lado);
            // Cada pieza sortea un solo filtro entre los de su nivel
            const filtrosPieza = Array.from({ length: piezas }, sortearFiltro);
            // Cada pieza toma también el borde de sus vecinas para pisarlas y tapar las rendijas
            const ladoCanvas = ladoPieza + SOLAPE_PIEZA * 2;

            // Una pieza canvas por celda
            for (let i = 0; i < piezas; i++) {
                const pieza = document.createElement('canvas');
                pieza.className = 'blocka-tablero__pieza';
                pieza.width = ladoCanvas;
                pieza.height = ladoCanvas;
                
                const ctxPieza = pieza.getContext('2d');
                const columna = i % lado;
                const fila = Math.floor(i / lado);
                
                // Dibujar la porción original de esta pieza (con el solape) y aplicarle su filtro
                ctxPieza.drawImage(
                    canvasImg,
                    columna * ladoPieza - SOLAPE_PIEZA, fila * ladoPieza - SOLAPE_PIEZA, ladoCanvas, ladoCanvas,
                    0, 0, ladoCanvas, ladoCanvas
                );
                filtrarPieza(ctxPieza, pieza.width, pieza.height, filtrosPieza[i]);
                pieza.dataset.filtro = filtrosPieza[i];
                
                const rotations = [90, 180, 270];
                const initialRot = rotations[Math.floor(Math.random() * rotations.length)];
                piezasState.push(initialRot);
                
                pieza.style.transform = `rotate(${initialRot}deg)`;
                pieza.dataset.totalRot = initialRot;
                pieza.dataset.index = i;
                
                pieza.addEventListener('click', () => rotarPieza(i, -90));
                pieza.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    rotarPieza(i, 90);
                });
                
                tablero.appendChild(pieza);
            }
            
            cargandoNivel = false;
            actualizarBotones();
        };
        img.src = imgPath;
    }

    function rotarPieza(index, deg) {
        const pieza = tablero.children[index];
        if (!jugando || pieza.dataset.fija === 'true') return;
        
        piezasState[index] = (piezasState[index] + deg + 360) % 360;
        const newRot = Number(pieza.dataset.totalRot) + deg;
        pieza.dataset.totalRot = newRot;
        pieza.style.transform = `rotate(${newRot}deg)`;
        
        checkWin();
    }

    function checkWin() {
        const won = piezasState.every(r => r === 0);
        if (won) {
            jugando = false;
            detenerTemporizador();  
            actualizarBotones();
            
            tablero.classList.add('blocka-tablero--completado');

            let batiRecord = false;
            if (nivel === maxNivel) {
                juegoTerminado = true;
                detenerTemporizador();
                const recordActual = localStorage.getItem(claveRecord(piezas));
                if (!recordActual || tiempo < parseInt(recordActual)) {
                    localStorage.setItem(claveRecord(piezas), tiempo);
                    batiRecord = true;
                    actualizarRecordUI();
                }
            }
            
            setTimeout(() => {
                const modal = document.getElementById('modal-nivel');
                document.getElementById('modal-tiempo').textContent = formatTime(tiempo);
                document.getElementById('modal-record-msg').textContent = batiRecord ? '¡Nuevo Récord!' : '';
                
                const esUltimoNivel = nivel === maxNivel;
                document.getElementById('btn-siguiente-nivel').classList.toggle('btn--oculto', esUltimoNivel);
                document.getElementById('btn-salir-nivel').classList.toggle('btn--oculto', esUltimoNivel);
                document.getElementById('btn-jugar-de-nuevo').classList.toggle('btn--oculto', !esUltimoNivel);
                document.getElementById('btn-menu-principal').classList.toggle('btn--oculto', !esUltimoNivel);
                if (esUltimoNivel) {
                    document.getElementById('modal-record-msg').textContent += ' ¡Juego Completado!';
                }
                
                modal.setAttribute('aria-hidden', 'false');
            }, 500);
        }
    }

    function iniciarJuego() {
        if (jugando) return;
        if (juegoTerminado) reiniciarJuego();
        jugando = true;
        partidaIniciada = true;
        actualizarBotones();
        if (timerInterval) return;
        timerInterval = setInterval(() => {
            tiempo++;
            timerEl.textContent = formatTime(tiempo);
        }, 1000);
    }

    function mostrarMenu() {
        jugando = false;
        partidaIniciada = false;
        idCarga++;
        detenerTemporizador();
        pantalla.classList.remove('pantalla-blocka--jugando');
        actualizarRecordUI();
    }

    function elegirDificultad(cantidad) {
        piezas = cantidad;
        pantalla.classList.add('pantalla-blocka--jugando');
        reiniciarJuego();
    }

    document.querySelector('.menu-blocka__opciones').addEventListener('click', (evento) => {
        const opcion = evento.target.closest('[data-piezas]');
        if (opcion) elegirDificultad(Number(opcion.dataset.piezas));
    });

    document.getElementById('btn-blocka-menu').addEventListener('click', mostrarMenu);

    function usarAyudita() {
        if (!jugando || !(piezas in AYUDAS_POR_NIVEL) || ayudasRestantes() === 0) return;
        const malUbicadas = piezasState
            .map((rotacion, indice) => (rotacion !== 0 ? indice : -1))
            .filter((indice) => indice !== -1);
        if (malUbicadas.length === 0) return;

        const indice = malUbicadas[Math.floor(Math.random() * malUbicadas.length)];
        const pieza = tablero.children[indice];
        
        const rotacionCorrecta = Math.round(Number(pieza.dataset.totalRot) / 360) * 360;
        piezasState[indice] = 0;
        pieza.dataset.totalRot = rotacionCorrecta;
        pieza.dataset.fija = 'true';
        pieza.style.transform = `rotate(${rotacionCorrecta}deg)`;

        tiempo += segundosAyudita;
        timerEl.textContent = formatTime(tiempo);
        // Solo se cuenta el uso si la ayuda acomodó una pieza
        ayudasUsadasPorNivel[piezas]++;
        actualizarBotones();
        checkWin();
    }

    btnComenzar.addEventListener('click', iniciarJuego);
    btnAyudita.addEventListener('click', usarAyudita);

    document.getElementById('btn-siguiente-nivel').addEventListener('click', () => {
        nivel++;
        document.getElementById('modal-nivel').setAttribute('aria-hidden', 'true');
        setupNivel();
        iniciarJuego();
    });

    document.getElementById('btn-blocka-reiniciar').addEventListener('click', reiniciarJuego);

    document.getElementById('btn-salir-nivel').addEventListener('click', () => {
        document.getElementById('modal-nivel').setAttribute('aria-hidden', 'true');
        mostrarMenu();
    });

    document.getElementById('btn-jugar-de-nuevo').addEventListener('click', () => {
        document.getElementById('modal-nivel').setAttribute('aria-hidden', 'true');
        reiniciarJuego();
        iniciarJuego();
    });

    const modalInstrucciones = document.getElementById('modal-instrucciones');
    document.getElementById('btn-blocka-instrucciones').addEventListener('click', () => {
        modalInstrucciones.setAttribute('aria-hidden', 'false');
    });
    document.getElementById('btn-cerrar-instrucciones').addEventListener('click', () => {
        modalInstrucciones.setAttribute('aria-hidden', 'true');
    });

    mostrarMenu();
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
initBlocka();