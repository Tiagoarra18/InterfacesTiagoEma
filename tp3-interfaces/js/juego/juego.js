/**
 * Controla el Peg Football: estados de la partida, timer, contador, capas HTML y eventos del mouse.
 * Estados: 'inicio' (portada), 'listo' (fichas visibles y bloqueadas), 'jugando' y 'terminado'.
 */
class Juego {
    static DURACION_PARTIDA_MS = 2 * 60 * 1000;
    static INTERVALO_TIMER_MS = 1000;
    static DURACION_RETORNO_MS = 200;
    static RUTA_TABLERO = 'assets/img/tableroSinFichas.jpg';
    static RUTA_FICHA = 'assets/img/ficha.jpg';
    /** Un píxel es parte de la pelota si es bastante opaco y no es blanco (fondo transparente o blanco) */
    static UMBRAL_ALFA = 128;
    static UMBRAL_BLANCO = 235;
    /** Aclara un poco las variantes teñidas para que los paños claros no queden apagados */
    static BRILLO_TINTE = 1.15;
    /** Tipos de ficha y la variable de variables.css con su tinte (la clásica no se tiñe) */
    static TINTES = {
        clasica: null,
        dorada: '--color-ficha-dorada-peg',
        roja: '--color-ficha-roja-peg',
        celeste: '--color-ficha-celeste-peg'
    };
    /** Título y texto de cada cartel de fin; el texto recibe las fichas que quedaron */
    static RESULTADOS = {
        perfecta: {
            titulo: '¡Victoria perfecta!',
            texto: () => 'Quedó una sola pelota y justo en el agujero central.'
        },
        victoria: {
            titulo: '¡Victoria!',
            texto: () => 'Quedó una sola pelota en el tablero.'
        },
        derrota: {
            titulo: 'Sin movimientos',
            texto: (fichas) => `No quedan saltos posibles. Quedaron ${fichas} pelotas en el tablero.`
        },
        tiempo: {
            titulo: '¡Se acabó el tiempo!',
            texto: (fichas) => `Quedaron ${fichas} ${fichas === 1 ? 'pelota' : 'pelotas'} en el tablero.`
        }
    };
    static CLASES_CURSOR = ['peg__canvas--agarrar', 'peg__canvas--agarrando', 'peg__canvas--bloqueado'];

    /**
     * Crea el juego dentro de su contenedor, registra los eventos y empieza a cargar las imágenes.
     * @param {HTMLElement} contenedor Elemento .peg con el canvas y las capas HTML.
     */
    constructor(contenedor) {
        this.canvas = contenedor.querySelector('.peg__canvas');
        this.ctx = this.canvas.getContext('2d');
        this.inicio = contenedor.querySelector('.peg__inicio');
        this.panel = contenedor.querySelector('.peg__panel');
        this.cartel = contenedor.querySelector('.peg__cartel');
        this.botonJugar = contenedor.querySelector('.peg__boton-jugar');
        this.botonIniciar = contenedor.querySelector('.peg__boton-iniciar');
        this.textoIniciar = contenedor.querySelector('.peg__texto-iniciar');
        this.botonSalir = contenedor.querySelector('.peg__boton-salir');
        this.botonSeguir = contenedor.querySelector('.peg__boton-seguir');
        this.botonSalirCartel = contenedor.querySelector('.peg__boton-salir-cartel');
        this.tiempo = contenedor.querySelector('.peg__tiempo');
        this.fichasRestantes = contenedor.querySelector('.peg__fichas-restantes');
        this.tituloCartel = contenedor.querySelector('.peg__titulo-cartel');
        this.textoCartel = contenedor.querySelector('.peg__texto-cartel');

        this.estado = 'inicio';
        this.tablero = null;
        this.imagenTablero = null;
        this.imagenFicha = null;
        this.recorte = null;
        this.variantes = null;
        this.fichaArrastrada = null;
        this.offsetAgarre = { x: 0, y: 0 };
        this.destinos = [];
        this.hints = [];
        this.animacionRetorno = null;
        this.idAnimacion = null;
        this.momentoFin = 0;
        this.idIntervalo = null;
        this.loop = this.loop.bind(this);

        this.leerColores();
        this.registrarEventos();
        this.cargarImagenes();
    }

    /* ---------- Preparación ---------- */

    /**
     * Lee de variables.css los colores que usa el canvas.
     * @returns {void}
     */
    leerColores() {
        const estilos = getComputedStyle(document.documentElement);
        this.colorHint = estilos.getPropertyValue('--color-hint-peg').trim();
        Ficha.colorResaltado = estilos.getPropertyValue('--color-resaltado-peg').trim();
        this.tintes = {};
        Object.entries(Juego.TINTES).forEach(([tipo, variable]) => {
            this.tintes[tipo] = variable === null ? null : this.convertirHexARgb(estilos.getPropertyValue(variable).trim());
        });
    }

    /**
     * Convierte un color hexadecimal (#RRGGBB) en sus tres canales.
     * @param {string} hex Color en formato #RRGGBB.
     * @returns {{r: number, g: number, b: number}} Canales de 0 a 255.
     */
    convertirHexARgb(hex) {
        return {
            r: parseInt(hex.slice(1, 3), 16),
            g: parseInt(hex.slice(3, 5), 16),
            b: parseInt(hex.slice(5, 7), 16)
        };
    }

    /**
     * Carga las imágenes del tablero y de la pelota; cuando cargaron las dos, prepara los recursos.
     * @returns {void}
     */
    cargarImagenes() {
        let pendientes = 2;
        const alCargar = () => {
            pendientes--;
            if (pendientes === 0) {
                this.prepararRecursos();
            }
        };
        this.imagenTablero = new Image();
        this.imagenTablero.onload = alCargar;
        this.imagenTablero.src = Juego.RUTA_TABLERO;
        this.imagenFicha = new Image();
        this.imagenFicha.onload = alCargar;
        this.imagenFicha.src = Juego.RUTA_FICHA;
    }

    /**
     * Recorta la pelota una sola vez y habilita el botón Jugar.
     * @returns {void}
     */
    prepararRecursos() {
        this.recortarPelota();
        this.botonJugar.disabled = false;
    }

    /**
     * Crea un canvas auxiliar (fuera del DOM) de un tamaño dado.
     * @param {number} ancho Ancho en px.
     * @param {number} alto Alto en px.
     * @returns {HTMLCanvasElement} Canvas nuevo.
     */
    crearCanvasAuxiliar(ancho, alto) {
        const canvas = document.createElement('canvas');
        canvas.width = ancho;
        canvas.height = alto;
        return canvas;
    }

    /**
     * Busca la pelota dentro de ficha.jpg recorriendo sus píxeles: guarda el cuadrado
     * que contiene a todos los píxeles de la pelota (centro y diámetro).
     * @returns {void}
     */
    recortarPelota() {
        const ancho = this.imagenFicha.naturalWidth;
        const alto = this.imagenFicha.naturalHeight;
        const ctxAuxiliar = this.crearCanvasAuxiliar(ancho, alto).getContext('2d');
        ctxAuxiliar.drawImage(this.imagenFicha, 0, 0);
        const data = ctxAuxiliar.getImageData(0, 0, ancho, alto).data;
        let minX = ancho;
        let minY = alto;
        let maxX = -1;
        let maxY = -1;
        for (let y = 0; y < alto; y++) {
            for (let x = 0; x < ancho; x++) {
                const i = (x + y * ancho) * 4;
                if (this.esPixelDePelota(data, i)) {
                    minX = Math.min(minX, x);
                    maxX = Math.max(maxX, x);
                    minY = Math.min(minY, y);
                    maxY = Math.max(maxY, y);
                }
            }
        }
        const diametro = Math.max(maxX - minX + 1, maxY - minY + 1);
        this.recorte = {
            x: (minX + maxX + 1) / 2 - diametro / 2,
            y: (minY + maxY + 1) / 2 - diametro / 2,
            diametro
        };
    }

    /**
     * Indica si un píxel pertenece a la pelota: es opaco y no es blanco de fondo.
     * @param {Uint8ClampedArray} data Datos RGBA de la imagen.
     * @param {number} i Índice del canal rojo del píxel.
     * @returns {boolean} true si es parte de la pelota.
     */
    esPixelDePelota(data, i) {
        const esOpaco = data[i + 3] > Juego.UMBRAL_ALFA;
        const esBlanco = data[i] > Juego.UMBRAL_BLANCO && data[i + 1] > Juego.UMBRAL_BLANCO && data[i + 2] > Juego.UMBRAL_BLANCO;
        return esOpaco && !esBlanco;
    }

    /**
     * Genera un pattern por tipo de ficha: copia el recorte de la pelota al tamaño de la ficha
     * y, para las variantes de color, la tiñe píxel a píxel.
     * @returns {void}
     */
    generarVariantes() {
        const lado = Math.round(this.tablero.getRadioFicha() * 2);
        const base = this.crearCanvasAuxiliar(lado, lado);
        const { x, y, diametro } = this.recorte;
        base.getContext('2d').drawImage(this.imagenFicha, x, y, diametro, diametro, 0, 0, lado, lado);
        this.variantes = {};
        Object.entries(this.tintes).forEach(([tipo, tinte]) => {
            const canvasVariante = this.crearCanvasAuxiliar(lado, lado);
            const ctxVariante = canvasVariante.getContext('2d');
            ctxVariante.drawImage(base, 0, 0);
            if (tinte !== null) {
                this.aplicarTinte(ctxVariante, lado, tinte);
            }
            this.variantes[tipo] = this.ctx.createPattern(canvasVariante, 'no-repeat');
        });
    }

    /**
     * Tiñe una imagen manteniendo sus sombras: cada píxel toma el color del tinte
     * multiplicado por su luminancia (BT.601: 0.299 R + 0.587 G + 0.114 B).
     * @param {CanvasRenderingContext2D} ctxVariante Contexto con la pelota dibujada.
     * @param {number} lado Lado del canvas en px.
     * @param {{r: number, g: number, b: number}} tinte Color del tinte.
     * @returns {void}
     */
    aplicarTinte(ctxVariante, lado, tinte) {
        const imageData = ctxVariante.getImageData(0, 0, lado, lado);
        const data = imageData.data;
        for (let y = 0; y < lado; y++) {
            for (let x = 0; x < lado; x++) {
                const i = (x + y * lado) * 4;
                const luminancia = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                const factor = (luminancia / 255) * Juego.BRILLO_TINTE;
                data[i] = Math.min(255, tinte.r * factor);
                data[i + 1] = Math.min(255, tinte.g * factor);
                data[i + 2] = Math.min(255, tinte.b * factor);
            }
        }
        ctxVariante.putImageData(imageData, 0, 0);
    }

    /**
     * Iguala el tamaño interno del canvas al tamaño con que se muestra, así las coordenadas coinciden.
     * @returns {void}
     */
    ajustarTamanoCanvas() {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
    }

    /* ---------- Eventos ---------- */

    /**
     * Registra los eventos del canvas y de los botones.
     * @returns {void}
     */
    registrarEventos() {
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.canvas.addEventListener('mouseleave', () => this.onMouseLeave());
        this.botonJugar.addEventListener('click', () => this.jugar());
        this.botonIniciar.addEventListener('click', () => this.alternarIniciar());
        this.botonSalir.addEventListener('click', () => this.salir());
        this.botonSeguir.addEventListener('click', () => this.seguirJugando());
        this.botonSalirCartel.addEventListener('click', () => this.salir());
    }

    /**
     * Pasa la posición del mouse a coordenadas del canvas (por si se muestra a otro tamaño).
     * @param {MouseEvent} e Evento del mouse.
     * @returns {{x: number, y: number}} Posición en px del canvas.
     */
    obtenerPosicionMouse(e) {
        return {
            x: e.offsetX * this.canvas.width / this.canvas.clientWidth,
            y: e.offsetY * this.canvas.height / this.canvas.clientHeight
        };
    }

    /**
     * Levanta la ficha clickeada si tiene movimientos y crea los hints de sus destinos.
     * @param {MouseEvent} e Evento mousedown.
     * @returns {void}
     */
    onMouseDown(e) {
        if (this.estado !== 'jugando' || this.fichaArrastrada !== null || this.animacionRetorno !== null) {
            return;
        }
        const { x, y } = this.obtenerPosicionMouse(e);
        const ficha = this.buscarFichaEn(x, y);
        if (ficha === null) {
            return;
        }
        const destinos = this.tablero.obtenerDestinosValidos(ficha);
        if (destinos.length === 0) {
            return;
        }
        this.fichaArrastrada = ficha;
        this.destinos = destinos;
        this.offsetAgarre = { x: x - ficha.getPosX(), y: y - ficha.getPosY() };
        this.hints = destinos.map(({ destino }) => new Hint(destino, this.ctx, this.colorHint));
        ficha.setResaltada(true);
        this.actualizarCursor(x, y);
        this.iniciarLoop();
    }

    /**
     * Mueve la ficha arrastrada con el mouse o, si no hay ninguna, actualiza el cursor.
     * @param {MouseEvent} e Evento mousemove.
     * @returns {void}
     */
    onMouseMove(e) {
        const { x, y } = this.obtenerPosicionMouse(e);
        if (this.fichaArrastrada !== null) {
            this.fichaArrastrada.setPosX(x - this.offsetAgarre.x);
            this.fichaArrastrada.setPosY(y - this.offsetAgarre.y);
            return;
        }
        this.actualizarCursor(x, y);
    }

    /**
     * Suelta la ficha: si cae en un destino válido hace el salto; si no, la devuelve a su casillero.
     * @param {MouseEvent} e Evento mouseup.
     * @returns {void}
     */
    onMouseUp(e) {
        if (this.fichaArrastrada === null) {
            return;
        }
        const { x, y } = this.obtenerPosicionMouse(e);
        const movimiento = this.destinos.find(({ destino }) => destino.contienePunto(x, y));
        if (movimiento === undefined) {
            this.devolverFicha();
        } else {
            this.soltarEn(movimiento.destino);
        }
        this.actualizarCursor(x, y);
    }

    /**
     * Si el mouse sale del canvas con una ficha levantada, la devuelve a su casillero.
     * @returns {void}
     */
    onMouseLeave() {
        if (this.fichaArrastrada !== null) {
            this.devolverFicha();
        }
        this.cambiarCursor(null);
    }

    /**
     * Elige el cursor según lo que hay debajo del mouse.
     * @param {number} x Coordenada X en px del canvas.
     * @param {number} y Coordenada Y en px del canvas.
     * @returns {void}
     */
    actualizarCursor(x, y) {
        if (this.fichaArrastrada !== null) {
            this.cambiarCursor('peg__canvas--agarrando');
            return;
        }
        const ficha = this.estado === 'jugando' && this.animacionRetorno === null ? this.buscarFichaEn(x, y) : null;
        if (ficha === null) {
            this.cambiarCursor(null);
        } else if (this.tablero.obtenerDestinosValidos(ficha).length > 0) {
            this.cambiarCursor('peg__canvas--agarrar');
        } else {
            this.cambiarCursor('peg__canvas--bloqueado');
        }
    }

    /**
     * Deja en el canvas solo la clase de cursor indicada.
     * @param {string|null} clase Clase de cursor o null para el cursor normal.
     * @returns {void}
     */
    cambiarCursor(clase) {
        this.canvas.classList.remove(...Juego.CLASES_CURSOR);
        if (clase !== null) {
            this.canvas.classList.add(clase);
        }
    }

    /* ---------- Jugadas ---------- */

    /**
     * Busca la ficha que está debajo de un punto, empezando por las dibujadas más arriba.
     * @param {number} x Coordenada X en px del canvas.
     * @param {number} y Coordenada Y en px del canvas.
     * @returns {Ficha|null} Ficha encontrada o null.
     */
    buscarFichaEn(x, y) {
        const fichas = this.tablero.getFichas();
        for (let i = fichas.length - 1; i >= 0; i--) {
            if (fichas[i].isPointInside(x, y)) {
                return fichas[i];
            }
        }
        return null;
    }

    /**
     * Hace el salto de la ficha arrastrada al destino, actualiza el contador y revisa si terminó el juego.
     * @param {Casillero} destino Casillero donde se soltó.
     * @returns {void}
     */
    soltarEn(destino) {
        const ficha = this.fichaArrastrada;
        this.tablero.aplicarMovimiento(ficha.getCasillero(), destino);
        this.limpiarArrastre();
        this.detenerLoop();
        this.drawFigures(0);
        this.actualizarContador();
        this.verificarFin();
    }

    /**
     * Empieza la animación que devuelve la ficha levantada a su casillero.
     * @returns {void}
     */
    devolverFicha() {
        const ficha = this.fichaArrastrada;
        const casillero = ficha.getCasillero();
        this.animacionRetorno = {
            ficha,
            desde: { x: ficha.getPosX(), y: ficha.getPosY() },
            hasta: { x: casillero.getCentroX(), y: casillero.getCentroY() },
            inicio: performance.now()
        };
        this.fichaArrastrada = null;
        this.destinos = [];
        this.hints = [];
        this.cambiarCursor(null);
        this.iniciarLoop();
    }

    /**
     * Avanza la animación de retorno con interpolación lineal a + (b - a) * t.
     * @param {number} ahora Tiempo actual en ms (el de requestAnimationFrame).
     * @returns {void}
     */
    avanzarRetorno(ahora) {
        const { ficha, desde, hasta, inicio } = this.animacionRetorno;
        const t = Math.min(1, Math.max(0, (ahora - inicio) / Juego.DURACION_RETORNO_MS));
        ficha.setPosX(desde.x + (hasta.x - desde.x) * t);
        ficha.setPosY(desde.y + (hasta.y - desde.y) * t);
        if (t === 1) {
            ficha.setResaltada(false);
            this.animacionRetorno = null;
        }
    }

    /**
     * Saca el resaltado y olvida la ficha levantada, sus destinos, sus hints y la animación de retorno.
     * Si la ficha no estaba en su casillero, la vuelve a centrar sin animación.
     * @returns {void}
     */
    limpiarArrastre() {
        const ficha = this.fichaArrastrada !== null ? this.fichaArrastrada : this.animacionRetorno?.ficha;
        if (ficha !== undefined && ficha !== null) {
            ficha.setResaltada(false);
            ficha.centrarEn(ficha.getCasillero());
        }
        this.fichaArrastrada = null;
        this.animacionRetorno = null;
        this.destinos = [];
        this.hints = [];
    }

    /**
     * Si ya no quedan movimientos, termina la partida con el resultado que corresponda.
     * @returns {void}
     */
    verificarFin() {
        if (this.tablero.hayMovimientosPosibles()) {
            return;
        }
        const fichas = this.tablero.getFichas();
        if (fichas.length > 1) {
            this.terminar('derrota');
        } else if (this.tablero.esCentro(fichas[0].getCasillero())) {
            this.terminar('perfecta');
        } else {
            this.terminar('victoria');
        }
    }

    /* ---------- Estados ---------- */

    /**
     * "Jugar": muestra el canvas y el panel con las fichas en su posición inicial (estado listo).
     * @returns {void}
     */
    jugar() {
        this.inicio.hidden = true;
        this.canvas.hidden = false;
        this.panel.hidden = false;
        this.ajustarTamanoCanvas();
        this.tablero = new Tablero(this.imagenTablero, this.ctx, this.canvas.width, this.canvas.height);
        this.generarVariantes();
        this.prepararPartida();
    }

    /**
     * Deja una partida nueva sin empezar: tablero inicial, timer en 02:00, fichas bloqueadas
     * y el botón principal con el texto "Iniciar".
     * @returns {void}
     */
    prepararPartida() {
        this.detenerTimer();
        this.detenerLoop();
        this.limpiarArrastre();
        this.ocultarCartel();
        this.tablero.reiniciar(this.variantes);
        this.estado = 'listo';
        this.textoIniciar.textContent = 'Iniciar';
        this.botonIniciar.disabled = false;
        this.mostrarTiempo(Juego.DURACION_PARTIDA_MS);
        this.actualizarContador();
        this.cambiarCursor(null);
        this.drawFigures(0);
    }

    /**
     * Botón principal del panel: Iniciar en estado listo, Reiniciar mientras se juega.
     * @returns {void}
     */
    alternarIniciar() {
        if (this.estado === 'listo') {
            this.iniciar();
        } else if (this.estado === 'jugando') {
            this.prepararPartida();
        }
    }

    /**
     * "Iniciar": arranca el timer, habilita las fichas y cambia el botón a "Reiniciar".
     * @returns {void}
     */
    iniciar() {
        this.estado = 'jugando';
        this.textoIniciar.textContent = 'Reiniciar';
        this.arrancarTimer();
    }

    /**
     * "Salir": detiene y resetea todo y vuelve a la portada con el botón Jugar.
     * @returns {void}
     */
    salir() {
        this.prepararPartida();
        this.estado = 'inicio';
        this.canvas.hidden = true;
        this.panel.hidden = true;
        this.inicio.hidden = false;
    }

    /**
     * "Seguir jugando": resetea el tablero y el timer y arranca una partida nueva directamente.
     * @returns {void}
     */
    seguirJugando() {
        this.prepararPartida();
        this.iniciar();
    }

    /**
     * Termina la partida: detiene el timer y la animación, bloquea las fichas y muestra el cartel.
     * @param {string} resultado 'perfecta', 'victoria', 'derrota' o 'tiempo'.
     * @returns {void}
     */
    terminar(resultado) {
        this.estado = 'terminado';
        this.detenerTimer();
        this.detenerLoop();
        this.limpiarArrastre();
        this.cambiarCursor(null);
        this.drawFigures(0);
        this.botonIniciar.disabled = true;
        this.mostrarCartel(resultado);
    }

    /* ---------- Interfaz ---------- */

    /**
     * Muestra el cartel de fin con el título y el texto del resultado.
     * @param {string} resultado Clave de Juego.RESULTADOS.
     * @returns {void}
     */
    mostrarCartel(resultado) {
        const { titulo, texto } = Juego.RESULTADOS[resultado];
        this.tituloCartel.textContent = titulo;
        this.textoCartel.textContent = texto(this.tablero.contarFichas());
        this.cartel.hidden = false;
    }

    /**
     * Oculta el cartel de fin.
     * @returns {void}
     */
    ocultarCartel() {
        this.cartel.hidden = true;
    }

    /**
     * Muestra cuántas fichas faltan sacar para ganar (fichas en el tablero menos 1).
     * @returns {void}
     */
    actualizarContador() {
        this.fichasRestantes.textContent = this.tablero.contarFichas() - 1;
    }

    /**
     * Escribe el tiempo restante en el panel.
     * @param {number} ms Tiempo restante en milisegundos.
     * @returns {void}
     */
    mostrarTiempo(ms) {
        this.tiempo.textContent = this.formatearTiempo(ms);
    }

    /**
     * Pasa milisegundos a formato mm:ss (redondeando hacia arriba los segundos).
     * @param {number} ms Tiempo en milisegundos.
     * @returns {string} Tiempo con formato mm:ss.
     */
    formatearTiempo(ms) {
        const segundos = Math.ceil(ms / 1000);
        const minutos = String(Math.floor(segundos / 60)).padStart(2, '0');
        return `${minutos}:${String(segundos % 60).padStart(2, '0')}`;
    }

    /* ---------- Timer ---------- */

    /**
     * Guarda el momento de fin y revisa cada segundo cuánto falta, así el timer no se desfasa.
     * @returns {void}
     */
    arrancarTimer() {
        this.momentoFin = Date.now() + Juego.DURACION_PARTIDA_MS;
        this.idIntervalo = setInterval(() => this.tickTimer(), Juego.INTERVALO_TIMER_MS);
    }

    /**
     * Actualiza el tiempo restante y, si llegó a 0, termina la partida por tiempo.
     * @returns {void}
     */
    tickTimer() {
        const restante = Math.max(0, this.momentoFin - Date.now());
        this.mostrarTiempo(restante);
        if (restante === 0) {
            this.terminar('tiempo');
        }
    }

    /**
     * Detiene el timer si estaba corriendo.
     * @returns {void}
     */
    detenerTimer() {
        clearInterval(this.idIntervalo);
        this.idIntervalo = null;
    }

    /* ---------- Animación ---------- */

    /**
     * Pide el loop de animación si no hay uno corriendo.
     * @returns {void}
     */
    iniciarLoop() {
        if (this.idAnimacion === null) {
            this.idAnimacion = requestAnimationFrame(this.loop);
        }
    }

    /**
     * Un cuadro de la animación: avanza el retorno, redibuja y sigue solo mientras
     * haya una ficha arrastrada o volviendo a su casillero.
     * @param {number} tiempo Tiempo en ms que pasa requestAnimationFrame.
     * @returns {void}
     */
    loop(tiempo) {
        if (this.animacionRetorno !== null) {
            this.avanzarRetorno(tiempo);
        }
        this.drawFigures(tiempo / 1000);
        if (this.fichaArrastrada !== null || this.animacionRetorno !== null) {
            this.idAnimacion = requestAnimationFrame(this.loop);
        } else {
            this.idAnimacion = null;
        }
    }

    /**
     * Corta el loop de animación si estaba corriendo.
     * @returns {void}
     */
    detenerLoop() {
        cancelAnimationFrame(this.idAnimacion);
        this.idAnimacion = null;
    }

    /**
     * Dibuja todo: limpia, tablero, fichas quietas, hints y al final la ficha en movimiento para que quede encima.
     * @param {number} tiempo Tiempo en segundos para animar los hints.
     * @returns {void}
     */
    drawFigures(tiempo) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.tablero.draw();
        const enMovimiento = this.fichaArrastrada !== null ? this.fichaArrastrada : this.animacionRetorno?.ficha;
        this.tablero.getFichas().forEach((ficha) => {
            if (ficha !== enMovimiento) {
                ficha.draw();
            }
        });
        this.hints.forEach((hint) => hint.draw(tiempo));
        if (enMovimiento !== undefined) {
            enMovimiento.draw();
        }
    }
}
