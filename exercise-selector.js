// Continuation of app.js - Exercise Selector functionality

// ==========================================
// EXERCISE SELECTOR
// ==========================================

const ExerciseSelector = {
    currentFilters: {
        muscle: 'all',
        equipment: 'all',
        search: ''
    },
    targetContainer: 'exercisesList', // Default container

    open(targetContainer = 'exercisesList') {
        this.targetContainer = targetContainer;
        const modal = document.getElementById('exerciseSelectorModal');
        modal.classList.add('active');
        this.resetFilters();
        this.renderExercises();
    },

    close() {
        const modal = document.getElementById('exerciseSelectorModal');
        modal.classList.remove('active');
    },

    resetFilters() {
        this.currentFilters = {
            muscle: 'all',
            equipment: 'all',
            search: ''
        };
        document.getElementById('exerciseSearch').value = '';

        // Reset muscle filters
        document.querySelectorAll('#muscleFilters .chip').forEach(chip => {
            chip.classList.toggle('active', chip.dataset.filter === 'all');
        });

        // Reset equipment filters
        document.querySelectorAll('#equipmentFilters .chip').forEach(chip => {
            chip.classList.toggle('active', chip.dataset.filter === 'all');
        });
    },

    filterExercises() {
        let filtered = window.ExercisesDatabase || [];

        // Filter by muscle group
        if (this.currentFilters.muscle !== 'all') {
            filtered = filtered.filter(ex => ex.muscle === this.currentFilters.muscle);
        }

        // Filter by equipment
        if (this.currentFilters.equipment !== 'all') {
            filtered = filtered.filter(ex => ex.equipment === this.currentFilters.equipment);
        }

        // Filter by search
        if (this.currentFilters.search) {
            const searchLower = this.currentFilters.search.toLowerCase();
            filtered = filtered.filter(ex =>
                ex.name.toLowerCase().includes(searchLower)
            );
        }

        return filtered;
    },

    renderExercises() {
        const list = document.getElementById('exerciseSelectorList');
        const filtered = this.filterExercises();

        if (filtered.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="16"></line>
                        <line x1="8" y1="12" x2="16" y2="12"></line>
                    </svg>
                    <p class="empty-text">No se encontraron ejercicios</p>
                    <p class="empty-subtext">Intenta con otros filtros</p>
                </div>
            `;
            return;
        }

        list.innerHTML = filtered.map(exercise => `
            <div class="exercise-selector-item" data-exercise-id="${exercise.id}">
                ${exercise.images && exercise.images.length > 0 ?
                `<img src="${exercise.images[0]}" alt="${exercise.name}" class="exercise-selector-image" loading="lazy">` :
                `<div class="exercise-selector-image-placeholder">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path>
                            <line x1="16" y1="8" x2="2" y2="22"></line>
                            <line x1="17.5" y1="15" x2="9" y2="15"></line>
                        </svg>
                    </div>`
            }
                <div class="exercise-selector-info">
                    <div class="exercise-selector-name">${exercise.name}</div>
                    <div class="exercise-selector-meta">
                        <span class="exercise-meta-tag">${window.MuscleGroups[exercise.muscle] || exercise.muscle}</span>
                        <span class="exercise-meta-tag equipment">${window.EquipmentTypes[exercise.equipment] || exercise.equipment}</span>
                    </div>
                </div>
                <svg class="exercise-selector-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </div>
        `).join('');

        // Add click listeners
        document.querySelectorAll('.exercise-selector-item').forEach(item => {
            item.addEventListener('click', () => {
                const exerciseId = parseInt(item.dataset.exerciseId);
                const exercise = window.ExercisesDatabase.find(ex => ex.id === exerciseId);
                this.selectExercise(exercise);
            });
        });
    },

    selectExercise(exercise) {
        this.close();
        addExerciseToWorkout(exercise.name, exercise.muscle, exercise.images, exercise.category, null, this.targetContainer);
    },

    selectCustomExercise() {
        this.close();
        const name = prompt('Nombre del ejercicio personalizado:');
        if (name && name.trim()) {
            addExerciseToWorkout(name.trim(), 'custom', [], 'strength', null, this.targetContainer);
        }
    }
};

// Updated: Add exercise to workout with individual sets support
function addExerciseToWorkout(exerciseName, category = 'custom', images = [], exerciseType = 'strength', existingSets = null, targetContainerId = 'exercisesList') {
    currentExerciseCount++;
    const container = document.getElementById(targetContainerId);
    if (!container) return; // Safety check

    const exerciseForm = document.createElement('div');
    exerciseForm.className = 'exercise-form';
    exerciseForm.dataset.exerciseId = currentExerciseCount;
    exerciseForm.dataset.exerciseName = exerciseName;
    exerciseForm.dataset.category = category;
    exerciseForm.dataset.type = exerciseType;
    exerciseForm.dataset.setCount = 0;

    // Find exercise images (use passed images or fallback to search)
    let exerciseImages = images;
    if ((!exerciseImages || exerciseImages.length === 0) && window.ExercisesDatabase) {
        const exercise = window.ExercisesDatabase.find(ex => ex.name === exerciseName);
        if (exercise) {
            exerciseImages = exercise.images;
        }
    }

    let imagesHtml = '';
    if (exerciseImages && exerciseImages.length > 0) {
        imagesHtml = `
            <div class="exercise-images-preview">
                ${exerciseImages.map(img => `<img src="${img}" alt="${exerciseName}" loading="lazy">`).join('')}
            </div>
        `;
    }

    exerciseForm.innerHTML = `
        <div class="exercise-form-header">
            <span class="exercise-number">${exerciseName}</span>
            <button type="button" class="remove-exercise-btn" onclick="removeExercise(${currentExerciseCount})">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
        ${imagesHtml}
        <div class="form-group">
            <div class="sets-header">
                <label class="form-label">Series</label>
                <button type="button" class="btn btn-secondary btn-sm" onclick="addSetToExercise(${currentExerciseCount})">
                    + Añadir Serie
                </button>
            </div>
            <div id="setsList${currentExerciseCount}" class="sets-list">
                <!-- Sets will be added here -->
            </div>
        </div>
    `;

    container.appendChild(exerciseForm);

    // Add sets (either existing or default empty one)
    if (existingSets && existingSets.length > 0) {
        existingSets.forEach(set => {
            addSetToExercise(currentExerciseCount, set);
        });
    } else {
        addSetToExercise(currentExerciseCount);
    }
}

// Add a set to an exercise
function addSetToExercise(exerciseId, setData = null) {
    const exerciseForm = document.querySelector(`[data-exercise-id="${exerciseId}"]`);
    if (!exerciseForm) return;

    const setsList = exerciseForm.querySelector(`#setsList${exerciseId}`);
    let setCount = parseInt(exerciseForm.dataset.setCount) || 0;
    setCount++;
    exerciseForm.dataset.setCount = setCount;

    const isCardio = exerciseForm.dataset.type === 'cardio';
    let inputsHtml = '';

    if (isCardio) {
        inputsHtml = `
            <input type="number" class="form-input set-time" placeholder="Min" min="1" required value="${setData ? setData.time : ''}">
            <span class="set-separator">min</span>
            <input type="number" class="form-input set-distance" placeholder="Km" step="0.01" required value="${setData ? setData.distance : ''}">
            <span class="set-separator">km</span>
        `;
    } else {
        inputsHtml = `
            <input type="number" class="form-input set-reps" placeholder="Reps" min="1" required value="${setData ? setData.reps : ''}">
            <span class="set-separator">×</span>
            <input type="number" class="form-input set-weight" placeholder="kg" step="0.5" required value="${setData ? setData.weight : ''}">
        `;
    }

    const setItem = document.createElement('div');
    setItem.className = 'set-item';
    setItem.dataset.setId = setCount;
    setItem.innerHTML = `
        <div class="set-number">Serie ${setCount}</div>
        <div class="set-inputs">
            ${inputsHtml}
            <button type="button" class="remove-set-btn" onclick="removeSetFromExercise(${exerciseId}, ${setCount})" title="Eliminar serie">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
    `;

    setsList.appendChild(setItem);
}

// Remove a set from an exercise
function removeSetFromExercise(exerciseId, setId) {
    const exerciseForm = document.querySelector(`[data-exercise-id="${exerciseId}"]`);
    const setItem = exerciseForm.querySelector(`[data-set-id="${setId}"]`);
    if (setItem) {
        setItem.remove();
        // Renumber remaining sets
        renumberSets(exerciseId);
    }
}

// Renumber sets after deletion
function renumberSets(exerciseId) {
    const exerciseForm = document.querySelector(`[data-exercise-id="${exerciseId}"]`);
    const sets = exerciseForm.querySelectorAll('.set-item');
    sets.forEach((set, index) => {
        const setNumber = set.querySelector('.set-number');
        setNumber.textContent = `Serie ${index + 1}`;
    });
}

// Updated: Save workout (modified to work without category selector)
function saveWorkoutUpdated(e) {
    e.preventDefault();

    const notes = document.getElementById('workoutNotes').value;

    const exercises = [];
    const categories = new Set();

    document.querySelectorAll('.exercise-form').forEach(form => {
        const name = form.dataset.exerciseName;
        const category = form.dataset.category;
        const inputs = form.querySelectorAll('.sets-grid input');
        const sets = parseInt(inputs[0].value) || 0;
        const reps = parseInt(inputs[1].value) || 0;
        const weight = parseFloat(inputs[2].value) || 0;

        exercises.push({ name, sets, reps, weight });
        if (category !== 'custom') {
            categories.add(category);
        }
    });

    if (exercises.length === 0) {
        showToast('Añade al menos un ejercicio', 'error');
        return;
    }

    // Determine primary category (most common muscle group)
    let primaryCategory = 'general';
    if (categories.size > 0) {
        primaryCategory = Array.from(categories)[0];
    }

    const workout = {
        id: Date.now(),
        category: primaryCategory,
        exercises,
        notes,
        date: new Date().toISOString(),
        duration: Math.floor(Math.random() * 30) + 30
    };

    AppState.workouts.unshift(workout);
    Storage.save();

    closeAddWorkoutModal();
    showToast('Entrenamiento guardado', 'success');
    updateUI();
}

// Initialize Exercise Selector Event Listeners
function initializeExerciseSelectorListeners() {
    // Open exercise selector - handled by ActiveWorkoutSession now
    // document.getElementById('addExerciseBtn')?.addEventListener('click', () => {
    //     ExerciseSelector.open();
    // });

    // Close exercise selector
    document.getElementById('closeExerciseSelector').addEventListener('click', () => {
        ExerciseSelector.close();
    });

    // Search
    document.getElementById('exerciseSearch').addEventListener('input', (e) => {
        ExerciseSelector.currentFilters.search = e.target.value;
        ExerciseSelector.renderExercises();
    });

    // Muscle filters
    document.querySelectorAll('#muscleFilters .chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent any default button behavior
            e.stopPropagation(); // Stop propagation just in case

            document.querySelectorAll('#muscleFilters .chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');

            ExerciseSelector.currentFilters.muscle = chip.dataset.filter;
            ExerciseSelector.renderExercises();
        });
    });

    // Equipment filters
    document.querySelectorAll('#equipmentFilters .chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('#equipmentFilters .chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            ExerciseSelector.currentFilters.equipment = chip.dataset.filter;
            ExerciseSelector.renderExercises();
        });
    });

    // Custom exercise
    document.getElementById('addCustomExerciseBtn').addEventListener('click', () => {
        ExerciseSelector.selectCustomExercise();
    });
}
