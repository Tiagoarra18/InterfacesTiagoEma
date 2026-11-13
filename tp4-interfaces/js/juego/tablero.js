class Tablero {
    static ANCHO_IMAGEN = 1599;
    static ALTO_IMAGEN = 984;

    static CENTROS_X = [540, 626, 715, 801, 886, 975, 1061].map((x) => x / Tablero.ANCHO_IMAGEN);
    static CENTROS_Y = [268, 344, 417, 490, 564, 642, 724].map((y) => y / Tablero.ALTO_IMAGEN);
    static DIAMETRO_AGUJERO = 61;
    static TAMANO = 7;
    static CENTRO = 3;

    static FACTOR_FICHA = 1.08;

    static DIRECCIONES = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    constructor(imagen, context, ancho, alto) {
        this.imagen = imagen;
        this.context = context;
        this.ancho = ancho;
        this.alto = alto;

        const escala = Math.min(ancho / Tablero.ANCHO_IMAGEN, alto / Tablero.ALTO_IMAGEN);
        this.radioAgujero = (Tablero.DIAMETRO_AGUJERO / 2) * escala;
        this.radioFicha = this.radioAgujero * Tablero.FACTOR_FICHA;
        this.fichas = [];
        this.casilleros = this.crearCasilleros();
    }

    crearCasilleros() {
        const matriz = [];
        for (let fila = 0; fila < Tablero.TAMANO; fila++) {
            matriz.push([]);
            for (let columna = 0; columna < Tablero.TAMANO; columna++) {
                const casillero = this.esPosicionValida(fila, columna)
                    ? new Casillero(fila, columna, Tablero.CENTROS_X[columna] * this.ancho,
                        Tablero.CENTROS_Y[fila] * this.alto, this.radioAgujero)
                    : null;
                matriz[fila].push(casillero);
            }
        }
        return matriz;
    }

    esPosicionValida(fila, columna) {
        if (fila < 0 || fila >= Tablero.TAMANO || columna < 0 || columna >= Tablero.TAMANO) {
            return false;
        }
        const esBrazoCentral = fila >= 2 && fila <= 4;
        return esBrazoCentral || (columna >= 2 && columna <= 4);
    }

    obtenerCasillero(fila, columna) {
        return this.esPosicionValida(fila, columna) ? this.casilleros[fila][columna] : null;
    }

    obtenerCasilleros() {
        return this.casilleros.flat().filter((casillero) => casillero !== null);
    }

    obtenerDestinosValidos(ficha) {
        const origen = ficha.getCasillero();
        const movimientos = [];
        Tablero.DIRECCIONES.forEach(([df, dc]) => {
            const saltado = this.obtenerCasillero(origen.getFila() + df, origen.getColumna() + dc);
            const destino = this.obtenerCasillero(origen.getFila() + 2 * df, origen.getColumna() + 2 * dc);
            if (saltado !== null && destino !== null && !saltado.estaVacio() && destino.estaVacio()) {
                movimientos.push({ destino, saltado });
            }
        });
        return movimientos;
    }

    obtenerDestinosInvalidos(ficha) {
        const origen = ficha.getCasillero();
        const validos = this.obtenerDestinosValidos(ficha);
        const casilleros = this.obtenerCasilleros();
        const movimientosI = [];
        for (const casillero of casilleros) {
            let invalido = 0;
            for (let i = 0; i < validos.length && invalido === 0; i++) {
                if (validos[i].destino === casillero) {
                    invalido = 1;
                }
            }
            if (invalido === 0) {
                movimientosI.push(casillero);
            }
            invalido = 0;
        }
        return movimientosI;
    }

    aplicarMovimiento(origen, destino) {
        const ficha = origen.getFicha();
        const saltado = this.obtenerCasillero(
            (origen.getFila() + destino.getFila()) / 2,
            (origen.getColumna() + destino.getColumna()) / 2
        );
        const comida = saltado.getFicha();
        saltado.setFicha(null);
        this.fichas = this.fichas.filter((f) => f !== comida);
        origen.setFicha(null);
        destino.setFicha(ficha);
        ficha.setCasillero(destino);
        ficha.centrarEn(destino);
        return comida;
    }

    hayMovimientosPosibles() {
        return this.fichas.some((ficha) => this.obtenerDestinosValidos(ficha).length > 0);
    }

    contarFichas() {
        return this.fichas.length;
    }

    esCentro(casillero) {
        return casillero.getFila() === Tablero.CENTRO && casillero.getColumna() === Tablero.CENTRO;
    }

    reiniciar(variantes) {
        const tipos = Object.keys(variantes);
        this.fichas = [];
        this.obtenerCasilleros().forEach((casillero) => {
            casillero.setFicha(null);
            if (this.esCentro(casillero)) {
                return;
            }
            const tipo = tipos[Math.floor(Math.random() * tipos.length)];
            const ficha = new Ficha(casillero.getCentroX(), casillero.getCentroY(), this.radioFicha,
                variantes[tipo], this.context, tipo, casillero);
            casillero.setFicha(ficha);
            this.fichas.push(ficha);
        });
    }

    getFichas() {
        return this.fichas;
    }

    getRadioFicha() {
        return this.radioFicha;
    }

    draw() {
        this.context.drawImage(this.imagen, 0, 0, this.ancho, this.alto);
    }
}
