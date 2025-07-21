document.addEventListener("DOMContentLoaded", () => {
    // --- CONFIGURATION & DONNÉES ---
    const config = {
        levels: ["Débutant", "Intermédiaire", "Avancé", "Elite"],
        modules: [
            { id: "positionnement", title: "Positionnement", icon: "fa-solid fa-crosshairs", color: "blue" },
            { id: "tirPasse", title: "Tir & Passe", icon: "fa-solid fa-bolt", color: "green" },
            { id: "technique", title: "Technique", icon: "fa-solid fa-star", color: "purple", isLocked: true },
            { id: "intelligence", title: "Intelligence de Jeu", icon: "fa-solid fa-brain", color: "orange", isLocked: true },
        ],
        exercises: {
            positionnement: [
                { id:"pos1", title: "Situation 2 contre 1", level: "Débutant", scenario: "L'adversaire arrive à 2 contre vous...", question: "Votre priorité ?", options: ["Attaquer le porteur", "Couper la ligne de passe", "Reculer"], correct: 1, explanation: "Priorité n°1 : empêcher la passe.", points: 10 },
                { id:"pos3", title: "'Pincer' à la ligne bleue", level: "Intermédiaire", scenario: "La rondelle longe la bande en zone offensive...", question: "Quand pincer ?", options: ["Toujours", "Si sûr de la récupérer", "Jamais"], correct: 1, explanation: "Un pinch est une décision à haut risque.", points: 20 },
            ],
            tirPasse: [
                { id:"tir1", title: "Passe de sortie de zone", level: "Débutant", scenario: "Vous êtes sous pression dans le coin...", question: "Passe la plus sûre ?", options: ["Passe au centre", "Passe indirecte via la bande", "Dégagement en cloche"], correct: 1, explanation: "La passe indirecte le long de la bande est la plus fiable.", points: 10 },
            ]
        }
    };

    // --- ÉTAT DU JOUEUR ---
    let state = {
        currentLevel: "Débutant",
        points: 0,
    };

    // --- ÉLÉMENTS DU DOM ---
    const views = {
        dashboard: document.getElementById('dashboard-view'),
        module: document.getElementById('module-view'),
        exercise: document.getElementById('exercise-view'),
    };
    const displays = {
        level: document.getElementById('level-display'),
        points: document.getElementById('points-display'),
    };
    const containers = {
        modules: document.getElementById('modules-container'),
    };
    const navDashboardBtn = document.getElementById('nav-dashboard-btn');
    
    // --- LOGIQUE PRINCIPALE ---
    const saveState = () => localStorage.setItem("hockeyTrainerState", JSON.stringify(state));
    const loadState = () => {
        const saved = localStorage.getItem("hockeyTrainerState");
        if (saved) {
            state = JSON.parse(saved);
        }
    };

    const switchView = (viewName) => {
        Object.values(views).forEach(v => v.classList.add('hidden'));
        views[viewName].classList.remove('hidden');
    };

    // --- FONCTIONS DE RENDU (Génération du HTML) ---
    const renderDashboard = () => {
        displays.level.textContent = state.currentLevel;
        displays.points.textContent = state.points;
        
        containers.modules.innerHTML = config.modules.map(mod => `
            <button class="module-btn bg-${mod.color}" data-module-id="${mod.id}" ${mod.isLocked ? 'disabled' : ''}>
                <i class="${mod.icon} icon"></i>
                <p>${mod.title} ${mod.isLocked ? '(Bientôt)' : ''}</p>
            </button>
        `).join('');

        // Attacher les écouteurs d'événements après avoir créé les boutons
        document.querySelectorAll('.module-btn').forEach(btn => {
            if (!btn.disabled) {
                btn.addEventListener('click', () => renderModuleView(btn.dataset.moduleId));
            }
        });

        switchView('dashboard');
    };

    const renderModuleView = (moduleId) => {
        const module = config.modules.find(m => m.id === moduleId);
        const exercises = config.exercises[moduleId] || [];
        
        views.module.innerHTML = `
            <div class="card">
                <h2 class="color-${module.color}"><i class="${module.icon} icon-left"></i>${module.title}</h2>
                <div class="exercise-list">
                    ${exercises.length > 0 ? exercises.map(ex => {
                        const isLocked = config.levels.indexOf(ex.level) > config.levels.indexOf(state.currentLevel);
                        return `
                        <div class="exercise-list-item ${isLocked ? 'locked' : ''}" data-exercise-id="${ex.id}" data-module-id="${moduleId}">
                            <div>
                                <p class="exercise-title">${ex.title}</p>
                                <span class="exercise-level">${ex.level}</span>
                            </div>
                            ${isLocked ? `<i class="fa-solid fa-lock"></i>` : `<i class="fa-solid fa-chevron-right"></i>`}
                        </div>`;
                    }).join('') : '<p>Aucun exercice pour ce module pour le moment.</p>'}
                </div>
            </div>`;
        
        // Attacher les écouteurs
        document.querySelectorAll('.exercise-list-item:not(.locked)').forEach(item => {
            item.addEventListener('click', () => renderExerciseView(item.dataset.moduleId, item.dataset.exerciseId));
        });
        
        switchView('module');
    };

    const renderExerciseView = (moduleId, exerciseId) => {
        const exercise = config.exercises[moduleId].find(ex => ex.id === exerciseId);
        
        views.exercise.innerHTML = `
            <div class="card">
                <h2>${exercise.title}</h2>
                <p class="exercise-scenario">${exercise.scenario}</p>
                <h3>${exercise.question}</h3>
                <div class="options-container">
                    ${exercise.options.map((opt, i) => `<button class="option-btn" data-index="${i}">${opt}</button>`).join('')}
                </div>
                <div class="feedback-container"></div>
            </div>`;

        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => handleAnswer(e, exercise));
        });

        switchView('exercise');
    };

    const handleAnswer = (event, exercise) => {
        const selectedIndex = parseInt(event.target.dataset.index);
        const feedbackContainer = views.exercise.querySelector('.feedback-container');
        
        document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);

        if (selectedIndex === exercise.correct) {
            state.points += exercise.points;
            event.target.classList.add('correct');
            feedbackContainer.innerHTML = `
                <div class="feedback correct">
                    <p><strong>Bonne réponse ! (+${exercise.points} points)</strong></p>
                    <p>${exercise.explanation}</p>
                </div>`;
        } else {
            event.target.classList.add('incorrect');
            views.exercise.querySelector(`.option-btn[data-index='${exercise.correct}']`).classList.add('correct');
            feedbackContainer.innerHTML = `
                <div class="feedback incorrect">
                    <p><strong>Mauvaise réponse.</strong></p>
                    <p>${exercise.explanation}</p>
                </div>`;
        }
        saveState();
        feedbackContainer.innerHTML += `<button id="back-to-dashboard-after-exercise" class="btn btn-blue" style="margin-top: 1rem;">Retour au Tableau de Bord</button>`;
        document.getElementById('back-to-dashboard-after-exercise').addEventListener('click', renderDashboard);
    };

    // --- INITIALISATION ---
    navDashboardBtn.addEventListener('click', renderDashboard);
    loadState();
    renderDashboard();
});
