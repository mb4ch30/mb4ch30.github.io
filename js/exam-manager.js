/**
 * Funciones relacionadas con la generación y gestión de exámenes
 */

// Variables globales para el examen
let preguntas = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let modoExamen = ""; // "random", "full" o "theme"
let selectedTheme = "";

// Iniciar el examen
function startExam(modo) {
    modoExamen = modo;
    generateExam(modo);
    showQuestion(0);
    
    // Limpiar el mensaje del status bar
    document.getElementById('status-bar').textContent = '';
    
    // Cambiar a la pantalla de examen
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('exam-screen').classList.remove('hidden');
}

// Generar examen
function generateExam(modo) {
    preguntas = [];
    userAnswers = [];
    
    if (modo === 'random') {
        // Modo aleatorio: seleccionar preguntas según las cantidades configuradas
        for (const tema of temasConfig) {
            const nombreTema = tema.nombre;
            const cantidad = tema.cantidad;
            
            if (datosPreguntas[nombreTema] && datosPreguntas[nombreTema].preguntas.length > 0) {
                const preguntasTema = datosPreguntas[nombreTema].preguntas;
                const respuestasTema = datosPreguntas[nombreTema].respuestas;
                
                const seleccionadas = seleccionarPreguntasAleatorias(
                    preguntasTema, 
                    respuestasTema, 
                    cantidad
                );
                
                for (const [pregunta, respuesta] of seleccionadas) {
                    preguntas.push({
                        texto: pregunta,
                        respuestaCorrecta: respuesta,
                        tema: nombreTema
                    });
                    userAnswers.push(null);
                }
            }
        }
        
        // Mezclar las preguntas
        shuffleArray(preguntas);
    } else {
        // Modo examen completo: incluir todas las preguntas
        for (const nombreTema in datosPreguntas) {
            const preguntasTema = datosPreguntas[nombreTema].preguntas;
            const respuestasTema = datosPreguntas[nombreTema].respuestas;
            
            for (let i = 0; i < preguntasTema.length; i++) {
                preguntas.push({
                    texto: preguntasTema[i],
                    respuestaCorrecta: respuestasTema[i],
                    tema: nombreTema
                });
                userAnswers.push(null);
            }
        }
        
        // Mostrar en orden por tema
        preguntas.sort((a, b) => {
            // Primero ordenar por tema
            const temaIndexA = Object.keys(datosPreguntas).indexOf(a.tema);
            const temaIndexB = Object.keys(datosPreguntas).indexOf(b.tema);
            
            if (temaIndexA !== temaIndexB) return temaIndexA - temaIndexB;
            
            // Luego por número de pregunta
            const numA = parseInt(a.texto.match(/^(\d+)\./)[1]);
            const numB = parseInt(b.texto.match(/^(\d+)\./)[1]);
            return numA - numB;
        });
    }
}

// Seleccionar preguntas aleatorias
function seleccionarPreguntasAleatorias(preguntas, respuestas, cantidad) {
    if (preguntas.length < cantidad) {
        cantidad = preguntas.length;
    }
    
    // Crear pares de índice y pregunta
    const paresPreguntas = preguntas.map((p, i) => [i, p]);
    
    // Seleccionar aleatoriamente
    const seleccionados = getRandomSample(paresPreguntas, cantidad);
    
    // Ordenar por índice original
    seleccionados.sort((a, b) => a[0] - b[0]);
    
    // Devolver las preguntas y respuestas correspondientes
    return seleccionados.map(([idx, pregunta]) => [pregunta, respuestas[idx]]);
}

// Seleccionar elementos aleatorios de un array
function getRandomSample(array, count) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Mezclar array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Iniciar un examen por tema
function startThemeExam(temaNombre, examenIndex) {
    modoExamen = "theme";
    
    // Obtener los datos del tema y el examen seleccionado
    const preguntasDelTema = datosPreguntas[temaNombre]?.preguntas || [];
    const respuestasDelTema = datosPreguntas[temaNombre]?.respuestas || [];
    
    // Calcular el rango de preguntas para este examen
    const startIdx = examenIndex * PREGUNTAS_POR_EXAMEN;
    const endIdx = Math.min((examenIndex + 1) * PREGUNTAS_POR_EXAMEN, preguntasDelTema.length);
    
    // Crear las preguntas formateadas para este examen
    preguntas = [];
    for (let i = startIdx; i < endIdx; i++) {
        preguntas.push({
            texto: preguntasDelTema[i],
            respuestaCorrecta: respuestasDelTema[i],
            tema: temaNombre
        });
    }
    
    // Inicializar las respuestas del usuario
    userAnswers = new Array(preguntas.length).fill(null);
    
    // Cambiar a la pantalla de examen
    document.getElementById('exam-number-screen').classList.add('hidden');
    document.getElementById('exam-screen').classList.remove('hidden');
    
    // Mostrar la primera pregunta
    showQuestion(0);
}

// Reiniciar el mismo examen
function restartExam() {
    // Reiniciar respuestas del usuario
    userAnswers = userAnswers.map(() => null);
    
    // Volver a la pantalla de examen
    document.getElementById('results-screen').classList.add('hidden');
    document.getElementById('exam-screen').classList.remove('hidden');
    
    // Mostrar la primera pregunta
    showQuestion(0);
}

// Generar un nuevo examen
function newExam() {
    // Volver al menú principal
    document.getElementById('results-screen').classList.add('hidden');
    document.getElementById('main-menu').classList.remove('hidden');
}
