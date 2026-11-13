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

    /* Probado con hasta 31 fichas (el máximo real: la derrota nunca ocurre con las 32 iniciales,
       porque siempre hubo al menos 1 salto antes). Con 500 fallaba seguido cerca de ese máximo;
       con este valor, siempre encontró una disposición en menos de 400ms. */
    static MAX_INTENTOS_DISPOSICION = 20000;

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

    /**
     * Calcula a dónde puede saltar una ficha en cada dirección: un salto simple (sobre 1 ficha
     * adyacente, cae 2 posiciones más allá) o un salto doble (sobre 2 fichas consecutivas, cae 3
     * posiciones más allá). En una misma dirección nunca hay ambigüedad: el salto simple exige el
     * segundo paso vacío, el doble lo exige ocupado.
     * @param {Ficha} ficha Ficha a mover.
     * @returns {Array<{destino: Casillero, saltados: Casillero[]}>} Movimientos válidos, con las
     *   fichas que se comerían en cada uno (1 o 2).
     */
    obtenerDestinosValidos(ficha) {
        const origen = ficha.getCasillero();
        const movimientos = [];
        Tablero.DIRECCIONES.forEach(([df, dc]) => {
            const unPaso = this.obtenerCasillero(origen.getFila() + df, origen.getColumna() + dc);
            if (unPaso === null || unPaso.estaVacio()) {
                return;
            }
            const dosPasos = this.obtenerCasillero(origen.getFila() + 2 * df, origen.getColumna() + 2 * dc);
            if (dosPasos === null) {
                return;
            }
            if (dosPasos.estaVacio()) {
                movimientos.push({ destino: dosPasos, saltados: [unPaso] });
                return;
            }
            const tresPasos = this.obtenerCasillero(origen.getFila() + 3 * df, origen.getColumna() + 3 * dc);
            if (tresPasos !== null && tresPasos.estaVacio()) {
                movimientos.push({ destino: tresPasos, saltados: [unPaso, dosPasos] });
            }
        });
        return movimientos;
    }

    /**
     * Mueve la ficha del origen al destino y retira todas las fichas saltadas (1 en un salto simple,
     * 2 en uno doble).
     * @param {Casillero} origen Casillero de la ficha que salta.
     * @param {Casillero} destino Casillero vacío donde cae.
     * @param {Casillero[]} saltados Casilleros saltados, cada uno con su ficha a retirar.
     * @returns {Ficha[]} Las fichas retiradas.
     */
    aplicarMovimiento(origen, destino, saltados) {
        const ficha = origen.getFicha();
        const comidas = saltados.map((saltado) => {
            const comida = saltado.getFicha();
            saltado.setFicha(null);
            return comida;
        });
        this.fichas = this.fichas.filter((f) => !comidas.includes(f));
        origen.setFicha(null);
        destino.setFicha(ficha);
        ficha.setCasillero(destino);
        ficha.centrarEn(destino);
        return comidas;
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

    /**
     * Genera una disposición de `cantidad` casilleros que garantiza que el juego se puede ganar.
     * Se arma en reversa: empieza con 1 solo agujero marcado (equivalente a la victoria perfecta)
     * y deshace saltos al azar hasta marcar `cantidad` agujeros. Como cada paso deshace un salto
     * válido, rehacerlos en el orden inverso siempre termina en 1 sola ficha: por construcción,
     * la disposición final siempre tiene al menos un camino hasta ganar.
     * @param {number} cantidad Cantidad de agujeros a marcar (= fichas a reacomodar).
     * @returns {Casillero[]} Los casilleros elegidos.
     */
    generarDisposicionGanable(cantidad) {
        for (let intento = 0; intento < Tablero.MAX_INTENTOS_DISPOSICION; intento++) {
            const disposicion = this.intentarDisposicionGanable(cantidad);
            if (disposicion !== null) {
                return disposicion;
            }
        }
        throw new Error('No se pudo generar una disposición ganable');
    }

    /**
     * Un intento de armar la disposición. Devuelve null si en algún paso no hay saltos
     * inversos posibles, para que `generarDisposicionGanable` lo descarte y reintente.
     * @param {number} cantidad Cantidad de agujeros a marcar.
     * @returns {Casillero[]|null} Los casilleros elegidos, o null si el intento se trabó.
     */
    intentarDisposicionGanable(cantidad) {
        const casilleros = this.obtenerCasilleros();
        const marcados = new Set([casilleros[Math.floor(Math.random() * casilleros.length)]]);
        while (marcados.size < cantidad) {
            const saltos = this.obtenerSaltosInversos(marcados);
            if (saltos.length === 0) {
                return null;
            }
            const { origen, paso1, paso2 } = saltos[Math.floor(Math.random() * saltos.length)];
            marcados.delete(origen);
            marcados.add(paso1);
            marcados.add(paso2);
        }
        return Array.from(marcados);
    }

    /**
     * Busca, para cada agujero marcado y cada dirección, si existe el salto inverso: los 2
     * agujeros siguientes son válidos y todavía no están marcados.
     * @param {Set<Casillero>} marcados Agujeros marcados en este intento.
     * @returns {Array<{origen: Casillero, paso1: Casillero, paso2: Casillero}>} Saltos inversos posibles.
     */
    obtenerSaltosInversos(marcados) {
        const saltos = [];
        marcados.forEach((origen) => {
            Tablero.DIRECCIONES.forEach(([df, dc]) => {
                const paso1 = this.obtenerCasillero(origen.getFila() + df, origen.getColumna() + dc);
                const paso2 = this.obtenerCasillero(origen.getFila() + 2 * df, origen.getColumna() + 2 * dc);
                if (paso1 !== null && paso2 !== null && !marcados.has(paso1) && !marcados.has(paso2)) {
                    saltos.push({ origen, paso1, paso2 });
                }
            });
        });
        return saltos;
    }

    /**
     * Reasigna las fichas que ya estaban en el tablero a los casilleros de una disposición nueva,
     * sin crear ni retirar ninguna. Solo actualiza los vínculos ficha↔casillero; no mueve los
     * píxeles de cada ficha (eso lo anima quien llama a este método).
     * @param {Casillero[]} casilleros Casilleros destino, en la misma cantidad que `getFichas()`.
     * @returns {void}
     */
    reasignarFichas(casilleros) {
        this.obtenerCasilleros().forEach((casillero) => casillero.setFicha(null));
        this.fichas.forEach((ficha, i) => {
            casilleros[i].setFicha(ficha);
            ficha.setCasillero(casilleros[i]);
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
