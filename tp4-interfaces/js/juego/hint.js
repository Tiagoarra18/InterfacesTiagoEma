/**
 * Indicador animado sobre un agujero destino: un anillo que pulsa y una flecha que rebota.
 */
class Hint {
    /** Velocidad de la oscilación en radianes por segundo */
    static VELOCIDAD = 6;

    /**
     * Crea un hint sobre un casillero.
     * @param {Casillero} casillero Casillero destino que se marca.
     * @param {CanvasRenderingContext2D} context Contexto 2D donde se dibuja.
     * @param {string} color Color del anillo y de la flecha.
     */
    constructor(casillero, context, color) {
        this.casillero = casillero;
        this.context = context;
        this.color = color;
    }

    /**
     * Devuelve el casillero que marca.
     * @returns {Casillero} Casillero destino.
     */
    getCasillero() {
        return this.casillero;
    }

    /**
     * Dibuja el hint en un momento de la animación. El radio y la opacidad del anillo
     * oscilan con Math.sin(tiempo); la flecha sube y baja con su valor absoluto.
     * @param {number} tiempo Tiempo actual en segundos.
     * @returns {void}
     */
    draw(tiempo) {
        const oscilacion = Math.sin(tiempo * Hint.VELOCIDAD);
        this.dibujarAnillo(oscilacion);
        this.dibujarFlecha(Math.abs(oscilacion));
    }

    /**
     * Dibuja el anillo que pulsa alrededor del agujero.
     * @param {number} oscilacion Valor entre -1 y 1.
     * @returns {void}
     */
    dibujarAnillo(oscilacion) {
        const ctx = this.context;
        const radio = this.casillero.getRadio();
        ctx.save();
        ctx.globalAlpha = 0.55 + 0.35 * oscilacion;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = radio * 0.18;
        ctx.beginPath();
        ctx.arc(this.casillero.getCentroX(), this.casillero.getCentroY(), radio * (1.15 + 0.15 * oscilacion), 0, Math.PI * 2);
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
    }

    /**
     * Dibuja la flecha arriba del agujero, apuntando hacia él.
     * @param {number} rebote Valor entre 0 y 1 que la aleja del agujero.
     * @returns {void}
     */
    dibujarFlecha(rebote) {
        const ctx = this.context;
        const radio = this.casillero.getRadio();
        const centroX = this.casillero.getCentroX();
        const puntaY = this.casillero.getCentroY() - radio * 1.45 - rebote * radio * 0.4;
        const lado = radio * 0.8;
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(centroX, puntaY);
        ctx.lineTo(centroX - lado / 2, puntaY - lado);
        ctx.lineTo(centroX + lado / 2, puntaY - lado);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}
