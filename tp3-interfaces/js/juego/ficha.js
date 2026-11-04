/**
 * Ficha (pelota) del Peg Football: un círculo relleno con el pattern de su variante.
 */
class Ficha extends Figura {
    /** Color del anillo que marca la ficha levantada (lo carga Juego desde variables.css) */
    static colorResaltado = '';

    /**
     * Crea una ficha.
     * @param {number} posX Centro X en el canvas.
     * @param {number} posY Centro Y en el canvas.
     * @param {number} radio Radio de la ficha en px del canvas.
     * @param {CanvasPattern} fill Pattern de la variante de la ficha.
     * @param {CanvasRenderingContext2D} context Contexto 2D donde se dibuja.
     * @param {string} tipo Tipo visual: 'clasica', 'dorada', 'roja' o 'celeste'.
     * @param {Casillero} casillero Casillero donde está la ficha.
     */
    constructor(posX, posY, radio, fill, context, tipo, casillero) {
        super(posX, posY, fill, context);
        this.radio = radio;
        this.tipo = tipo;
        this.casillero = casillero;
        this.resaltada = false;
    }

    /**
     * Devuelve el radio.
     * @returns {number} Radio en px del canvas.
     */
    getRadio() {
        return this.radio;
    }

    /**
     * Cambia el radio.
     * @param {number} radio Nuevo radio.
     * @returns {void}
     */
    setRadio(radio) {
        this.radio = radio;
    }

    /**
     * Devuelve el tipo visual.
     * @returns {string} Tipo de la ficha.
     */
    getTipo() {
        return this.tipo;
    }

    /**
     * Cambia el tipo visual.
     * @param {string} tipo Nuevo tipo.
     * @returns {void}
     */
    setTipo(tipo) {
        this.tipo = tipo;
    }

    /**
     * Devuelve el casillero donde está la ficha.
     * @returns {Casillero} Casillero actual.
     */
    getCasillero() {
        return this.casillero;
    }

    /**
     * Cambia el casillero de la ficha.
     * @param {Casillero} casillero Nuevo casillero.
     * @returns {void}
     */
    setCasillero(casillero) {
        this.casillero = casillero;
    }

    /**
     * Indica si la ficha está resaltada (levantada).
     * @returns {boolean} true si está resaltada.
     */
    isResaltada() {
        return this.resaltada;
    }

    /**
     * Marca o desmarca la ficha como resaltada.
     * @param {boolean} resaltada Nuevo estado.
     * @returns {void}
     */
    setResaltada(resaltada) {
        this.resaltada = resaltada;
    }

    /**
     * Mueve la ficha al centro de un casillero.
     * @param {Casillero} casillero Casillero donde se centra.
     * @returns {void}
     */
    centrarEn(casillero) {
        this.posX = casillero.getCentroX();
        this.posY = casillero.getCentroY();
    }

    /**
     * Dibuja la ficha: traslada el origen a su esquina para que el pattern quede alineado
     * y la recorta en círculo con arc(). Si está resaltada, le agrega un anillo.
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
     * Indica si un punto cae dentro de la ficha (distancia al centro menor o igual al radio).
     * @param {number} x Coordenada X en px del canvas.
     * @param {number} y Coordenada Y en px del canvas.
     * @returns {boolean} true si el punto está dentro.
     */
    isPointInside(x, y) {
        const dx = this.posX - x;
        const dy = this.posY - y;
        return Math.sqrt(dx * dx + dy * dy) <= this.radio;
    }
}
