// Affiche un message dans la console du développeur pour confirmer que le bon script est chargé.
console.log("Hockey Trainer Script v4.0 Loaded. L'interactivité est activée.");

document.addEventListener("DOMContentLoaded", () => {
    // ======== CONFIGURATION (DATA) ========
    const config = {
        levels: ["Débutant", "Intermédiaire", "Avancé", "Elite"],
        modules: {
            positionnement: { id: "positionnement", title: "Positionnement", icon: "fa-solid fa-crosshairs", color: "blue" },
            tirPasse: { id: "tirPasse", title: "Tir & Passe", icon: "fa-solid fa-bolt", color: "green" },
            technique: { id: "technique", title: "Technique", icon: "fa-solid fa-star", color: "purple" },
            intelligence: { id: "intelligence", title: "Intelligence de Jeu", icon: "fa-solid fa-brain", color: "orange" },
        },
        exercises: {
            positionnement: [
                { id:"pos1", title: "Situation 2 contre 1", level: "Débutant", scenario: "L'adversaire arrive à 2 contre vous. Votre bâton doit couper la ligne de passe pendant que votre corps contrôle le porteur de la rondelle.", question: "Quelle est votre priorité ?", options: ["Attaquer le porteur", "Couper la ligne de passe", "Reculer vers le gardien"], correct: 1, explanation: "Priorité n°1 : empêcher la passe. Cela force le porteur à prendre un tir d'un angle plus difficile.", points: 10 },
                { id:"pos2", title: "Défense de la 'Maison'", level: "Débutant", scenario: "La 'maison' est la zone la plus dangereuse : l'enclave. Un attaquant adverse s'y trouve sans la rondelle.", question: "Votre action ?", options: ["Le surveiller de loin", "Le marquer de près, contact physique", "Ignorer, la rondelle est ailleurs"], correct: 1, explanation: "Neutralisez toujours l'homme libre dans l'enclave. Un attaquant sans surveillance est une menace imminente.", points: 10 },
                { id:"pos3", title: "'Pincer' à la ligne bleue", level: "Intermédiaire", scenario: "La rondelle longe la bande en zone offensive. Vous pouvez 'pincer' pour la conserver en zone.", question: "Quand est-ce le bon moment pour pincer ?", options: ["Toujours, pour être agressif", "Uniquement si vous êtes sûr de la récupérer", "Jamais, c'est trop risqué"], correct: 1, explanation: "Un pinch est une décision à haut risque. Ne le tentez que si vous êtes certain du succès pour éviter un surnombre contre vous.", points: 20 },
            ],
            tirPasse: [
                { id:"tir1", title: "Passe de sortie de zone", level: "Débutant", scenario: "Vous êtes sous pression dans le coin de la patinoire. Votre ailier est sur la bande.", question: "Quelle est la passe la plus sûre ?", options: ["Passe au centre", "Passe indirecte via la bande", "Dégagement en cloche"], correct: 1, explanation: "La passe indirecte le long de la bande est la sortie de zone la plus fiable sous pression.", points: 10 },
                { id:"tir2", title: "Tir bas pour déviation", level: "Intermédiaire", scenario: "Vous avez du temps à la ligne bleue. Vos attaquants sont devant le filet.", question: "Quel type de tir a le plus de chances de marquer ?", options: ["Tir frappé dans la lucarne", "Tir des poignets bas et fort", "Tir flottant"], correct: 1, explanation: "Un tir bas et dur est plus facile à dévier par vos coéquipiers et peut générer de dangereux retours.", points: 20 },
            ]
        }
    };

    // ======== ÉTAT DU JOUEUR ========
    let state = {
        currentLevel: "Débutant",
        playerStats: { points: 0 },
    };

    // ======== ÉLÉMENTS DU DOM ========
    const mainContent = document.getElementById("main-content");
    const navDashboardBtn = document.getElementById("nav-dashboard-btn");

    // ======== FONCTIONS PRINCIPALES ========
    const switchView = (viewId) => {
        document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
        document.getElementById(viewId).classList.add("active");
        window.scrollTo(0, 0);
    };

    const saveState = () => localStorage.setItem("hockeyTrainerState", JSON.stringify(state));
    const loadState = () => {
        const savedState = localStorage.getItem("hockeyTrainerState");
        if (savedState) state = JSON.parse(savedState);
    };

    // ======== FONCTIONS DE RENDU (Génération du HTML) ========
    const renderDashboard = () => {
        const view = document.getElementById('dashboard-view');
        view.innerHTML = `
            <div class="welcome-banner card">
                <h2>Bienvenue, Défenseur!</h2>
                <p>Niveau actuel: <span class="font-bold">${state.currentLevel}</span></p>
            </div>
            <div class="stats-grid">
                <div class="stat-card card"><i class="fa-solid fa-trophy icon"></i><p class="stat-value">${state.playerStats.points}</p><p class="stat-label">Points</p></div>
            </div>
            <div class="card">
                <h3><i class="fa-solid fa-book-open icon-left"></i>Modules d'Entraînement</h3>
                <div class="modules-grid">
                    ${Object.values(config.modules).map(mod => `
                        <button class="module-btn bg-${mod.color}" data-module-id="${mod.id}">
                            <i class="${mod.icon} icon"></i><p>${mod.title}</p>
                        </button>
                    `).join('')}
                </div>
            </div>`;
        switchView('dashboard-view');
    };

    const renderModuleView = (moduleId) => {
        const module = config.modules[moduleId];
        const moduleExercises = config.exercises[moduleId] || [];
        const view = document.getElementById('module-view');
        view.innerHTML = `
            <div class="card">
                <h2 class="color-${module.color}"><i class="${module.icon} icon-left"></i>${module.title}</h2>
                <div class="exercise-list">
                    ${moduleExercises.map(ex => {
                        const isLocked = config.levels.indexOf(ex.level) > config.levels.indexOf(state.currentLevel);
                        return `
                        <div class="exercise-list-item ${isLocked ? 'locked' : ''}" data-module-id="${moduleId}" data-exercise-id="${ex.id}">
                            <div>
                                <p class="exercise-title">${ex.title}</p>
                                <span class="exercise-level">${ex.level}</span>
                            </div>
                            ${isLocked ? `<i class="fa-solid fa-lock"></i>` : `<i class="fa-solid fa-chevron-right"></i>`}
                        </div>`;
                    }).join('')}
                </div>
            </div>`;
        switchView('module-view');
    };

    const renderExerciseView = (moduleId, exerciseId) => {
        const exercise = config.exercises[moduleId].find(ex => ex.id === exerciseId);
        const view = document.getElementById('exercise-view');
        view.innerHTML = `
            <div class="card">
                <h2>${exercise.
