/**
 * Figura base que se dibuja en el canvas: guarda su posición, su relleno y el contexto donde se dibuja.
 */
class Figura {
    /**
     * Crea una figura.
     * @param {number} posX Posición X en el canvas.
     * @param {number} posY Posición Y en el canvas.
     * @param {string|CanvasPattern} fill Relleno de la figura (color o pattern).
     * @param {CanvasRenderingContext2D} context Contexto 2D donde se dibuja.
     */
    constructor(posX, posY, fill, context) {
        this.posX = posX;
        this.posY = posY;
        this.fill = fill;
        this.context = context;
    }

    /**
     * Devuelve la posición X.
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
     * Devuelve la posición Y.
     * @returns {number} Posición Y en el canvas.
     */
    getPosY() {
        return this.posY;
    }

    /**
     * Cambia la posición Y.
     * @param {number} posY Nueva posición Y.
     * @returns {void}
     */
    setPosY(posY) {
        this.posY = posY;
    }

    /**
     * Devuelve el relleno.
     * @returns {string|CanvasPattern} Relleno de la figura.
     */
    getFill() {
        return this.fill;
    }

    /**
     * Cambia el relleno.
     * @param {string|CanvasPattern} fill Nuevo relleno.
     * @returns {void}
     */
    setFill(fill) {
        this.fill = fill;
    }

    /**
     * Devuelve el contexto donde se dibuja.
     * @returns {CanvasRenderingContext2D} Contexto 2D.
     */
    getContext() {
        return this.context;
    }

    /**
     * Cambia el contexto donde se dibuja.
     * @param {CanvasRenderingContext2D} context Nuevo contexto 2D.
     * @returns {void}
     */
    setContext(context) {
        this.context = context;
    }

    /**
     * Dibuja la figura. Cada subclase define su propia forma.
     * @returns {void}
     */
    draw() {
        this.context.fillStyle = this.fill;
    }
}
