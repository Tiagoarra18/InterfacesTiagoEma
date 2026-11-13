class Hint {
    static VELOCIDAD = 6;

    constructor(casillero, context, color) {
        this.casillero = casillero;
        this.context = context;
        this.color = color;
    }

    getCasillero() {
        return this.casillero;
    }

    draw(tiempo) {
        const oscilacion = Math.sin(tiempo * Hint.VELOCIDAD);
        this.dibujarAnillo(oscilacion);
        this.dibujarFlecha(Math.abs(oscilacion));
    }

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
