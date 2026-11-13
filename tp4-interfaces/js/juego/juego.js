class Juego {
    static DURACION_PARTIDA_MS = 2 * 60 * 1000;
    static INTERVALO_TIMER_MS = 1000;
    static DURACION_RETORNO_MS = 200;
    static RUTA_TABLERO = 'assets/img/tableroSinFichas.jpg';
    static RUTA_FICHA = 'assets/img/ficha.jpg';
    static UMBRAL_ALFA = 128;
    static UMBRAL_BLANCO = 235;
    /** Aclara un poco las variantes teñidas para que los paños claros no queden apagados */
    static BRILLO_TINTE = 1.15;
    static TINTES = {
        clasica: null,
        dorada: '--color-ficha-dorada-peg',
        roja: '--color-ficha-roja-peg',
        celeste: '--color-ficha-celeste-peg'
    };
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
    static CLASES_CURSOR = ['peg__canvas--agarrar', 'peg__canvas--agarrando'];

    /**
     * @param {HTMLElement} contenedor
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
     * @param {string} hex 
     * @returns {{r: number, g: number, b: number}}
     */
    convertirHexARgb(hex) {
        return {
            r: parseInt(hex.slice(1, 3), 16),
            g: parseInt(hex.slice(3, 5), 16),
            b: parseInt(hex.slice(5, 7), 16)
        };
    }

    /**
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
     * @returns {void}
     */
    prepararRecursos() {
        this.recortarPelota();
        this.botonJugar.disabled = false;
    }

    /**
     * @param {number} ancho 
     * @param {number} alto
     * @returns {HTMLCanvasElement}
     */
    crearCanvasAuxiliar(ancho, alto) {
        const canvas = document.createElement('canvas');
        canvas.width = ancho;
        canvas.height = alto;
        return canvas;
    }

    /**
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

    /**.
     * @param {Uint8ClampedArray} data RGBA
     * @param {number} i Indice
     * @returns {boolean} 
     */
    esPixelDePelota(data, i) {
        const esOpaco = data[i + 3] > Juego.UMBRAL_ALFA;
        const esBlanco = data[i] > Juego.UMBRAL_BLANCO && data[i + 1] > Juego.UMBRAL_BLANCO && data[i + 2] > Juego.UMBRAL_BLANCO;
        return esOpaco && !esBlanco;
    }

    /**
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
     * @param {CanvasRenderingContext2D} ctxVariante
     * @param {number} lado en px
     * @param {{r: number, g: number, b: number}} tinte
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
     * @returns {void}
     */
    ajustarTamanoCanvas() {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
    }

    /* ---------- Eventos ---------- */

    /**
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
        this.botonSeguir.addEventListener('click', () => this.prepararPartida());
        this.botonSalirCartel.addEventListener('click', () => this.salir());
    }

    /**
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
     * @param {MouseEvent} e Evento mousedown.
     * @returns {void}
     */
  onMouseDown(e) {
        if (this.estado !== 'jugando', this.fichaArrastrada !== null, this.animacionRetorno !== null) {
            return;
        }
        const { x, y } = this.obtenerPosicionMouse(e);
        const ficha = this.buscarFichaEn(x, y);
        if (ficha === null) {
            return;
        }
        const destinos = this.tablero.obtenerDestinosValidos(ficha);
        const destinosI = this.tablero.obtenerDestinosInvalidos(ficha);
        this.fichaArrastrada = ficha;
        this.destinos = destinos;
        this.destinosInvalidos = destinosI;
        this.offsetAgarre = { x: x - ficha.getPosX(), y: y - ficha.getPosY() };
        this.hints = destinosI.map(({ destino }) => new Hint(destino, this.ctx, this.colorHint));
        ficha.setResaltada(true);
        this.actualizarCursor(x, y);
        this.iniciarLoop();
    }
    /**
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
     * @returns {void}
     */
    onMouseLeave() {
        if (this.fichaArrastrada !== null) {
            this.devolverFicha();
        }
        this.cambiarCursor(null);
    }

    /**
     * @param {number} x 
     * @param {number} y 
     * @returns {void}
     */
    actualizarCursor(x, y) {
        if (this.fichaArrastrada !== null) {
            this.cambiarCursor('peg__canvas--agarrando');
            return;
        }
        const ficha = this.estado === 'jugando' && this.animacionRetorno === null ? this.buscarFichaEn(x, y) : null;
        this.cambiarCursor(ficha === null ? null : 'peg__canvas--agarrar');
    }

    /**
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
 
     * @param {number} x 
     * @param {number} y 
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
     * @returns {void}
     */
    iniciar() {
        this.estado = 'jugando';
        this.textoIniciar.textContent = 'Reiniciar';
        this.arrancarTimer();
    }

    /**
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
     * @returns {void}
     */
    ocultarCartel() {
        this.cartel.hidden = true;
    }

    /**
     * @returns {void}
     */
    actualizarContador() {
        this.fichasRestantes.textContent = this.tablero.contarFichas() - 1;
    }

    /**
     * @param {number} ms Tiempo restante en milisegundos.
     * @returns {void}
     */
    mostrarTiempo(ms) {
        this.tiempo.textContent = this.formatearTiempo(ms);
    }

    /**
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
     * @returns {void}
     */
    arrancarTimer() {
        this.momentoFin = Date.now() + Juego.DURACION_PARTIDA_MS;
        this.idIntervalo = setInterval(() => this.tickTimer(), Juego.INTERVALO_TIMER_MS);
    }

    /**
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
     * @returns {void}
     */
    detenerTimer() {
        clearInterval(this.idIntervalo);
        this.idIntervalo = null;
    }

    /* ---------- Animación ---------- */

    /**
     * @returns {void}
     */
    iniciarLoop() {
        if (this.idAnimacion === null) {
            this.idAnimacion = requestAnimationFrame(this.loop);
        }
    }

    /**
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
     * @returns {void}
     */
    detenerLoop() {
        cancelAnimationFrame(this.idAnimacion);
        this.idAnimacion = null;
    }

    /**
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
