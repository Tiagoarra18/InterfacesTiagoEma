class Hint {
    /** Velocidad de la oscilación en radianes por segundo */
    static VELOCIDAD = 6;

    /**
     * @param {Casillero} casillero
     * @param {CanvasRenderingContext2D} context
     * @param {string} color 
     */
    constructor(casillero, context, color) {
        this.casillero = casillero;
        this.context = context;
        this.color = color;
    }

    /**
     * @returns {Casillero}
     */
    getCasillero() {
        return this.casillero;
    }

    /**
     * @param {number} tiempo Tiempo actual en segundos.
     * @returns {void}
     */
    draw(tiempo) {
        const oscilacion = Math.sin(tiempo * Hint.VELOCIDAD);
        this.dibujarAnillo(oscilacion);
        this.dibujarFlecha(Math.abs(oscilacion));
    }

    /**
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
     * @param {number} rebote 
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
