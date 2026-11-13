class Casillero {
    /**
     * @param {number} fila
     * @param {number} columna
     * @param {number} centroX
     * @param {number} centroY
     * @param {number} radio
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
     * @returns {number} Fila en la matriz.
     */ 
    getFila() {
        return this.fila;
    }

    /**
     * @returns {number} Columna en la matriz.
     */
    getColumna() {
        return this.columna;
    }

    /**
     * @returns {number}
     */
    getCentroX() {
        return this.centroX;
    }

    /**
     * @returns {number}
     */
    getCentroY() {
        return this.centroY;
    }

    /**
     * @returns {number}
     */
    getRadio() {
        return this.radio;
    }

    /**
     * @returns {Ficha|null}
     */
    getFicha() {
        return this.ficha;
    }

    /**
     * @param {Ficha|null} ficha
     * @returns {void}
     */
    setFicha(ficha) {
        this.ficha = ficha;
    }

    /**
     * @returns {boolean}
     */
    estaVacio() {
        return this.ficha === null;
    }

    /**
     * @param {number} x 
     * @param {number} y 
     * @returns {boolean}
     */
    contienePunto(x, y) {
        const dx = this.centroX - x;
        const dy = this.centroY - y;
        return Math.sqrt(dx * dx + dy * dy) <= this.radio;
    }
}
