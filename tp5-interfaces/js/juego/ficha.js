class Ficha extends Figura {
    static colorResaltado = '';

    constructor(posX, posY, radio, fill, context, tipo, casillero) {
        super(posX, posY, fill, context);
        this.radio = radio;
        this.tipo = tipo;
        this.casillero = casillero;
        this.resaltada = false;
    }

    getRadio() {
        return this.radio;
    }

    setRadio(radio) {
        this.radio = radio;
    }

    getTipo() {
        return this.tipo;
    }

    setTipo(tipo) {
        this.tipo = tipo;
    }

    getCasillero() {
        return this.casillero;
    }

    setCasillero(casillero) {
        this.casillero = casillero;
    }

    isResaltada() {
        return this.resaltada;
    }

    setResaltada(resaltada) {
        this.resaltada = resaltada;
    }

    centrarEn(casillero) {
        this.posX = casillero.getCentroX();
        this.posY = casillero.getCentroY();
    }

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

    isPointInside(x, y) {
        const dx = this.posX - x;
        const dy = this.posY - y;
        return Math.sqrt(dx * dx + dy * dy) <= this.radio;
    }
}
