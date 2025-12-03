// ==========================================
// STATE MANAGEMENT
// ==========================================

const AppState = {
    workouts: [],
    currentView: 'home',
    currentFilter: 'all',
    timerInterval: null,
    timerSeconds: 90,
    timerRunning: false,
};

// ==========================================
// STORAGE UTILS
// ==========================================

const Storage = {
    save() {
        localStorage.setItem('gymflow_workouts', JSON.stringify(AppState.workouts));
    },

    load() {
        const data = localStorage.getItem('gymflow_workouts');
        if (data) {
            AppState.workouts = JSON.parse(data);
        }
    },

    clear() {
        localStorage.removeItem('gymflow_workouts');
        AppState.workouts = [];
    },

    export() {
        const dataStr = JSON.stringify(AppState.workouts, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `gymflow_backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        showToast('Datos exportados correctamente', 'success');
    },

    import(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                AppState.workouts = data;
                Storage.save();
                updateUI();
                showToast('Datos importados correctamente', 'success');
            } catch (error) {
                showToast('Error al importar datos', 'error');
            }
        };
        reader.readAsText(file);
    }
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function formatDate(date) {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
        return 'Hoy';
    } else if (d.toDateString() === yesterday.toDateString()) {
        return 'Ayer';
    } else {
        return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    }
}

function formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
        return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
}

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return '¡Buenos días!';
    if (hour < 20) return '¡Buenas tardes!';
    return '¡Buenas noches!';
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            ${type === 'success' ? '<polyline points="20 6 9 17 4 12"></polyline>' :
            type === 'error' ? '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>' :
                '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>'}
        </svg>
        <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideUp 250ms cubic-bezier(0.4, 0, 0.2, 1)';
        setTimeout(() => toast.remove(), 250);
    }, 3000);
}

// ==========================================
// NAVIGATION
// ==========================================

function switchView(viewName) {
    // Update state
    AppState.currentView = viewName;

    // Update views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(`${viewName}View`).classList.add('active');

    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    const navItem = document.querySelector(`[data-view="${viewName}"]`);
    if (navItem) {
        navItem.classList.add('active');
    }

    // Update view content
    if (viewName === 'workouts') {
        renderWorkouts();
    } else if (viewName === 'progress') {
        renderProgress();
    } else if (viewName === 'home') {
        renderHome();
    }
}

// ==========================================
// WORKOUT MANAGEMENT
// ==========================================

let currentExerciseCount = 0;

function openAddWorkoutModal() {
    const modal = document.getElementById('addWorkoutModal');
    modal.classList.add('active');
    resetWorkoutForm();
}

function closeAddWorkoutModal() {
    const modal = document.getElementById('addWorkoutModal');
    modal.classList.remove('active');
}

function resetWorkoutForm() {
    document.getElementById('workoutForm').reset();
    document.getElementById('exercisesList').innerHTML = '';
    currentExerciseCount = 0;
}

// Note: addExercise() is now addExerciseToWorkout() in exercise-selector.js

function removeExercise(id) {
    const exercise = document.querySelector(`[data-exercise-id="${id}"]`);
    if (exercise) {
        exercise.remove();
    }
}

function saveWorkout(e) {
    e.preventDefault();

    const name = document.getElementById('workoutName').value.trim();

    if (!name) {
        showToast('Por favor, añade un nombre al entrenamiento', 'error');
        return;
    }

    // Close the modal
    closeAddWorkoutModal();

    // Start active workout session
    ActiveWorkoutSession.start(name);
}

// ==========================================
// UI RENDERING
// ==========================================

function renderHome() {
    // Update greeting
    document.getElementById('greetingText').textContent = getGreeting();

    // Calculate stats
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekWorkouts = AppState.workouts.filter(w => new Date(w.date) >= weekAgo).length;
    const totalWorkouts = AppState.workouts.length;
    const totalMinutes = AppState.workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
    const totalHours = Math.floor(totalMinutes / 60);

    document.getElementById('weekWorkouts').textContent = weekWorkouts;
    document.getElementById('totalWorkouts').textContent = totalWorkouts;
    document.getElementById('totalTime').textContent = totalHours > 0 ? `${totalHours}h` : `${totalMinutes}m`;

    // Render recent workouts
    const recentList = document.getElementById('recentWorkoutsList');
    const recentWorkouts = AppState.workouts.slice(0, 3);

    if (recentWorkouts.length === 0) {
        recentList.innerHTML = `
            <div class="empty-state">
                <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
                <p class="empty-text">No hay entrenamientos registrados</p>
                <p class="empty-subtext">Toca el botón + para comenzar</p>
            </div>
        `;
    } else {
        recentList.innerHTML = recentWorkouts.map(workout => createWorkoutCard(workout)).join('');
    }
}

function renderWorkouts() {
    const list = document.getElementById('allWorkoutsList');
    const filtered = AppState.currentFilter === 'all'
        ? AppState.workouts
        : AppState.workouts.filter(w => w.category === AppState.currentFilter);

    if (filtered.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                </svg>
                <p class="empty-text">No hay entrenamientos</p>
                <p class="empty-subtext">Usa los filtros o añade uno nuevo</p>
            </div>
        `;
    } else {
        list.innerHTML = filtered.map(workout => createWorkoutCard(workout)).join('');
    }
}

function createWorkoutCard(workout) {
    return `
        <div class="workout-card" data-workout-id="${workout.id}">
            <div class="workout-header">
                <div class="workout-header-left">
                    <h3 class="workout-name">${workout.name || 'Entrenamiento'}</h3>
                    <div class="workout-meta">
                        <span class="workout-category ${workout.category}">${workout.category}</span>
                        <span class="workout-date">${formatDate(workout.date)}</span>
                        <span class="workout-duration">⏱️ ${formatTime(workout.duration)}</span>
                    </div>
                </div>
                <button class="workout-delete-btn" onclick="deleteWorkout(event, ${workout.id})" title="Eliminar entrenamiento">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2">
                        </path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                </button>
            </div>
            <div class="workout-exercises">
                ${workout.exercises.map(ex => {
        // Handle both old format (sets/reps/weight) and new format (sets array)
        if (ex.sets && Array.isArray(ex.sets)) {
            // New format with individual sets
            return `
                            <div class="exercise-item-detailed">
                                <div class="exercise-name-detailed">${ex.name}</div>
                                <div class="exercise-sets-list">
                                    ${ex.sets.map((set, index) => `
                                        <span class="set-detail">${index + 1}: ${set.reps}×${set.weight}kg</span>
                                    `).join('')}
                                </div>
                            </div>
                        `;
        } else {
            // Old format (backward compatibility)
            return `
                            <div class="exercise-item">
                                <span class="exercise-name">${ex.name}</span>
                                <span class="exercise-details">${ex.sets}x${ex.reps} @ ${ex.weight}kg</span>
                            </div>
                        `;
        }
    }).join('')}
            </div>
            ${workout.notes ? `<div class="workout-notes">${workout.notes}</div>` : ''}
        </div>
    `;
}

// Confirmation Modal Logic
let pendingAction = null;

function showConfirmation(message, action) {
    document.getElementById('confirmationMessage').textContent = message;
    pendingAction = action;
    document.getElementById('confirmationModal').classList.add('active');
}

function closeConfirmationModal() {
    document.getElementById('confirmationModal').classList.remove('active');
    pendingAction = null;
}

// Initialize Confirmation Modal Listeners
function initializeConfirmationModal() {
    document.getElementById('confirmActionBtn').addEventListener('click', () => {
        if (pendingAction) pendingAction();
        closeConfirmationModal();
    });

    document.getElementById('cancelConfirmationBtn').addEventListener('click', closeConfirmationModal);
    document.getElementById('closeConfirmationModal').addEventListener('click', closeConfirmationModal);
}

// Delete a workout
function deleteWorkout(event, workoutId) {
    // Prevent the click from bubbling up to the card or other elements
    if (event) {
        event.stopPropagation();
    }

    console.log('Attempting to delete workout:', workoutId);

    showConfirmation(
        '¿Estás seguro de que quieres eliminar este entrenamiento? Esta acción no se puede deshacer.',
        () => {
            // Find and remove the workout
            const index = AppState.workouts.findIndex(w => w.id === workoutId);
            console.log('Workout index found:', index);

            if (index !== -1) {
                AppState.workouts.splice(index, 1);
                Storage.save();

                // Animate removal
                const card = document.querySelector(`[data-workout-id="${workoutId}"]`);
                if (card) {
                    card.style.animation = 'slideOut 250ms ease-out';
                    setTimeout(() => {
                        updateUI();
                        showToast('Entrenamiento eliminado', 'success');
                    }, 250);
                } else {
                    updateUI();
                    showToast('Entrenamiento eliminado', 'success');
                }
            } else {
                console.error('Workout not found for deletion');
                showToast('Error al eliminar: entrenamiento no encontrado', 'error');
            }
        }
    );
}

function renderProgress() {
    // Render personal records
    const recordsList = document.getElementById('recordsList');
    const records = calculateRecords();

    if (records.length === 0) {
        recordsList.innerHTML = `
            <div class="empty-state">
                <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                <p class="empty-text">No hay récords aún</p>
                <p class="empty-subtext">Sigue entrenando para establecer récords</p>
            </div>
        `;
    } else {
        recordsList.innerHTML = records.map(record => `
            <div class="record-card">
                <div class="record-info">
                    <h3>${record.exercise}</h3>
                    <p>${formatDate(record.date)}</p>
                </div>
                <div class="record-value">${record.weight}kg</div>
            </div>
        `).join('');
    }

    // Simple progress chart
    renderChart();
}

function calculateRecords() {
    console.log('Calculating records...');
    const exerciseMap = new Map();

    AppState.workouts.forEach(workout => {
        workout.exercises.forEach(ex => {
            let maxWeight = 0;

            // Handle new structure with sets
            if (ex.sets && Array.isArray(ex.sets)) {
                ex.sets.forEach(set => {
                    const weight = parseFloat(set.weight) || 0;
                    if (weight > maxWeight) {
                        maxWeight = weight;
                    }
                });
            }
            // Handle legacy structure or fallback
            else if (ex.weight) {
                maxWeight = parseFloat(ex.weight) || 0;
            }

            if (maxWeight > 0) {
                const existing = exerciseMap.get(ex.name);
                if (!existing || maxWeight > existing.weight) {
                    exerciseMap.set(ex.name, {
                        exercise: ex.name,
                        weight: maxWeight,
                        date: workout.date
                    });
                }
            }
        });
    });

    const records = Array.from(exerciseMap.values()).sort((a, b) => b.weight - a.weight).slice(0, 10);
    console.log('Calculated records:', records);
    return records;
}

function renderChart() {
    const canvas = document.getElementById('progressChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Set canvas size with device pixel ratio for crisp rendering
    const dpr = window.devicePixelRatio || 2;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = 300 * dpr;
    ctx.scale(dpr, dpr);

    // Get data for last 7 days
    const now = new Date();
    const days = [];
    const counts = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        // Use custom short names to ensure consistency
        const dayNames = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
        const dayName = dayNames[date.getDay()];
        const count = AppState.workouts.filter(w => {
            const wDate = new Date(w.date);
            return wDate.toDateString() === date.toDateString();
        }).length;

        days.push(dayName);
        counts.push(count);
    }

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, 300);

    // Chart dimensions
    const padding = { top: 30, right: 20, bottom: 40, left: 20 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = 300 - padding.top - padding.bottom;
    const barWidth = Math.min(40, (chartWidth / days.length) * 0.7);
    const barSpacing = chartWidth / days.length;
    const maxCount = Math.max(...counts, 1);

    // Set font
    ctx.font = '600 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    days.forEach((day, i) => {
        const x = padding.left + i * barSpacing + barSpacing / 2;
        const barHeight = counts[i] > 0 ? Math.max(10, (counts[i] / maxCount) * chartHeight) : 0;
        const y = padding.top + chartHeight - barHeight;

        // Draw bar with gradient
        if (barHeight > 0) {
            const gradient = ctx.createLinearGradient(x - barWidth / 2, y, x - barWidth / 2, padding.top + chartHeight);
            gradient.addColorStop(0, '#667eea');
            gradient.addColorStop(1, '#764ba2');
            ctx.fillStyle = gradient;

            // Rounded rectangle for bar
            const radius = 4;
            ctx.beginPath();
            ctx.moveTo(x - barWidth / 2 + radius, y);
            ctx.lineTo(x + barWidth / 2 - radius, y);
            ctx.quadraticCurveTo(x + barWidth / 2, y, x + barWidth / 2, y + radius);
            ctx.lineTo(x + barWidth / 2, padding.top + chartHeight);
            ctx.lineTo(x - barWidth / 2, padding.top + chartHeight);
            ctx.lineTo(x - barWidth / 2, y + radius);
            ctx.quadraticCurveTo(x - barWidth / 2, y, x - barWidth / 2 + radius, y);
            ctx.closePath();
            ctx.fill();

            // Draw value on top of bar
            ctx.fillStyle = '#667eea';
            ctx.fillText(counts[i], x, y - 12);
        }

        // Draw day label
        ctx.fillStyle = '#a1a1aa';
        ctx.fillText(day, x, padding.top + chartHeight + 20);
    });

    // Draw baseline
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top + chartHeight);
    ctx.lineTo(rect.width - padding.right, padding.top + chartHeight);
    ctx.stroke();
}

function updateUI() {
    if (AppState.currentView === 'home') {
        renderHome();
    } else if (AppState.currentView === 'workouts') {
        renderWorkouts();
    } else if (AppState.currentView === 'progress') {
        renderProgress();
    }
}

// ==========================================
// TIMER
// ==========================================

function openTimer() {
    const modal = document.getElementById('timerModal');
    modal.classList.add('active');
    resetTimer();
}

function closeTimer() {
    const modal = document.getElementById('timerModal');
    modal.classList.remove('active');
    stopTimer();
}

function resetTimer() {
    stopTimer();
    AppState.timerSeconds = 90;
    updateTimerDisplay();
    document.getElementById('startTimerBtn').classList.remove('hidden');
    document.getElementById('pauseTimerBtn').classList.add('hidden');
    document.getElementById('resetTimerBtn').classList.add('hidden');
}

function setTimerPreset(seconds) {
    stopTimer();
    AppState.timerSeconds = seconds;
    updateTimerDisplay();
    document.getElementById('startTimerBtn').classList.remove('hidden');
    document.getElementById('pauseTimerBtn').classList.add('hidden');
    document.getElementById('resetTimerBtn').classList.add('hidden');
}

function startTimer() {
    AppState.timerRunning = true;
    document.getElementById('startTimerBtn').classList.add('hidden');
    document.getElementById('pauseTimerBtn').classList.remove('hidden');
    document.getElementById('resetTimerBtn').classList.remove('hidden');

    AppState.timerInterval = setInterval(() => {
        AppState.timerSeconds--;
        updateTimerDisplay();

        if (AppState.timerSeconds <= 0) {
            stopTimer();
            playTimerSound();
            showToast('¡Tiempo completado!', 'success');
        }
    }, 1000);
}

function pauseTimer() {
    stopTimer();
    document.getElementById('startTimerBtn').classList.remove('hidden');
    document.getElementById('startTimerBtn').textContent = 'Reanudar';
    document.getElementById('pauseTimerBtn').classList.add('hidden');
}

function stopTimer() {
    AppState.timerRunning = false;
    if (AppState.timerInterval) {
        clearInterval(AppState.timerInterval);
        AppState.timerInterval = null;
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(AppState.timerSeconds / 60);
    const seconds = AppState.timerSeconds % 60;
    const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('timerDisplay').textContent = display;
}

function playTimerSound() {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

// ==========================================
// 1RM CALCULATOR
// ==========================================

function openCalculator() {
    const modal = document.getElementById('calculatorModal');
    modal.classList.add('active');
    document.getElementById('calculatorForm').reset();
    document.getElementById('calculatorResult').classList.add('hidden');
}

function closeCalculator() {
    const modal = document.getElementById('calculatorModal');
    modal.classList.remove('active');
}

function calculate1RM(e) {
    e.preventDefault();

    const weight = parseFloat(document.getElementById('calcWeight').value);
    const reps = parseInt(document.getElementById('calcReps').value);

    // Brzycki formula: 1RM = weight × (36 / (37 - reps))
    const oneRM = weight * (36 / (37 - reps));

    document.getElementById('rmValue').textContent = `${oneRM.toFixed(1)} kg`;
    document.getElementById('calculatorResult').classList.remove('hidden');
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function initializeEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            switchView(item.dataset.view);
        });
    });

    // Add workout modal
    document.getElementById('addWorkoutBtn').addEventListener('click', openAddWorkoutModal);
    document.getElementById('closeAddWorkout').addEventListener('click', closeAddWorkoutModal);
    document.getElementById('cancelWorkout').addEventListener('click', closeAddWorkoutModal);

    // Workout form
    // Note: addExerciseBtn listener is now in exercise-selector.js via initializeExerciseSelectorListeners()
    // document.getElementById('addExerciseBtn').addEventListener('click', addExercise);
    document.getElementById('startWorkoutForm').addEventListener('submit', saveWorkout);

    // Active Workout Session
    document.getElementById('addExerciseToActiveBtn').addEventListener('click', () => {
        ActiveWorkoutSession.openExerciseSelector();
    });
    document.getElementById('finishWorkoutBtn').addEventListener('click', () => {
        ActiveWorkoutSession.finish();
    });
    document.getElementById('closeAddExerciseActive').addEventListener('click', () => {
        ActiveWorkoutSession.closeAddExerciseModal();
    });
    document.getElementById('cancelAddExerciseActive').addEventListener('click', () => {
        ActiveWorkoutSession.closeAddExerciseModal();
    });
    document.getElementById('addActiveSetBtn').addEventListener('click', () => {
        ActiveWorkoutSession.addSet();
    });
    document.getElementById('addExerciseActiveForm').addEventListener('submit', (e) => {
        ActiveWorkoutSession.saveCurrentExercise(e);
    });

    // Modal backdrop close
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) {
                backdrop.parentElement.classList.remove('active');
            }
        });
    });

    // Quick actions
    document.getElementById('timerBtn').addEventListener('click', openTimer);
    document.getElementById('calculatorBtn').addEventListener('click', openCalculator);
    // Calendar button listener is in initializeCalendar()
    document.getElementById('routinesBtn').addEventListener('click', () => {
        showToast('Próximamente: Rutinas', 'info');
    });

    // Timer
    document.getElementById('closeTimer').addEventListener('click', closeTimer);
    document.getElementById('startTimerBtn').addEventListener('click', startTimer);
    document.getElementById('pauseTimerBtn').addEventListener('click', pauseTimer);
    document.getElementById('resetTimerBtn').addEventListener('click', resetTimer);

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setTimerPreset(parseInt(btn.dataset.time));
        });
    });

    // Calculator
    document.getElementById('closeCalculator').addEventListener('click', closeCalculator);
    document.getElementById('calculatorForm').addEventListener('submit', calculate1RM);

    // Filters (only for workout view filters, not exercise selector filters)
    document.querySelectorAll('#filterChips .chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('#filterChips .chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            AppState.currentFilter = chip.dataset.filter;
            renderWorkouts();
        });
    });

    // View all workouts
    document.getElementById('viewAllWorkouts').addEventListener('click', () => {
        switchView('workouts');
    });

    // Settings
    document.getElementById('exportDataBtn').addEventListener('click', () => {
        Storage.export();
    });

    document.getElementById('importDataBtn').addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                Storage.import(file);
            }
        };
        input.click();
    });

    document.getElementById('clearDataBtn').addEventListener('click', () => {
        if (confirm('¿Estás seguro de que quieres borrar todos los datos? Esta acción no se puede deshacer.')) {
            Storage.clear();
            updateUI();
            showToast('Datos eliminados', 'success');
        }
    });
}

// ==========================================
// PWA SERVICE WORKER
// ==========================================

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('Service Worker registered:', registration);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    }
}

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // Load data
    Storage.load();

    // Initialize UI
    renderHome();

    // Setup event listeners
    initializeEventListeners();
    initializeExerciseSelectorListeners(); // For exercise selection modal
    initializeConfirmationModal(); // For custom confirmation modal
    initializeCalendar(); // For calendar modal

    // Register service worker
    registerServiceWorker();

    // Show welcome message
    if (AppState.workouts.length === 0) {
        setTimeout(() => {
            showToast('¡Bienvenido a GymFlow! 💪', 'success');
        }, 500);
    }
});

// ==========================================
// CALENDAR FUNCTIONALITY
// ==========================================

const Calendar = {
    currentDate: new Date(),
    selectedDate: null,

    open() {
        document.getElementById('calendarModal').classList.add('active');
        this.render();
    },

    close() {
        document.getElementById('calendarModal').classList.remove('active');
    },

    prevMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.render();
    },

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.render();
    },

    render() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        // Update month title
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;

        // Get first day of month (0 = Sunday, 1 = Monday, etc.)
        const firstDay = new Date(year, month, 1).getDay();
        // Adjust so Monday is 0 (European style)
        const firstDayAdjusted = firstDay === 0 ? 6 : firstDay - 1;

        // Get number of days in month
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Get previous month days
        const prevMonthDays = new Date(year, month, 0).getDate();

        // Build calendar days
        const calendarDays = document.getElementById('calendarDays');
        calendarDays.innerHTML = '';

        // Get workouts for this month
        const workoutsByDate = this.getWorkoutsByDate(year, month);

        // Add previous month days
        for (let i = firstDayAdjusted - 1; i >= 0; i--) {
            const day = prevMonthDays - i;
            const dayEl = this.createDayElement(day, true, null, false);
            calendarDays.appendChild(dayEl);
        }

        // Add current month days
        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            const hasWorkout = workoutsByDate[dateKey] && workoutsByDate[dateKey].length > 0;
            const dayEl = this.createDayElement(day, false, dateKey, isToday, hasWorkout);
            calendarDays.appendChild(dayEl);
        }

        // Add next month days to fill grid
        const totalCells = calendarDays.children.length;
        const remainingCells = 42 - totalCells; // 6 rows * 7 days
        for (let day = 1; day <= remainingCells; day++) {
            const dayEl = this.createDayElement(day, true, null, false);
            calendarDays.appendChild(dayEl);
        }
    },

    createDayElement(day, isOtherMonth, dateKey, isToday, hasWorkout) {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        dayEl.textContent = day;

        if (isOtherMonth) {
            dayEl.classList.add('other-month');
        }
        if (isToday) {
            dayEl.classList.add('today');
        }
        if (hasWorkout) {
            dayEl.classList.add('has-workout');
        }

        if (dateKey && !isOtherMonth) {
            dayEl.addEventListener('click', () => {
                this.selectDay(dateKey, dayEl);
            });
        }

        return dayEl;
    },

    selectDay(dateKey, dayElement) {
        this.selectedDate = dateKey;

        // Update selected state
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('selected');
        });
        if (dayElement) {
            dayElement.classList.add('selected');
        }

        // Show workouts for this day
        this.renderDayDetails(dateKey);
    },

    renderDayDetails(dateKey) {
        const detailsContainer = document.getElementById('calendarDetails');
        const workouts = this.getWorkoutsForDate(dateKey);

        if (workouts.length === 0) {
            detailsContainer.innerHTML = `
                <p class="empty-subtext">No hay entrenamientos en este día</p>
            `;
            return;
        }

        const [year, month, day] = dateKey.split('-');
        const date = new Date(year, month - 1, day);
        const dateStr = formatDate(date.toISOString());

        detailsContainer.innerHTML = `
            <div class="calendar-details-header">
                <div class="calendar-details-date">${dateStr}</div>
                <div class="calendar-details-count">${workouts.length} entrenamiento${workouts.length > 1 ? 's' : ''}</div>
            </div>
            ${workouts.map(workout => `
                <div class="calendar-workout-item">
                    <div class="calendar-workout-name">${workout.name || 'Entrenamiento'}</div>
                    <div class="calendar-workout-meta">
                        <span>⏱️ ${formatTime(workout.duration)}</span>
                        <span>💪 ${workout.exercises.length} ejercicio${workout.exercises.length > 1 ? 's' : ''}</span>
                    </div>
                    <div class="calendar-workout-exercises">
                        ${workout.exercises.slice(0, 3).map(ex => ex.name).join(', ')}${workout.exercises.length > 3 ? '...' : ''}
                    </div>
                </div>
            `).join('')}
        `;
    },

    getWorkoutsByDate(year, month) {
        const workoutsByDate = {};

        AppState.workouts.forEach(workout => {
            const date = new Date(workout.date);
            if (date.getFullYear() === year && date.getMonth() === month) {
                const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                if (!workoutsByDate[dateKey]) {
                    workoutsByDate[dateKey] = [];
                }
                workoutsByDate[dateKey].push(workout);
            }
        });

        return workoutsByDate;
    },

    getWorkoutsForDate(dateKey) {
        const [year, month, day] = dateKey.split('-');
        return AppState.workouts.filter(workout => {
            const date = new Date(workout.date);
            return date.getFullYear() === parseInt(year) &&
                date.getMonth() === parseInt(month) - 1 &&
                date.getDate() === parseInt(day);
        });
    }
};

// Initialize calendar listeners
function initializeCalendar() {
    document.getElementById('calendarBtn').addEventListener('click', () => {
        Calendar.open();
    });

    document.getElementById('closeCalendar').addEventListener('click', () => {
        Calendar.close();
    });

    document.getElementById('prevMonth').addEventListener('click', () => {
        Calendar.prevMonth();
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
        Calendar.nextMonth();
    });
}
