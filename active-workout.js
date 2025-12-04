// ==========================================
// ACTIVE WORKOUT SESSION
// ==========================================

const ActiveWorkoutSession = {
    isActive: false,
    workoutName: '',
    startTime: null,
    timerInterval: null,
    exercises: [],
    currentExercise: null,

    start(name) {
        this.isActive = true;
        this.workoutName = name;
        this.startTime = new Date();
        this.exercises = [];
        this.showOverlay();
        this.startTimer();
        showToast(`¡Entrenamiento "${name}" iniciado!`, 'success');
    },

    showOverlay() {
        document.getElementById('activeWorkoutOverlay').classList.add('active');
        document.getElementById('activeWorkoutTitle').textContent = this.workoutName;
        document.getElementById('navBar').style.display = 'none';
    },

    hideOverlay() {
        document.getElementById('activeWorkoutOverlay').classList.remove('active');
        document.getElementById('navBar').style.display = 'flex';
    },

    startTimer() {
        this.updateTimerDisplay();
        this.timerInterval = setInterval(() => {
            this.updateTimerDisplay();
        }, 1000);
    },

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    },

    updateTimerDisplay() {
        if (!this.startTime) return;

        const now = new Date();
        const elapsed = Math.floor((now - this.startTime) / 1000); // seconds

        const hours = Math.floor(elapsed / 3600);
        const minutes = Math.floor((elapsed % 3600) / 60);
        const seconds = elapsed % 60;

        const display = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('activeWorkoutTimer').textContent = display;
    },

    getElapsedMinutes() {
        if (!this.startTime) return 0;
        const now = new Date();
        return Math.floor((now - this.startTime) / 60000); // minutes
    },

    openExerciseSelector() {
        ExerciseSelector.openForActive();
    },

    openAddExerciseModal(exerciseName, category, images = [], exerciseType = 'strength') {
        this.currentExercise = { name: exerciseName, category: category, type: exerciseType, sets: [] };
        document.getElementById('activeExerciseTitle').textContent = exerciseName;

        // Inject images
        const modalBody = document.querySelector('#addExerciseActiveModal .modal-body');
        // Remove existing images if any
        const existingImages = modalBody.querySelector('.exercise-images-preview');
        if (existingImages) existingImages.remove();

        // Find images if not provided
        let exerciseImages = images;
        if ((!exerciseImages || exerciseImages.length === 0) && window.ExercisesDatabase) {
            const exercise = window.ExercisesDatabase.find(ex => ex.name === exerciseName);
            if (exercise) exerciseImages = exercise.images;
        }

        if (exerciseImages && exerciseImages.length > 0) {
            const imagesContainer = document.createElement('div');
            imagesContainer.className = 'exercise-images-preview';
            imagesContainer.innerHTML = exerciseImages.map(img => `<img src="${img}" alt="${exerciseName}" loading="lazy">`).join('');
            modalBody.insertBefore(imagesContainer, modalBody.firstChild);
        }

        document.getElementById('addExerciseActiveModal').classList.add('active');

        // Clear previous sets
        document.getElementById('activeSetsList').innerHTML = '';

        // Add one set by default
        this.addSet();
    },

    closeAddExerciseModal() {
        document.getElementById('addExerciseActiveModal').classList.remove('active');
        this.currentExercise = null;
    },

    addSet() {
        const setsList = document.getElementById('activeSetsList');
        const setNumber = setsList.children.length + 1;
        const isCardio = this.currentExercise && this.currentExercise.type === 'cardio';

        // Get previous set values if available
        let prevTime = '', prevDistance = '', prevReps = '', prevWeight = '';
        if (setNumber > 1) {
            const lastSet = setsList.lastElementChild;
            if (lastSet) {
                if (isCardio) {
                    prevTime = lastSet.querySelector('.set-time').value;
                    prevDistance = lastSet.querySelector('.set-distance').value;
                } else {
                    prevReps = lastSet.querySelector('.set-reps').value;
                    prevWeight = lastSet.querySelector('.set-weight').value;
                }
            }
        }

        const setItem = document.createElement('div');
        setItem.className = 'set-item';
        setItem.dataset.setNumber = setNumber;

        let inputsHtml = '';
        if (isCardio) {
            inputsHtml = `
                <input type="number" class="form-input set-time" placeholder="Min" min="1" required value="${prevTime}">
                <span class="set-separator">min</span>
                <input type="number" class="form-input set-distance" placeholder="Km" step="0.01" required value="${prevDistance}">
                <span class="set-separator">km</span>
            `;
        } else {
            inputsHtml = `
                <input type="number" class="form-input set-reps" placeholder="Reps" min="1" required value="${prevReps}">
                <span class="set-separator">×</span>
                <input type="number" class="form-input set-weight" placeholder="kg" step="0.5" required value="${prevWeight}">
            `;
        }

        setItem.innerHTML = `
            <div class="set-number">Serie ${setNumber}</div>
            <div class="set-inputs">
                ${inputsHtml}
                <button type="button" class="remove-set-btn" onclick="ActiveWorkoutSession.removeSet(${setNumber})" title="Eliminar serie">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        `;

        setsList.appendChild(setItem);
    },

    removeSet(setNumber) {
        const setItem = document.querySelector(`[data-set-number="${setNumber}"]`);
        if (setItem) {
            setItem.remove();
            // Renumber remaining sets
            this.renumberSets();
        }
    },

    renumberSets() {
        const sets = document.querySelectorAll('#activeSetsList .set-item');
        sets.forEach((set, index) => {
            const setNumber = index + 1;
            set.dataset.setNumber = setNumber;
            set.querySelector('.set-number').textContent = `Serie ${setNumber}`;

            // Update remove button
            const removeBtn = set.querySelector('.remove-set-btn');
            removeBtn.setAttribute('onclick', `ActiveWorkoutSession.removeSet(${setNumber})`);
        });
    },

    saveCurrentExercise(e) {
        e.preventDefault();

        if (!this.currentExercise) return;

        const isCardio = this.currentExercise.type === 'cardio';

        // Collect sets
        const sets = [];
        document.querySelectorAll('#activeSetsList .set-item').forEach(setItem => {
            if (isCardio) {
                const time = parseFloat(setItem.querySelector('.set-time').value) || 0;
                const distance = parseFloat(setItem.querySelector('.set-distance').value) || 0;
                if (time > 0 || distance > 0) {
                    sets.push({ time, distance });
                }
            } else {
                const reps = parseInt(setItem.querySelector('.set-reps').value) || 0;
                const weight = parseFloat(setItem.querySelector('.set-weight').value) || 0;
                if (reps > 0) {
                    sets.push({ reps, weight });
                }
            }
        });

        if (sets.length === 0) {
            showToast('Añade al menos una serie', 'error');
            return;
        }

        this.currentExercise.sets = sets;
        this.exercises.push({ ...this.currentExercise });

        this.closeAddExerciseModal();
        this.renderExercises();
        showToast(`${this.currentExercise.name} añadido`, 'success');
    },

    renderExercises() {
        const container = document.getElementById('activeWorkoutExercises');

        if (this.exercises.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                    <p class="empty-text">Aún no has añadido ejercicios</p>
                    <p class="empty-subtext">Pulsa el botón de abajo para empezar</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.exercises.map((exercise, index) => {
            const isCardio = exercise.type === 'cardio';

            return `
            <div class="active-exercise-card">
                <div class="active-exercise-header">
                    <div class="active-exercise-name">${exercise.name}</div>
                    <button class="remove-exercise-btn-small" onclick="ActiveWorkoutSession.removeExercise(${index})" title="Eliminar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="active-exercise-sets">
                    ${exercise.sets.map((set, setIndex) => {
                if (isCardio) {
                    return `<span class="set-detail">${setIndex + 1}: ${set.time}min / ${set.distance}km</span>`;
                } else {
                    return `<span class="set-detail">${setIndex + 1}: ${set.reps}×${set.weight}kg</span>`;
                }
            }).join('')}
                </div>
            </div>
            `;
        }).join('');
    },

    removeExercise(index) {
        if (confirm('¿Eliminar este ejercicio?')) {
            this.exercises.splice(index, 1);
            this.renderExercises();
            showToast('Ejercicio eliminado', 'success');
        }
    },

    finish() {
        if (this.exercises.length === 0) {
            if (!confirm('No has añadido ningún ejercicio. ¿Seguro que quieres finalizar?')) {
                return;
            }
        }

        const duration = this.getElapsedMinutes();

        // Determine primary category
        const categories = new Set();
        this.exercises.forEach(ex => {
            if (ex.category && ex.category !== 'custom') {
                categories.add(ex.category);
            }
        });

        let primaryCategory = 'general';
        if (categories.size > 0) {
            primaryCategory = Array.from(categories)[0];
        }

        // Create workout object
        const workout = {
            id: Date.now(),
            name: this.workoutName,
            category: primaryCategory,
            exercises: this.exercises,
            notes: '',
            date: this.startTime.toISOString(),
            duration: duration
        };

        // Save workout
        AppState.workouts.unshift(workout);
        Storage.save();

        // Reset session
        this.stopTimer();
        this.isActive = false;
        this.workoutName = '';
        this.startTime = null;
        this.exercises = [];
        this.currentExercise = null;

        this.hideOverlay();
        updateUI();
        showToast(`¡Entrenamiento completado! Duración: ${duration} min`, 'success');
    }
};

// Modified Exercise Selector to work with Active Session
ExerciseSelector.openForActive = function () {
    const modal = document.getElementById('exerciseSelectorModal');
    modal.classList.add('active');
    this.resetFilters();
    this.renderExercises();
    this.isActiveMode = true;
};

// Override selectExercise for active mode
const originalSelectExercise = ExerciseSelector.selectExercise;
ExerciseSelector.selectExercise = function (exercise) {
    if (this.isActiveMode) {
        this.close();
        this.isActiveMode = false;
        ActiveWorkoutSession.openAddExerciseModal(exercise.name, exercise.muscle, exercise.images, exercise.category);
    } else {
        originalSelectExercise.call(this, exercise);
    }
};

const originalSelectCustom = ExerciseSelector.selectCustomExercise;
ExerciseSelector.selectCustomExercise = function () {
    if (this.isActiveMode) {
        this.close();
        this.isActiveMode = false;
        CustomExerciseModal.open();
    } else {
        originalSelectCustom.call(this);
    }
};

// Custom Exercise Modal Logic
const CustomExerciseModal = {
    open() {
        document.getElementById('customExerciseName').value = '';
        document.getElementById('customExerciseModal').classList.add('active');
        // Focus input after a small delay to ensure modal is visible
        setTimeout(() => {
            document.getElementById('customExerciseName').focus();
        }, 100);
    },

    close() {
        document.getElementById('customExerciseModal').classList.remove('active');
    }
};

// Initialize Custom Exercise Modal Listeners
document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById('closeCustomExerciseModal');
    if (closeBtn) closeBtn.addEventListener('click', CustomExerciseModal.close);

    const cancelBtn = document.getElementById('cancelCustomExerciseBtn');
    if (cancelBtn) cancelBtn.addEventListener('click', CustomExerciseModal.close);

    const form = document.getElementById('customExerciseForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('customExerciseName').value;
            if (name && name.trim()) {
                CustomExerciseModal.close();
                ActiveWorkoutSession.openAddExerciseModal(name.trim(), 'custom');
            }
        });
    }
});
