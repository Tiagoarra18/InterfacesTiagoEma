/**
 * Tablero en cruz de 33 agujeros: dibuja la imagen de fondo, guarda la matriz de casilleros
 * y las fichas, y aplica las reglas de movimiento.
 */
class Tablero {
    /** Tamaño original de tableroSinFichas.jpg, sobre el que se midieron los agujeros */
    static ANCHO_IMAGEN = 1599;
    static ALTO_IMAGEN = 984;
    /** Centros de las columnas y filas como proporción del tamaño de la imagen */
    static CENTROS_X = [540, 626, 715, 801, 886, 975, 1061].map((x) => x / Tablero.ANCHO_IMAGEN);
    static CENTROS_Y = [268, 344, 417, 490, 564, 642, 724].map((y) => y / Tablero.ALTO_IMAGEN);
    static DIAMETRO_AGUJERO = 61;
    static TAMANO = 7;
    static CENTRO = 3;
    /** La ficha es apenas más grande que el agujero para tapar el círculo blanco */
    static FACTOR_FICHA = 1.08;
    /** Saltos posibles: arriba, abajo, izquierda y derecha (nunca diagonal) */
    static DIRECCIONES = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    /**
     * Crea el tablero y su matriz de casilleros escalada al tamaño del canvas.
     * @param {HTMLImageElement} imagen Imagen del tablero vacío.
     * @param {CanvasRenderingContext2D} context Contexto 2D donde se dibuja.
     * @param {number} ancho Ancho del canvas en px.
     * @param {number} alto Alto del canvas en px.
     */
    constructor(imagen, context, ancho, alto) {
        this.imagen = imagen;
        this.context = context;
        this.ancho = ancho;
        this.alto = alto;
        // El radio usa la escala menor para que agujeros y fichas sigan siendo círculos
        const escala = Math.min(ancho / Tablero.ANCHO_IMAGEN, alto / Tablero.ALTO_IMAGEN);
        this.radioAgujero = (Tablero.DIAMETRO_AGUJERO / 2) * escala;
        this.radioFicha = this.radioAgujero * Tablero.FACTOR_FICHA;
        this.fichas = [];
        this.casilleros = this.crearCasilleros();
    }

    /**
     * Arma la matriz 7 x 7 con un Casillero en cada posición válida y null en el resto.
     * @returns {Array<Array<Casillero|null>>} Matriz de casilleros.
     */
    crearCasilleros() {
        const matriz = [];
        for (let fila = 0; fila < Tablero.TAMANO; fila++) {
            matriz.push([]);
            for (let columna = 0; columna < Tablero.TAMANO; columna++) {
                const casillero = this.esPosicionValida(fila, columna)
                    ? new Casillero(fila, columna, Tablero.CENTROS_X[columna] * this.ancho,
                        Tablero.CENTROS_Y[fila] * this.alto, this.radioAgujero)
                    : null;
                matriz[fila].push(casillero);
            }
        }
        return matriz;
    }

    /**
     * Indica si una posición de la matriz es un agujero de la cruz.
     * @param {number} fila Fila de 0 a 6.
     * @param {number} columna Columna de 0 a 6.
     * @returns {boolean} true si es un agujero.
     */
    esPosicionValida(fila, columna) {
        if (fila < 0 || fila >= Tablero.TAMANO || columna < 0 || columna >= Tablero.TAMANO) {
            return false;
        }
        const esBrazoCentral = fila >= 2 && fila <= 4;
        return esBrazoCentral || (columna >= 2 && columna <= 4);
    }

    /**
     * Devuelve el casillero de una posición.
     * @param {number} fila Fila de 0 a 6.
     * @param {number} columna Columna de 0 a 6.
     * @returns {Casillero|null} Casillero o null si la posición no es un agujero.
     */
    obtenerCasillero(fila, columna) {
        return this.esPosicionValida(fila, columna) ? this.casilleros[fila][columna] : null;
    }

    /**
     * Devuelve todos los casilleros válidos en una lista.
     * @returns {Casillero[]} Los 33 casilleros.
     */
    obtenerCasilleros() {
        return this.casilleros.flat().filter((casillero) => casillero !== null);
    }

    /**
     * Calcula a dónde puede saltar una ficha: en línea recta sobre una ficha vecina
     * hasta el agujero vacío que está justo detrás.
     * @param {Ficha} ficha Ficha a mover.
     * @returns {Array<{destino: Casillero, saltado: Casillero}>} Movimientos válidos.
     */
    obtenerDestinosValidos(ficha) {
        const origen = ficha.getCasillero();
        const movimientos = [];
        Tablero.DIRECCIONES.forEach(([df, dc]) => {
            const saltado = this.obtenerCasillero(origen.getFila() + df, origen.getColumna() + dc);
            const destino = this.obtenerCasillero(origen.getFila() + 2 * df, origen.getColumna() + 2 * dc);
            if (saltado !== null && destino !== null && !saltado.estaVacio() && destino.estaVacio()) {
                movimientos.push({ destino, saltado });
            }
        });
        return movimientos;
    }

    /**
     * Mueve la ficha del origen al destino y retira la ficha saltada.
     * @param {Casillero} origen Casillero de la ficha que salta.
     * @param {Casillero} destino Casillero vacío donde cae.
     * @returns {Ficha} La ficha retirada.
     */
    aplicarMovimiento(origen, destino) {
        const ficha = origen.getFicha();
        const saltado = this.obtenerCasillero(
            (origen.getFila() + destino.getFila()) / 2,
            (origen.getColumna() + destino.getColumna()) / 2
        );
        const comida = saltado.getFicha();
        saltado.setFicha(null);
        this.fichas = this.fichas.filter((f) => f !== comida);
        origen.setFicha(null);
        destino.setFicha(ficha);
        ficha.setCasillero(destino);
        ficha.centrarEn(destino);
        return comida;
    }

    /**
     * Indica si alguna ficha todavía puede saltar.
     * @returns {boolean} true si queda al menos un movimiento.
     */
    hayMovimientosPosibles() {
        return this.fichas.some((ficha) => this.obtenerDestinosValidos(ficha).length > 0);
    }

    /**
     * Cuenta las fichas que quedan en el tablero.
     * @returns {number} Cantidad de fichas.
     */
    contarFichas() {
        return this.fichas.length;
    }

    /**
     * Indica si un casillero es el agujero central.
     * @param {Casillero} casillero Casillero a revisar.
     * @returns {boolean} true si es el (3, 3).
     */
    esCentro(casillero) {
        return casillero.getFila() === Tablero.CENTRO && casillero.getColumna() === Tablero.CENTRO;
    }

    /**
     * Vuelve a la posición inicial: una ficha en cada agujero menos el central,
     * con un tipo visual sorteado para cada una.
     * @param {Object<string, CanvasPattern>} variantes Pattern de cada tipo de ficha.
     * @returns {void}
     */
    reiniciar(variantes) {
        const tipos = Object.keys(variantes);
        this.fichas = [];
        this.obtenerCasilleros().forEach((casillero) => {
            casillero.setFicha(null);
            if (this.esCentro(casillero)) {
                return;
            }
            const tipo = tipos[Math.floor(Math.random() * tipos.length)];
            const ficha = new Ficha(casillero.getCentroX(), casillero.getCentroY(), this.radioFicha,
                variantes[tipo], this.context, tipo, casillero);
            casillero.setFicha(ficha);
            this.fichas.push(ficha);
        });
    }

    /**
     * Devuelve las fichas que quedan.
     * @returns {Ficha[]} Fichas del tablero.
     */
    getFichas() {
        return this.fichas;
    }

    /**
     * Devuelve el radio de las fichas.
     * @returns {number} Radio en px del canvas.
     */
    getRadioFicha() {
        return this.radioFicha;
    }

    /**
     * Dibuja la imagen del tablero ocupando todo el canvas.
     * @returns {void}
     */
    draw() {
        this.context.drawImage(this.imagen, 0, 0, this.ancho, this.alto);
    }
}
