class Figura {
    constructor(posX, posY, fill, context) {
        this.posX = posX;
        this.posY = posY;
        this.fill = fill;
        this.context = context;
    }

    getPosX() {
        return this.posX;
    }

    setPosX(posX) {
        this.posX = posX;
    }

    getPosY() {
        return this.posY;
    }

    setPosY(posY) {
        this.posY = posY;
    }

    getFill() {
        return this.fill;
    }

    setFill(fill) {
        this.fill = fill;
    }

    getContext() {
        return this.context;
    }

    setContext(context) {
        this.context = context;
    }

    draw() {
        this.context.fillStyle = this.fill;
    }
}
