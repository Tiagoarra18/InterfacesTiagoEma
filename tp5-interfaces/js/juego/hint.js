/**
 * Marca una ficha como destino inválido mientras se arrastra otra: un aro rojo pulsante sobre ella.
 */
class Hint {
    static VELOCIDAD = 6;

    /**
     * Crea un hint sobre una ficha.
     * @param {Ficha} ficha Ficha que se marca como destino inválido.
     * @param {CanvasRenderingContext2D} context Contexto 2D donde se dibuja.
     * @param {string} color Color del aro.
     */
    constructor(ficha, context, color) {
        this.ficha = ficha;
        this.context = context;
        this.color = color;
    }

    /**
     * Dibuja el aro en un momento de la animación.
     * @param {number} tiempo Tiempo actual en segundos.
     * @returns {void}
     */
    draw(tiempo) {
        const oscilacion = Math.sin(tiempo * Hint.VELOCIDAD);
        this.dibujarAnillo(oscilacion);
    }

    /**
     * Dibuja el aro que pulsa alrededor de la ficha: su radio y su opacidad oscilan con el tiempo.
     * @param {number} oscilacion Valor entre -1 y 1.
     * @returns {void}
     */
    dibujarAnillo(oscilacion) {
        const ctx = this.context;
        const radio = this.ficha.getRadio();
        ctx.save();
        ctx.globalAlpha = 0.55 + 0.35 * oscilacion;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = radio * 0.18;
        ctx.beginPath();
        ctx.arc(this.ficha.getPosX(), this.ficha.getPosY(), radio * (1.15 + 0.15 * oscilacion), 0, Math.PI * 2);
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
    }
}
