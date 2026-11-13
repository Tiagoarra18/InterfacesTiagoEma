class Ficha extends Figura {

    static colorResaltado = '';

    /**
     * Crea una ficha.
     * @param {number} posX 
     * @param {number} posY
     * @param {number} radio
     * @param {CanvasPattern} fill
     * @param {CanvasRenderingContext2D} context
     * @param {string} tipo
     * @param {Casillero} casillero
     */
    constructor(posX, posY, radio, fill, context, tipo, casillero) {
        super(posX, posY, fill, context);
        this.radio = radio;
        this.tipo = tipo;
        this.casillero = casillero;
        this.resaltada = false;
    }

    /**
     * @returns {number} Radio en px del canvas.
     */
    getRadio() {
        return this.radio;
    }

    /**
     * @param {number} radio Nuevo radio.
     * @returns {void}
     */
    setRadio(radio) {
        this.radio = radio;
    }

    /**
     * @returns {string} Tipo de la ficha.
     */
    getTipo() {
        return this.tipo;
    }

    /**
     * @param {string} tipo Nuevo tipo.
     * @returns {void}
     */
    setTipo(tipo) {
        this.tipo = tipo;
    }

    /**
     * @returns {Casillero} Casillero actual.
     */
    getCasillero() {
        return this.casillero;
    }

    /**
     * @param {Casillero} casillero Nuevo casillero.
     * @returns {void}
     */
    setCasillero(casillero) {
        this.casillero = casillero;
    }

    /**
     * @returns {boolean} true si está resaltada.
     */
    isResaltada() {
        return this.resaltada;
    }

    /**
     * @param {boolean} resaltada Nuevo estado.
     * @returns {void}
     */
    setResaltada(resaltada) {
        this.resaltada = resaltada;
    }

    /**
     * @param {Casillero} casillero 
     * @returns {void}
     */
    centrarEn(casillero) {
        this.posX = casillero.getCentroX();
        this.posY = casillero.getCentroY();
    }

    /**
     * @returns {void}
     */
    draw() {
        const ctx = this.context;
        ctx.save();
        ctx.translate(this.posX - this.radio, this.posY - this.radio);
        ctx.beginPath();
        ctx.arc(this.radio, this.radio, this.radio, 0, Math.PI * 2);
        ctx.fillStyle = this.fill;
        ctx.fill();
        if (this.resaltada) {
            ctx.lineWidth = this.radio * 0.15;
            ctx.strokeStyle = Ficha.colorResaltado;
            ctx.stroke();
        }
        ctx.closePath();
        ctx.restore();
    }

    /**
     * @param {number} x 
     * @param {number} y 
     * @returns {boolean} 
     */
    isPointInside(x, y) {
        const dx = this.posX - x;
        const dy = this.posY - y;
        return Math.sqrt(dx * dx + dy * dy) <= this.radio;
    }
}
