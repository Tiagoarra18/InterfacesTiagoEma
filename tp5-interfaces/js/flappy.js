

function initFlappy() {
    const contenedor = document.getElementById('contenedor-flappy');
    if (!contenedor) return;

    // Referencias al DOM
    const pantallaInicio = document.getElementById('flappy-inicio');
    const escenario = document.getElementById('flappy-escenario');
    const pantallaFin = document.getElementById('flappy-cartel');
    const btnJugar = document.getElementById('flappy-btn-jugar');
    const btnReiniciar = document.getElementById('flappy-btn-reiniciar');
    
    const jugadorDOM = document.getElementById('flappy-jugador');
    const entidadesDOM = document.getElementById('flappy-entidades');
    
    const textoTiempo = document.getElementById('flappy-tiempo');
    const textoPuntos = document.getElementById('flappy-puntos');
    const textoRecord = document.getElementById('flappy-record');
    const textoPuntosFinal = document.getElementById('flappy-puntos-final');
    const textoRecordFinal = document.getElementById('flappy-record-final');

    // Estado del juego
    let bucleJuego = null;
    let tiempoRestante = 60; // segundos
    let puntos = 0;
    let record = localStorage.getItem('flappyRecord') || 0;
    let pausado = true;
    let tiempoAnterior = 0;
    let acumuladorGeneracion = 0;
    let invulnerable = false;
    let aperturaVertical = 250; // Dificultad decreciente

    const velocidadEscenario = 250; // px por segundo
    let entidades = []; // Obstáculos e items

    const jugadorFisica = {
        y: 300,
        vy: 0,
        gravedad: 900,
        impulso: -350,
        radio: 28,
        domElement: jugadorDOM
    };

    textoRecord.textContent = record;

   function resetearEstado() {
        tiempoRestante = 60;
        puntos = 0;
        aperturaVertical = 250;
        acumuladorTiempo = 0;
        acumuladorGeneracion = 0;
        proximoSpawn = 1.8;
        jugadorFisica.y = 300;
        jugadorFisica.vy = 0;
        entidades = [];
        entidadesDOM.textContent = '';
        invulnerable = false;
        textoPuntos.style.color = '';
        jugadorDOM.classList.remove('flappy__jugador--choque');
        escenario.classList.remove('flappy__escenario--pausado');
        actualizarHUD();
    }

    function actualizarHUD() {
        textoTiempo.textContent = `00:${tiempoRestante.toString().padStart(2, '0')}`;
        textoPuntos.textContent = puntos;
    }

    function aplicarImpulso() {
        if (pausado) return;
        jugadorFisica.vy = jugadorFisica.impulso;
        jugadorDOM.classList.remove('flappy__jugador--impulso');
        void jugadorDOM.offsetWidth; // Reflow forzar reinicio animación
        jugadorDOM.classList.add('flappy__jugador--impulso');
    }

    // Controles
    function registrarControles() {
        const handler = (e) => {
            if ((e.type === 'keydown' && (e.code === 'Space' || e.code === 'ArrowUp')) || e.type === 'mousedown') {
                e.preventDefault();
                aplicarImpulso();
            }
        };
        document.addEventListener('keydown', handler);
        escenario.addEventListener('mousedown', handler);
    }

    function generarEntidades() {
        const alturaEscenario = escenario.clientHeight || 635;
        const margenVertical = 60;
        const maxHuecoY = Math.max(margenVertical, alturaEscenario - aperturaVertical - margenVertical);
        const posicionHuecoY = Math.random() * (maxHuecoY - margenVertical) + margenVertical;
        
        // Poste Superior
        const posteSup = document.createElement('div');
        posteSup.className = 'flappy__obstaculo';
        posteSup.style.top = '0px';
        posteSup.style.height = `${posicionHuecoY}px`;
        
        // Poste Inferior
        const posteInf = document.createElement('div');
        posteInf.className = 'flappy__obstaculo';
        posteInf.style.top = `${posicionHuecoY + aperturaVertical}px`;
        posteInf.style.bottom = '0px';
        
        const xInicial = escenario.clientWidth;
        entidadesDOM.appendChild(posteSup);
        entidadesDOM.appendChild(posteInf);
        
        entidades.push({ tipo: 'poste', x: xInicial, ancho: 72, domes: [posteSup, posteInf], superado: false });

        // Posibilidad de ítem (Trofeo 20% suma puntos, Tarjeta 20% resta puntos sin terminar el juego)
        const rand = Math.random();
        if (rand < 0.4) {
            const itemDOM = document.createElement('div');
            const esTrofeo = rand < 0.2;
            itemDOM.className = `flappy__item flappy__item--${esTrofeo ? 'trofeo' : 'tarjeta'}`;
            const itemY = Math.random() * (alturaEscenario - 120) + 60;
            itemDOM.style.top = `${itemY}px`;
            entidadesDOM.appendChild(itemDOM);
            entidades.push({ 
                tipo: esTrofeo ? 'trofeo' : 'tarjeta', 
                x: xInicial + 130 + Math.random() * 80, 
                y: itemY,
                ancho: 40, alto: 40,
                domes: [itemDOM], superado: false, consumido: false
            });
        }

        // El hueco se va achicando pero nunca mide menos de 135px (la pelota mide 56px)
        aperturaVertical = Math.max(135, aperturaVertical - 6);
    }

  function actualizarEntidades(dt) {
        for (let i = entidades.length - 1; i >= 0; i--) {
            const ent = entidades[i];
            ent.x -= velocidadEscenario * dt;
            
            ent.domes.forEach(dom => { dom.style.left = `${ent.x}px`; });

            // Eliminar entidades fuera de pantalla
            if (ent.x + ent.ancho < 0) {
                ent.domes.forEach(dom => dom.remove());
                entidades.splice(i, 1);
                continue;
            }

            // Colisiones y lógica de puntaje
            const rectJugador = jugadorDOM.getBoundingClientRect();
            
            if (ent.tipo === 'poste') {
                const rSup = ent.domes[0].getBoundingClientRect();
                const rInf = ent.domes[1].getBoundingClientRect();

                // Chocar con un poste termina el juego
                if (chocan(rectJugador, rSup) || chocan(rectJugador, rInf)) {
                    jugadorDOM.classList.add('flappy__jugador--choque');
                    finPartida('¡Chocaste con el poste!');
                    return;
                }

                // Superar poste (suma puntos)
                if (!ent.superado && ent.x + ent.ancho < jugadorDOM.offsetLeft) {
                    ent.superado = true;
                    puntos += 5;
                    actualizarHUD();
                }
            } else if (!ent.consumido) {
                const rItem = ent.domes[0].getBoundingClientRect();
                if (chocan(rectJugador, rItem)) {
                    ent.consumido = true;
                    ent.domes[0].hidden = true;
                    
                    if (ent.tipo === 'trofeo') {
                        puntos += 15;
                        textoPuntos.style.color = '#33FF00';
                        setTimeout(() => { textoPuntos.style.color = ''; }, 500);
                    } else if (ent.tipo === 'tarjeta') {
                        puntos = Math.max(0, puntos - 10);
                        textoPuntos.style.color = '#FF0000';
                        setTimeout(() => { textoPuntos.style.color = ''; }, 500);

                        jugadorDOM.classList.remove('flappy__jugador--choque');
                        void jugadorDOM.offsetWidth;
                        jugadorDOM.classList.add('flappy__jugador--choque');
                    }
                    actualizarHUD();
                }
            }
        }
    }

    function chocan(r1, r2) {
        // Reducir hitbox del jugador visualmente
        const padding = 5;
        return !(r1.right - padding < r2.left || 
                 r1.left + padding > r2.right || 
                 r1.bottom - padding < r2.top || 
                 r1.top + padding > r2.bottom);
    }

    function penalizarColision(esTarjeta = false) {
        if (!esTarjeta) {
            invulnerable = true;
            jugadorDOM.classList.add('flappy__jugador--choque');
            setTimeout(() => {
                invulnerable = false;
                jugadorDOM.classList.remove('flappy__jugador--choque');
            }, 1500);
        }
        puntos = Math.max(0, puntos - 10);
        actualizarHUD();
    }

    function finPartida(motivo = '¡Tiempo Terminado!') {
        pausado = true;
        escenario.classList.add('flappy__escenario--pausado');
        
        const tituloCartel = document.getElementById('flappy-titulo-cartel');
        if (tituloCartel) tituloCartel.textContent = motivo;

        if (puntos > record) {
            record = puntos;
            localStorage.setItem('flappyRecord', record);
        }
        textoPuntosFinal.textContent = puntos;
        textoRecordFinal.textContent = record;
        
        pantallaFin.hidden = false;
    }

    // Declara estas dos variables justo debajo de "let acumuladorGeneracion = 0;" al inicio de initFlappy
    let acumuladorTiempo = 0;
    let proximoSpawn = 1.8;

    function loop(tiempoActual) {
        if (pausado) return;
        
        let dt = (tiempoActual - tiempoAnterior) / 1000;
        if (dt > 0.1) dt = 0.1; // Evita saltos bruscos y encimamiento al hacer Alt+Tab
        tiempoAnterior = tiempoActual;

        // Reloj de 60 segundos
        acumuladorTiempo += dt;
        if (acumuladorTiempo >= 1) {
            acumuladorTiempo -= 1;
            tiempoRestante -= 1;
            actualizarHUD();
            
            if (tiempoRestante <= 0) {
                finPartida('¡Tiempo Terminado!');
                return;
            }
        }

        // Generación de postes a distancia horizontal variable
        acumuladorGeneracion += dt;
        if (acumuladorGeneracion >= proximoSpawn) {
            acumuladorGeneracion = 0;
            proximoSpawn = 1.6 + Math.random() * 1.2; // Entre 1.6s y 2.8s
            generarEntidades();
        }

        // Física del jugador
        jugadorFisica.vy += jugadorFisica.gravedad * dt;
        jugadorFisica.y += jugadorFisica.vy * dt;
        
        // Límites de pantalla (techo y suelo)
        const limiteInferior = escenario.clientHeight - jugadorFisica.radio * 2;
        if (jugadorFisica.y > limiteInferior) {
            jugadorFisica.y = limiteInferior;
            jugadorFisica.vy = 0;
        } else if (jugadorFisica.y < 0) {
            jugadorFisica.y = 0;
            jugadorFisica.vy = 0;
        }

        jugadorDOM.style.top = `${jugadorFisica.y}px`;

        actualizarEntidades(dt);

        if (!pausado) {
            bucleJuego = requestAnimationFrame(loop);
        }
    }

 function iniciarJuego() {
    resetearEstado();
    pantallaInicio.hidden = true;
    pantallaFin.hidden = true;
    escenario.hidden = false;
    
    pausado = false;
    tiempoAnterior = performance.now();
    bucleJuego = requestAnimationFrame(loop);
}

    // Listeners
    btnJugar.addEventListener('click', iniciarJuego);
    btnReiniciar.addEventListener('click', iniciarJuego);
    registrarControles();
}
// Agrega esto al final de tu archivo flappy.js
document.addEventListener('DOMContentLoaded', initFlappy);