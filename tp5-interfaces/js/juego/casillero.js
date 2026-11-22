class Casillero {
    constructor(fila, columna, centroX, centroY, radio) {
        this.fila = fila;
        this.columna = columna;
        this.centroX = centroX;
        this.centroY = centroY;
        this.radio = radio;
        this.ficha = null;
    }

    getFila() {
        return this.fila;
    }

    getColumna() {
        return this.columna;
    }

    getCentroX() {
        return this.centroX;
    }

    getCentroY() {
        return this.centroY;
    }

    getRadio() {
        return this.radio;
    }

    getFicha() {
        return this.ficha;
    }

    setFicha(ficha) {
        this.ficha = ficha;
    }

    estaVacio() {
        return this.ficha === null;
    }

    contienePunto(x, y) {
        const dx = this.centroX - x;
        const dy = this.centroY - y;
        return Math.sqrt(dx * dx + dy * dy) <= this.radio;
    }
}
