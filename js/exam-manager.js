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
        let preguntasTotales = [];
        
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
                    preguntasTotales.push({
                        texto: pregunta,
                        respuestaCorrecta: respuesta,
                        tema: nombreTema
                    });
                }
            }
        }
        
        // Mezclar todas las preguntas seleccionadas
        shuffleArray(preguntasTotales);
        
        // Seleccionar solo PREGUNTAS_POR_EXAMEN (20) preguntas
        preguntas = preguntasTotales.slice(0, PREGUNTAS_POR_EXAMEN);
        
        // Inicializar las respuestas del usuario
        userAnswers = new Array(preguntas.length).fill(null);
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
    
    // Crear array de índices
    const indices = Array.from({length: preguntas.length}, (_, i) => i);
    
    // Obtener índices aleatorios usando el nuevo método
    const indicesSeleccionados = getRandomSample(indices, cantidad);
    
    // Devolver las preguntas y respuestas correspondientes
    return indicesSeleccionados.map(idx => [preguntas[idx], respuestas[idx]]);
}

// Seleccionar elementos aleatorios de un array
function getRandomSample(array, count) {
    // Copia el array para no modificar el original
    const arrayCopy = [...array];
    const result = [];
    
    // Si pedimos más elementos de los disponibles, devolver todos mezclados
    if (count >= arrayCopy.length) {
        shuffleArray(arrayCopy);
        return arrayCopy;
    }
    
    // Utilizar un conjunto para registrar qué preguntas ya se han usado en sesiones anteriores
    // y reducir la probabilidad de repeticiones entre exámenes
    const sessionKey = `used_questions_${modoExamen}`;
    let usedQuestionsIndices = JSON.parse(localStorage.getItem(sessionKey) || '[]');
    
    // Si ya hemos usado demasiadas preguntas, resetear el historial para evitar quedarnos sin preguntas
    if (usedQuestionsIndices.length > array.length * 0.7) {
        usedQuestionsIndices = [];
        localStorage.setItem(sessionKey, JSON.stringify(usedQuestionsIndices));
    }
    
    // Ordenar los índices disponibles priorizando los que no se han usado recientemente
    const availableIndices = Array.from({length: arrayCopy.length}, (_, i) => i)
        .sort((a, b) => {
            const aUsed = usedQuestionsIndices.includes(a);
            const bUsed = usedQuestionsIndices.includes(b);
            if (aUsed && !bUsed) return 1;  // Priorizar los no usados
            if (!aUsed && bUsed) return -1;
            return 0.5 - Math.random(); // Si ambos están en la misma categoría, mezclar aleatoriamente
        });
    
    // Seleccionar los primeros "count" elementos
    const selectedIndices = availableIndices.slice(0, count);
    
    // Registrar estos índices como usados
    usedQuestionsIndices.push(...selectedIndices);
    localStorage.setItem(sessionKey, JSON.stringify([...new Set(usedQuestionsIndices)]));
    
    // Devolver los elementos seleccionados en su orden original
    selectedIndices.sort((a, b) => a - b);
    return selectedIndices.map(index => arrayCopy[index]);
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

    preguntas = [];

    if (examenIndex === 'full') {
        // Examen completo: todas las preguntas del tema
        for (let i = 0; i < preguntasDelTema.length; i++) {
            preguntas.push({
                texto: preguntasDelTema[i],
                respuestaCorrecta: respuestasDelTema[i],
                tema: temaNombre,
                original: true
            });
        }
    } else {
        // Calcular el rango de preguntas para este examen parcial
        const startIdx = examenIndex * PREGUNTAS_POR_EXAMEN;
        const endIdx = Math.min((examenIndex + 1) * PREGUNTAS_POR_EXAMEN, preguntasDelTema.length);

        // Primero, añadir las preguntas del rango específico
        for (let i = startIdx; i < endIdx; i++) {
            preguntas.push({
                texto: preguntasDelTema[i],
                respuestaCorrecta: respuestasDelTema[i],
                tema: temaNombre,
                original: true // Marca para saber que es una pregunta original del rango
            });
        }

        // Si no llegamos a PREGUNTAS_POR_EXAMEN, completar con preguntas aleatorias del mismo tema
        if (preguntas.length < PREGUNTAS_POR_EXAMEN) {
            // Crear un conjunto de índices ya usados para evitar repeticiones
            const indicesUsados = new Set();
            for (let i = startIdx; i < endIdx; i++) {
                indicesUsados.add(i);
            }

            // Crear un array con los índices disponibles (los que no están en el rango actual)
            const indicesDisponibles = [];
            for (let i = 0; i < preguntasDelTema.length; i++) {
                if (!indicesUsados.has(i)) {
                    indicesDisponibles.push(i);
                }
            }

            // Mezclar los índices disponibles para selección aleatoria
            shuffleArray(indicesDisponibles);

            // Añadir preguntas adicionales hasta completar PREGUNTAS_POR_EXAMEN
            const preguntasAdicionales = PREGUNTAS_POR_EXAMEN - preguntas.length;
            for (let i = 0; i < preguntasAdicionales && i < indicesDisponibles.length; i++) {
                const idx = indicesDisponibles[i];
                preguntas.push({
                    texto: preguntasDelTema[idx],
                    respuestaCorrecta: respuestasDelTema[idx],
                    tema: temaNombre,
                    original: false // Marca para saber que es una pregunta añadida aleatoriamente
                });
            }
        }
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
    
    // Actualizar el mensaje de estado en el menú principal
    if (totalPreguntas > 0) {
        const temasExitosos = Object.keys(datosPreguntas).length;
        const temasTotal = temasConfig.length;
        
        if (temasExitosos < temasTotal) {
            document.getElementById('status-bar').textContent = `Se cargaron ${temasExitosos} de ${temasTotal} temas. Algunos datos pueden estar incompletos. Total: ${totalPreguntas} preguntas disponibles.`;
        } else {
            document.getElementById('status-bar').textContent = `${temasExitosos} temas cargados con un total de ${totalPreguntas} preguntas disponibles.`;
        }
    }
}
