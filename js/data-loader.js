/**
 * Funciones de carga de datos
 * Maneja la obtención y procesamiento de los archivos de preguntas y respuestas
 */

// Variables globales para datos
let datosPreguntas = {};
let totalPreguntas = 0;

// Cargar datos de preguntas y respuestas
async function cargarDatos() {
    const statusBar = document.getElementById('status-bar');
    statusBar.textContent = "Cargando datos...";
    
    let temasExitosos = 0;
    let temasTotal = temasConfig.length;
    totalPreguntas = 0; // Reiniciar el contador de preguntas
    
    for (const tema of temasConfig) {
        try {
            // Cargar archivo de preguntas
            const respuestaPreguntas = await fetch(tema.preguntas);
            
            if (!respuestaPreguntas.ok) {
                throw new Error(`Error al cargar ${tema.preguntas}: ${respuestaPreguntas.status}`);
            }
            
            const contenidoPreguntas = await respuestaPreguntas.text();
            const preguntas = parsePreguntasFile(contenidoPreguntas);
            
            // Actualizar contador de preguntas
            totalPreguntas += preguntas.length;
            
            // Cargar archivo de respuestas
            const respuestaRespuestas = await fetch(tema.respuestas);
            
            if (!respuestaRespuestas.ok) {
                throw new Error(`Error al cargar ${tema.respuestas}: ${respuestaRespuestas.status}`);
            }
            
            const contenidoRespuestas = await respuestaRespuestas.text();
            const respuestas = parseRespuestasFile(contenidoRespuestas);
            
            // Guardar datos
            if (!datosPreguntas[tema.nombre]) {
                datosPreguntas[tema.nombre] = {};
            }
            
            datosPreguntas[tema.nombre].preguntas = preguntas;
            datosPreguntas[tema.nombre].respuestas = respuestas;
            
            temasExitosos++;
            
        } catch (error) {
            console.error(`Error al cargar datos del ${tema.nombre}:`, error);
            statusBar.textContent += `\nError al cargar ${tema.nombre}: ${error.message}`;
        }
    }
    
    if (temasExitosos === 0) {
        statusBar.textContent = "No se pudieron cargar los datos. Asegúrate de estar usando un servidor web local.";
        // Desactivar botones si no hay datos
        document.getElementById('start-random-exam').disabled = true;
        document.getElementById('start-full-exam').disabled = true;
    } else if (temasExitosos < temasTotal) {
        // Solo mostrar en la pantalla principal
        statusBar.textContent = `Se cargaron ${temasExitosos} de ${temasTotal} temas. Algunos datos pueden estar incompletos. Total: ${totalPreguntas} preguntas disponibles.`;
    } else {
        // Solo mostrar en la pantalla principal
        statusBar.textContent = `${temasExitosos} temas cargados con un total de ${totalPreguntas} preguntas disponibles.`;
    }
    
    return temasExitosos > 0;
}

// Parsear archivo de preguntas
function parsePreguntasFile(text) {
    const preguntasRaw = text.split(/\n\s*\n/).filter(p => p.trim());
    const preguntas = [];
    
    for (const pregunta of preguntasRaw) {
        if (/^\d+\./.test(pregunta.trim())) {
            preguntas.push(pregunta.trim());
        }
    }
    
    return preguntas;
}

// Parsear archivo de respuestas
function parseRespuestasFile(text) {
    return text.split('\n')
        .filter(line => line.trim())
        .map(line => line.trim());
}
