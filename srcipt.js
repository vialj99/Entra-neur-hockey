document.addEventListener("DOMContentLoaded", () => {
    // ======== DATA ========
    const a = {
        levels: ["Débutant", "Intermédiaire", "Avancé", "Elite"],
        modules: {
            positionnement: { id: "positionnement", title: "Positionnement", icon: "fa-solid fa-crosshairs", color: "bg-blue" },
            tirPasse: { id: "tirPasse", title: "Tir & Passe", icon: "fa-solid fa-bolt", color: "bg-green" },
            technique: { id: "technique", title: "Technique", icon: "fa-solid fa-star", color: "bg-purple" },
            intelligence: { id: "intelligence", title: "Intelligence de Jeu", icon: "fa-solid fa-brain", color: "bg-orange" },
        },
        exercises: {
            positionnement: [
                { id:"pos1", title: "Situation 2 contre 1", level: "Débutant", scenario: "L'adversaire arrive à 2 contre vous. Votre bâton doit couper la ligne de passe pendant que votre corps contrôle le porteur de la rondelle. Quelle est votre priorité ?", question: "Que faites-vous en premier ?", options: ["Attaquer le porteur", "Couper la ligne de passe", "Reculer vers le gardien"], correct: 1, explanation: "Priorité n°1 : empêcher la passe. Cela force le porteur à prendre un tir d'un angle plus difficile.", points: 10 },
                { id:"pos2", title: "Défense de la 'Maison'", level: "Débutant", scenario: "La 'maison' est la zone la plus dangereuse : l'enclave. Un attaquant adverse s'y trouve sans la rondelle.", question: "Votre action ?", options: ["Le surveiller de loin", "Le marquer de près, contact physique", "Ignorer, la rondelle est ailleurs"], correct: 1, explanation: "Neutralisez toujours l'homme libre dans l'enclave. Un attaquant sans surveillance est une menace imminente.", points: 10 },
                { id:"pos3", title: "Pincer' à la ligne bleue", level: "Intermédiaire", scenario: "La rondelle longe la bande en zone offensive. Vous pouvez 'pincer' pour la conserver en zone.", question: "Quand est-ce le bon moment pour pincer ?", options: ["Toujours, pour être agressif", "Uniquement si vous êtes sûr à 100% de la récupérer", "Jamais, c'est trop risqué"], correct: 1, explanation: "Un pinch est une décision à haut risque/haute récompense. Ne le tentez que si vous êtes certain du succès pour éviter un surnombre contre vous. [1]", points: 20 },
            ],
            tirPasse: [
                { id:"tir1", title: "Passe de sortie de zone", level: "Débutant", scenario: "Vous êtes sous pression dans le coin de la patinoire. Votre ailier est sur la bande.", question: "Quelle est la passe la plus sûre ?", options: ["Passe au centre", "Passe indirecte via la bande", "Dégagement en cloche"], correct: 1, explanation: "La passe indirecte le long de la bande est la sortie de zone la plus fiable et la plus enseignée sous pression.", points: 10 },
                { id:"tir2", title: "Tir bas pour déviation", level: "Intermédiaire", scenario: "Vous avez du temps à la ligne bleue pour tirer. Vos attaquants sont devant le filet.", question: "Quel type de tir a le plus de chances de marquer ?", options: ["Tir frappé dans la lucarne", "Tir des poignets bas et fort", "Tir flottant"], correct: 1, explanation: "Un tir bas et dur est plus facile à dévier par vos coéquipiers et peut générer de dangereux retours pour le gardien.", points: 20 },
            ]
        },
        levelTests: {
            Débutant: {
                title: "Test de Passage - Niveau Intermédiaire",
                questions: [
                    { question: "En zone défensive, quelle est la priorité absolue ?", options: ["Suivre la rondelle", "Protéger 'la maison' (l'enclave)", "Rester près de la bande"], correct: 1 },
                    { question: "Quelle est la distance idéale ('gap control') à maintenir face à un attaquant ?", options: ["Le plus près possible", "Une longueur de bâton", "Deux longueurs de bâton"], correct: 1 },
                ],
            },
             Intermédiaire: {
                title: "Test de Passage - Niveau Avancé",
                questions: [
                    { question: "Comment réagir à un 'cycling' de l'adversaire derrière votre but ?", options: ["Suivre son joueur partout", "Rester statique devant le but", "Communiquer et échanger avec son partenaire"], correct: 2 },
                    { question: "Un 'pinch' raté à la ligne bleue mène souvent à...", options: ["Une pénalité", "Un surnombre contre vous", "Une mise au jeu"], correct: 1 },
                ]
            },
        },
    };

    // ======== STATE ========
    let state = {
        currentLevel: "Débutant",
        playerStats: { points: 0, testsCompleted: 0 },
    };

    // ======== DOM ELEMENTS ========
    const mainContent = document.getElementById("main-content");

    // ======== LOGIC ========
    const switchView = (targetViewId) => {
        document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
        document.getElementById(targetViewId).classList.add("active");
        window.scrollTo(0, 0);
    };

    const saveState = () => {
        localStorage.setItem("hockeyTrainerState", JSON.stringify(state));
    };

    const loadState = () => {
        const savedState = localStorage.getItem("hockeyTrainerState");
        if (savedState) {
            state = JSON.parse(savedState);
        }
    };
    
    // ======== RENDER FUNCTIONS ========
    const renderDashboard = () => {
        const dashboardView = document.getElementById('dashboard-view');
        
        // Update stats
        document.getElementById("current-level-display").textContent = state.currentLevel;
        document.getElementById("stats-points").textContent = state.playerStats.points;
        document.getElementById("stats-tests").textContent = state.playerStats.testsCompleted;

        // Render modules
        const modulesContainer = document.getElementById("modules-container");
        modulesContainer.innerHTML = `<h3><i class="fa-solid fa-book-open icon-left"></i>Modules d'Entraînement</h3>`;
        const modulesGrid = document.createElement('div');
        modulesGrid.className = 'modules-grid';
        Object.values(a.modules).forEach(mod => {
            modulesGrid.innerHTML += `
                <button class="module-btn ${mod.color}" data-module-id="${mod.id}">
                    <i class="${mod.icon} icon"></i><p>${mod.title}</p>
                </button>`;
        });
        modulesContainer.appendChild(modulesGrid);

        // Render level test
        const testContainer = document.getElementById("level-test-container");
        const nextLevel = a.levels[a.levels.indexOf(state.currentLevel) + 1];
        if (nextLevel && a.levelTests[state.currentLevel]) {
             testContainer.innerHTML = `
                <h3><i class="fa-solid fa-graduation-cap icon-left"></i>Test de Niveau</h3>
                <p>Prêt à passer au niveau <strong>${nextLevel}</strong> ?</p>
                <button id="start-test-btn" class="btn btn-red" style="width: 100%;">
                    <i class="fa-solid fa-play icon-left"></i>Commencer le Test
                </button>`;
        } else {
            testContainer.innerHTML = `<h3><i class="fa-solid fa-trophy icon-left"></i>Félicitations !</h3><p class="font-bold">🏆 Niveau Elite Atteint!</p>`;
        }
        
        switchView("dashboard-view");
    };

    const renderModuleView = (moduleId) => {
        const module = a.modules[moduleId];
        const moduleExercises = a.exercises[moduleId] || [];
        const view = document.getElementById('module-view');

        let exercisesHtml = moduleExercises.map(ex => {
            const isLocked = a.levels.indexOf(ex.level) > a.levels.indexOf(state.currentLevel);
            return `
            <div class="exercise-list-item ${isLocked ? 'locked' : ''}" data-exercise-id="${ex.id}" data-module-id="${moduleId}">
                <div>
                    <p class="exercise-title">${ex.title}</p>
                    <span class="exercise-level">${ex.level}</span>
                </div>
                ${isLocked 
                    ? `<button class="btn" disabled><i class="fa-solid fa-lock"></i></button>`
                    : `<button class="btn btn-blue">Commencer</button>`
                }
            </div>`;
        }).join('');

        view.innerHTML = `
            <div class="card">
                <h2 style="color: var(--${module.color.replace('bg-', '')}-500);"><i class="${module.icon} icon-left"></i>${module.title}</h2>
                <div class="exercise-list">${exercisesHtml}</div>
            </div>`;
        switchView('module-view');
    };

    const renderExerciseView = (moduleId, exerciseId) => {
        const exercise = a.exercises[moduleId].find(ex => ex.id === exerciseId);
        const view = document.getElementById('exercise-view');
        
        view.innerHTML = `
            <div class="card">
                <h2>${exercise.title}</h2>
                <p class="exercise-scenario">${exercise.scenario}</p>
                <h3>${exercise.question}</h3>
                <div id="options-container">
                    ${exercise.options.map((opt, index) => `<button class="option-btn" data-index="${index}">${opt}</button>`).join('')}
                </div>
                <div id="exercise-feedback"></div>
            </div>`;

        document.getElementById('options-container').addEventListener('click', e => {
            if (e.target.tagName === 'BUTTON') {
                const selectedIndex = parseInt(e.target.dataset.index);
                const feedbackContainer = document.getElementById('exercise-feedback');
                
                // Disable all buttons
                document.querySelectorAll('#options-container button').forEach(btn => btn.disabled = true);

                if (selectedIndex === exercise.correct) {
                    state.playerStats.points += exercise.points;
                    saveState();
                    e.target.classList.add('correct');
                    feedbackContainer.innerHTML = `
                        <div class="feedback correct">
                            <p><strong>Bonne réponse !</strong> (+${exercise.points} points)</p>
                            <p>${exercise.explanation}</p>
                        </div>`;
                } else {
                    e.target.classList.add('incorrect');
                    document.querySelector(`#options-container button[data-index='${exercise.correct}']`).classList.add('correct');
                    feedbackContainer.innerHTML = `
                        <div class="feedback incorrect">
                            <p><strong>Mauvaise réponse.</strong></p>
                            <p>${exercise.explanation}</p>
                        </div>`;
                }
                feedbackContainer.innerHTML += `<button id="back-to-module-btn" class="btn btn-blue" style="margin-top: 1rem;">Retour aux exercices</button>`;
                document.getElementById('back-to-module-btn').onclick = () => renderModuleView(moduleId);
            }
        });

        switchView('exercise-view');
    };
    
    // ======== EVENT LISTENERS ========
    mainContent.addEventListener('click', e => {
        const target = e.target;
        // Navigate to Module from Dashboard
        if (target.closest('.module-btn')) {
            renderModuleView(target.closest('.module-btn').dataset.moduleId);
        }
        // Start Level Test from Dashboard
        if (target.id === 'start-test-btn') {
            alert("La fonction Test de Niveau sera bientôt disponible ! Entraînez-vous avec les exercices en attendant.");
        }
        // Start an exercise from Module view
        if (target.closest('.exercise-list-item') && !target.closest('.locked')) {
            const item = target.closest('.exercise-list-item');
            if (item.contains(target) && target.tagName === 'BUTTON') {
                renderExerciseView(item.dataset.moduleId, item.dataset.exerciseId);
            }
        }
    });
    
    document.getElementById('nav-dashboard-btn').addEventListener('click', renderDashboard);

    // ======== INITIALIZATION ========
    loadState();
    renderDashboard();
});```
