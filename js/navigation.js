/**
 * Funciones de navegación y gestión de interfaz de usuario
 */

// Función para mostrar la pantalla de selección de temas
function showThemeSelection() {
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('theme-selection-screen').classList.remove('hidden');
    document.getElementById('exam-screen').classList.add('hidden');
    document.getElementById('results-screen').classList.add('hidden');
    document.getElementById('exam-number-screen').classList.add('hidden');
    
    // Generar botones para cada tema
    const themeButtons = document.getElementById('theme-buttons');
    themeButtons.innerHTML = '';
    
    temasConfig.forEach(tema => {
        const button = document.createElement('button');
        button.textContent = `${tema.nombre} (${datosPreguntas[tema.nombre]?.preguntas?.length || 0} preguntas)`;
        button.className = 'theme-button';
        button.addEventListener('click', () => selectTheme(tema.nombre));
        themeButtons.appendChild(button);
    });
}

// Función para seleccionar un tema y mostrar los exámenes disponibles
function selectTheme(temaNombre) {
    selectedTheme = temaNombre;
    document.getElementById('theme-selection-screen').classList.add('hidden');
    document.getElementById('exam-number-screen').classList.remove('hidden');
    
    // Encontrar el tema seleccionado
    const preguntas = datosPreguntas[temaNombre]?.preguntas || [];
    const respuestas = datosPreguntas[temaNombre]?.respuestas || [];
    
    // Validar que haya preguntas y respuestas para este tema
    if (!preguntas.length || !respuestas.length) {
        console.error(`No hay preguntas o respuestas disponibles para el tema ${temaNombre}`);
        const examInfo = document.getElementById('exam-number-info');
        examInfo.textContent = `Error: No hay preguntas disponibles para ${temaNombre}`;
        return;
    }
    
    // Calcular cuántos exámenes completos de PREGUNTAS_POR_EXAMEN preguntas hay
    const numExamenes = Math.ceil(preguntas.length / PREGUNTAS_POR_EXAMEN);
    
    // Generar información sobre este tema
    const examInfo = document.getElementById('exam-number-info');
    examInfo.textContent = `${temaNombre}: ${preguntas.length} preguntas disponibles - ${numExamenes} exámenes de ${PREGUNTAS_POR_EXAMEN} preguntas`;
    
    // Generar botones para cada examen
    const examButtons = document.getElementById('exam-number-buttons');
    examButtons.innerHTML = '';

    // --- NUEVO: Botón para examen completo del tema ---
    const fullExamButton = document.createElement('button');
    fullExamButton.textContent = `Examen completo (${preguntas.length} preguntas)`;
    fullExamButton.className = 'exam-button exam-full-button';
    fullExamButton.addEventListener('click', () => {
        // Llama a startThemeExam con un flag especial para examen completo
        startThemeExam(temaNombre, 'full');
    });
    examButtons.appendChild(fullExamButton);
    // --- FIN NUEVO ---

    for (let i = 0; i < numExamenes; i++) {
        const startIdx = i * PREGUNTAS_POR_EXAMEN;
        const endIdx = Math.min((i + 1) * PREGUNTAS_POR_EXAMEN, preguntas.length);
        const preguntasEnRango = endIdx - startIdx;
        const button = document.createElement('button');
        
        // Si es el último examen y no tiene PREGUNTAS_POR_EXAMEN preguntas completas, se complementará con preguntas aleatorias
        if (i === numExamenes - 1 && preguntasEnRango < PREGUNTAS_POR_EXAMEN) {
            button.textContent = `Examen ${i + 1} (${preguntasEnRango} preguntas originales + ${PREGUNTAS_POR_EXAMEN - preguntasEnRango} aleatorias)`;
        } else {
            button.textContent = `Examen ${i + 1} (${PREGUNTAS_POR_EXAMEN} preguntas)`;
        }
        
        button.className = 'exam-button';
        button.addEventListener('click', () => startThemeExam(temaNombre, i));
        examButtons.appendChild(button);
    }
}

// Función para volver al menú principal
function showMainMenu() {
    document.getElementById('main-menu').classList.remove('hidden');
    document.getElementById('theme-selection-screen').classList.add('hidden');
    document.getElementById('exam-number-screen').classList.add('hidden');
    document.getElementById('exam-screen').classList.add('hidden');
    document.getElementById('results-screen').classList.add('hidden');
    
    // Actualizar el mensaje de estado al volver al menú principal
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

// Función para volver desde los resultados según el modo de examen
function goBackFromResults() {
    document.getElementById('results-screen').classList.add('hidden');
    
    if (modoExamen === 'theme') {
        // Si estamos en examen por tema, volver a la pantalla de selección de exámenes
        document.getElementById('exam-number-screen').classList.remove('hidden');
    } else {
        // Si estamos en examen aleatorio o completo, volver al menú principal
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
}
