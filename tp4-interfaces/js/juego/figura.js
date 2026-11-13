class Figura {
    /**
     * @param {number} posX
     * @param {number} posY 
     * @param {string|CanvasPattern} fill
     * @param {CanvasRenderingContext2D} context
     */
    constructor(posX, posY, fill, context) {
        this.posX = posX;
        this.posY = posY;
        this.fill = fill;
        this.context = context;
    }

    /**
     * @returns {number} Posición X en el canvas.
     */
    getPosX() {
        return this.posX;
    }

    /**
     * Cambia la posición X.
     * @param {number} posX Nueva posición X.
     * @returns {void}
     */
    setPosX(posX) {
        this.posX = posX;
    }

    /**
     * @returns {number} Posición Y en el canvas.
     */
    getPosY() {
        return this.posY;
    }

    /**
     * @param {number} posY Nueva posición Y.
     * @returns {void}
     */
    setPosY(posY) {
        this.posY = posY;
    }

    /**
     * @returns {string|CanvasPattern} Relleno de la figura.
     */
    getFill() {
        return this.fill;
    }

    /**
     * @param {string|CanvasPattern} fill Nuevo relleno.
     * @returns {void}
     */
    setFill(fill) {
        this.fill = fill;
    }

    /**
     * @returns {CanvasRenderingContext2D}
     */
    getContext() {
        return this.context;
    }

    /**
     * @param {CanvasRenderingContext2D} context
     * @returns {void}
     */
    setContext(context) {
        this.context = context;
    }

    /**
     * @returns {void}
     */
    draw() {
        this.context.fillStyle = this.fill;
    }
}
