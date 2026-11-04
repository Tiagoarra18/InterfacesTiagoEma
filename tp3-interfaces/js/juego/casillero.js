/**
 * Agujero del tablero: su posición en la matriz, su centro en el canvas y la ficha que contiene.
 */
class Casillero {
    /**
     * Crea un casillero vacío.
     * @param {number} fila Fila en la matriz 7 x 7.
     * @param {number} columna Columna en la matriz 7 x 7.
     * @param {number} centroX Centro X en px del canvas.
     * @param {number} centroY Centro Y en px del canvas.
     * @param {number} radio Radio del agujero en px del canvas.
     */
    constructor(fila, columna, centroX, centroY, radio) {
        this.fila = fila;
        this.columna = columna;
        this.centroX = centroX;
        this.centroY = centroY;
        this.radio = radio;
        this.ficha = null;
    }

    /**
     * Devuelve la fila.
     * @returns {number} Fila en la matriz.
     */
    getFila() {
        return this.fila;
    }

    /**
     * Devuelve la columna.
     * @returns {number} Columna en la matriz.
     */
    getColumna() {
        return this.columna;
    }

    /**
     * Devuelve el centro X.
     * @returns {number} Centro X en px del canvas.
     */
    getCentroX() {
        return this.centroX;
    }

    /**
     * Devuelve el centro Y.
     * @returns {number} Centro Y en px del canvas.
     */
    getCentroY() {
        return this.centroY;
    }

    /**
     * Devuelve el radio del agujero.
     * @returns {number} Radio en px del canvas.
     */
    getRadio() {
        return this.radio;
    }

    /**
     * Devuelve la ficha que contiene.
     * @returns {Ficha|null} Ficha o null si está vacío.
     */
    getFicha() {
        return this.ficha;
    }

    /**
     * Pone o saca una ficha del casillero.
     * @param {Ficha|null} ficha Ficha nueva o null para vaciarlo.
     * @returns {void}
     */
    setFicha(ficha) {
        this.ficha = ficha;
    }

    /**
     * Indica si el casillero no tiene ficha.
     * @returns {boolean} true si está vacío.
     */
    estaVacio() {
        return this.ficha === null;
    }

    /**
     * Indica si un punto cae dentro del agujero.
     * @param {number} x Coordenada X en px del canvas.
     * @param {number} y Coordenada Y en px del canvas.
     * @returns {boolean} true si el punto está dentro del radio del agujero.
     */
    contienePunto(x, y) {
        const dx = this.centroX - x;
        const dy = this.centroY - y;
        return Math.sqrt(dx * dx + dy * dy) <= this.radio;
    }
}
