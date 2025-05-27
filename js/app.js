/**
 * Inicialización de la aplicación y configuración de eventos
 */

// Variables para los elementos DOM principales
let loadingOverlay;

// Inicializar la aplicación
async function init() {
    initDOMReferences();
    setupEventListeners();
    await cargarDatos();
    loadingOverlay.style.display = 'none';
}

// Inicializar referencias a elementos DOM
function initDOMReferences() {
    loadingOverlay = document.getElementById('loading-overlay');
}

// Configurar event listeners
function setupEventListeners() {
    // Botones del menú principal
    document.getElementById('start-random-exam').addEventListener('click', () => startExam('random'));
    document.getElementById('start-full-exam').addEventListener('click', () => startExam('full'));
    document.getElementById('start-theme-exam').addEventListener('click', showThemeSelection);
      // Navegación del examen
    document.getElementById('prev-question').addEventListener('click', () => navigateQuestions(-1));
    document.getElementById('next-question').addEventListener('click', () => navigateQuestions(1));
    document.getElementById('finish-exam').addEventListener('click', confirmarFinalizarExamen);
    
    // Botones de resultados
    document.getElementById('restart-exam').addEventListener('click', restartExam);
    document.getElementById('new-exam').addEventListener('click', newExam);
    document.getElementById('back-from-results').addEventListener('click', goBackFromResults);
    document.getElementById('back-from-results-bottom').addEventListener('click', goBackFromResults);
    
    // Navegación entre pantallas
    document.getElementById('back-to-menu-from-themes').addEventListener('click', showMainMenu);
    document.getElementById('back-to-themes').addEventListener('click', showThemeSelection);

    // Añadir evento de teclado para finalizar examen con ESC
    document.addEventListener('keydown', function(e) {
        // Solo responder cuando estamos en la pantalla de examen (no oculta)
        if (!document.getElementById('exam-screen').classList.contains('hidden')) {
            // Tecla ESC (código 27)
            if (e.keyCode === 27) {
                confirmarFinalizarExamen();
            }
        }
    });
}

// Iniciar la aplicación cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', init);
