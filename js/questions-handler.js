/**
 * Funciones para la gestión de preguntas, respuestas y resultados
 */

// Mostrar pregunta actual
function showQuestion(index) {
    if (index < 0 || index >= preguntas.length) return;
    
    const pregunta = preguntas[index];
    const preguntaFormateada = formatPregunta(pregunta.texto);
      // Actualizar información de la pregunta
    const questionInfo = document.getElementById('question-info');
    
    // Determinar si mostrar etiqueta adicional para preguntas aleatorias
    let etiquetaAdicional = '';
    if (modoExamen === 'theme' && pregunta.hasOwnProperty('original') && pregunta.original === false) {
        etiquetaAdicional = '<span class="random-question">(Pregunta complementaria)</span>';
    }
    
    questionInfo.innerHTML = `
        <span>Pregunta ${index + 1} de ${preguntas.length}</span>
        <span>${pregunta.tema} ${etiquetaAdicional}</span>
    `;
    
    // Actualizar texto de la pregunta
    const questionText = document.getElementById('question-text');
    questionText.innerHTML = preguntaFormateada.text;
    
    // Crear opciones
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    ['A', 'B', 'C'].forEach(letra => {
        const opcion = document.createElement('div');
        opcion.className = 'option';
        if (userAnswers[index] === letra) {
            opcion.classList.add('selected');
        }
        opcion.innerHTML = `<strong>${letra})</strong> ${preguntaFormateada.options[letra]}`;
        opcion.addEventListener('click', () => selectOption(letra));
        optionsContainer.appendChild(opcion);
    });
      // Actualizar botones de navegación
    const prevQuestionButton = document.getElementById('prev-question');
    const nextQuestionButton = document.getElementById('next-question');
    const finishExamButton = document.getElementById('finish-exam');
    
    prevQuestionButton.disabled = index === 0;
    const isLastQuestion = index === preguntas.length - 1;
    nextQuestionButton.textContent = isLastQuestion ? 'Finalizar Examen' : 'Siguiente';
    
    // Ocultar el botón adicional de finalizar en la última pregunta
    // ya que el botón 'Siguiente' ya cambia a 'Finalizar Examen'
    finishExamButton.style.display = isLastQuestion ? 'none' : 'inline-block';
    
    // Actualizar barra de progreso
    const progressBar = document.getElementById('progress-bar');
    const progress = ((index + 1) / preguntas.length) * 100;
    progressBar.style.width = `${progress}%`;
    
    // Actualizar índice actual
    currentQuestionIndex = index;
}

// Función para confirmar la finalización del examen desde cualquier pregunta
function confirmarFinalizarExamen() {
    // Comprobar si es la última pregunta, en ese caso usar la navegación normal
    if (currentQuestionIndex === preguntas.length - 1) {
        navigateQuestions(1);
        return;
    }
    
    // Comprobar si hay preguntas sin responder
    const preguntasSinResponder = userAnswers.filter(r => r === null).length;
    
    // Mostrar mensaje de confirmación
    const mensaje = preguntasSinResponder > 0
        ? `Hay ${preguntasSinResponder} pregunta(s) sin responder. ¿Deseas finalizar el examen de todas formas?`
        : '¿Estás seguro de que deseas finalizar el examen?';
    
    if (confirm(mensaje)) {
        finalizarExamen();
    }
}

// Formatear pregunta para extraer texto y opciones
function formatPregunta(textoCompleto) {
    // Eliminar el número de la pregunta
    const match = textoCompleto.match(/^\d+\.\s*(.*)/s);
    const preguntaSinNumero = match ? match[1] : textoCompleto;
    
    // Buscar las opciones A, B, C
    const opciones = {'A': '', 'B': '', 'C': ''};
    const lineas = preguntaSinNumero.split('\n');
    let textoPreg = '';
    
    // Encontrar donde empiezan las opciones (más flexible)
    let lineaOpcionesInicio = -1;
    for (let i = 0; i < lineas.length; i++) {
        if (lineas[i].match(/^[A][\)\.-]/)) {
            lineaOpcionesInicio = i;
            break;
        }
    }
    
    // Si no se encuentran opciones, mostrar todo como texto de pregunta
    if (lineaOpcionesInicio === -1) {
        return {
            text: preguntaSinNumero,
            options: opciones
        };
    }
    
    // El texto de la pregunta son todas las líneas antes de las opciones
    textoPreg = lineas.slice(0, lineaOpcionesInicio).join('<br>');
    
    // Extraer opciones con un patrón más flexible
    for (let i = lineaOpcionesInicio; i < lineas.length; i++) {
        const opcionMatch = lineas[i].match(/^([A-C])[\)\.-](.*)/);
        if (opcionMatch) {
            const letra = opcionMatch[1];
            let textoOpcion = opcionMatch[2].trim();
            
            // Eliminar caracteres ".-" al inicio del texto de la opción
            textoOpcion = textoOpcion.replace(/^[\.\-\s]+/, '');
            
            opciones[letra] = textoOpcion;
        }
    }
    
    return {
        text: textoPreg,
        options: opciones
    };
}

// Seleccionar una opción
function selectOption(letra) {
    userAnswers[currentQuestionIndex] = letra;
    
    // Actualizar UI
    const optionsContainer = document.getElementById('options-container');
    const options = optionsContainer.querySelectorAll('.option');
    options.forEach(option => {
        option.classList.remove('selected');
        if (option.textContent.startsWith(letra + ')')) {
            option.classList.add('selected');
        }
    });
}

// Navegar entre preguntas
function navigateQuestions(direction) {
    const newIndex = currentQuestionIndex + direction;
    
    // Si estamos en la última pregunta y queremos avanzar (finalizar)
    if (currentQuestionIndex === preguntas.length - 1 && direction === 1) {
        // Comprobar si todas las preguntas tienen respuesta
        const preguntasSinResponder = userAnswers.filter(r => r === null).length;
        
        if (preguntasSinResponder > 0) {
            if (!confirm(`Hay ${preguntasSinResponder} pregunta(s) sin responder. ¿Deseas finalizar el examen de todas formas?`)) {
                return;
            }
        }
        
        // Llamar a finalizar examen
        finalizarExamen();
        return;
    }
    
    // Para navegación normal entre preguntas
    if (newIndex < 0 || newIndex >= preguntas.length) return;
    
    // Mostrar la siguiente/anterior pregunta
    showQuestion(newIndex);
}

// Finalizar el examen
function finalizarExamen() {
    console.log("Finalizando examen..."); // Para depurar
    
    // Ocultar pantalla del examen y mostrar resultados
    document.getElementById('exam-screen').classList.add('hidden');
    document.getElementById('results-screen').classList.remove('hidden');
    
    // Calcular resultados
    const totalPreguntas = preguntas.length;
    let aciertos = 0;
    
    for (let i = 0; i < preguntas.length; i++) {
        if (userAnswers[i] === preguntas[i].respuestaCorrecta) {
            aciertos++;
        }
    }
    
    const porcentaje = (aciertos / totalPreguntas) * 100;
    const aprobado = porcentaje >= PORCENTAJE_APROBADO;
    
    console.log(`Aciertos: ${aciertos}/${totalPreguntas} (${porcentaje.toFixed(1)}%)`); // Para depurar
    
    // Mostrar mensaje de resultado
    const resultMessage = document.getElementById('result-message');
    resultMessage.className = 'result ' + (aprobado ? 'pass' : 'fail');
    resultMessage.innerHTML = `
        <h3>${aprobado ? '¡APROBADO! 🎉' : 'SUSPENDIDO'}</h3>
        <p>Has acertado ${aciertos} de ${totalPreguntas} preguntas (${porcentaje.toFixed(1)}%).</p>
        <p>${aprobado ? '¡Felicidades!' : `Se requiere al menos un ${PORCENTAJE_APROBADO}% de aciertos para aprobar.`}</p>
    `;
    
    // Mostrar revisión de preguntas
    const questionReview = document.getElementById('question-review');
    questionReview.innerHTML = '<h3>Revisión de Preguntas</h3>';
    
    for (let i = 0; i < preguntas.length; i++) {
        const pregunta = preguntas[i];
        const respuestaUsuario = userAnswers[i];
        const esCorrecta = respuestaUsuario === pregunta.respuestaCorrecta;
        
        const preguntaDiv = document.createElement('div');
        preguntaDiv.className = `question-review ${esCorrecta ? 'correct' : 'incorrect'}`;
        
        const preguntaFormateada = formatPregunta(pregunta.texto);
        
        // Generar HTML para mostrar las opciones
        let opcionesHTML = '<div class="options-review">';
        ['A', 'B', 'C'].forEach(letra => {
            const esRespuestaUsuario = respuestaUsuario === letra;
            const esRespuestaCorrecta = pregunta.respuestaCorrecta === letra;
            
            opcionesHTML += `
                <p class="${esRespuestaCorrecta ? 'correct-option' : ''} ${esRespuestaUsuario && !esRespuestaCorrecta ? 'incorrect-option' : ''}">
                    <strong>${letra})</strong> ${preguntaFormateada.options[letra]}
                    ${esRespuestaCorrecta ? ' ✓' : ''}
                    ${esRespuestaUsuario && !esRespuestaCorrecta ? ' ✗' : ''}
                </p>
            `;
        });
        opcionesHTML += '</div>';
        
        preguntaDiv.innerHTML = `
            <p><strong>${i + 1}. ${preguntaFormateada.text}</strong></p>
            ${opcionesHTML}
            <p>
                Tu respuesta: ${respuestaUsuario ? respuestaUsuario : 'No respondida'} 
                ${esCorrecta ? '✓' : '✗'}
            </p>
            <p>Respuesta correcta: ${pregunta.respuestaCorrecta}</p>
        `;
        
        questionReview.appendChild(preguntaDiv);
    }
}
