document.addEventListener('DOMContentLoaded', () => {

    // ======== DATA ========
    const levels = ['Débutant', 'Intermédiaire', 'Avancé', 'Elite'];
    const modules = {
        positionnement: { title: 'Positionnement', icon: 'fa-solid fa-crosshairs', color: 'bg-blue' },
        tirPasse: { title: 'Tir & Passe', icon: 'fa-solid fa-bolt', color: 'bg-green' },
        technique: { title: 'Technique', icon: 'fa-solid fa-star', color: 'bg-purple' },
        intelligence: { title: 'Intelligence de Jeu', icon: 'fa-solid fa-brain', color: 'bg-orange' }
    };
    const levelTests = {
        'Débutant': {
            title: 'Test de Passage - Niveau Intermédiaire',
            questions: [
                { question: "Quelle est la position optimale d'un défenseur lors d'un 2 contre 1?", options: ["Se placer entre les deux attaquants", "Forcer le porteur vers l'extérieur tout en gardant un œil sur le passeur", "Attaquer directement le porteur"], correct: 1, explanation: "En forçant le porteur vers l'extérieur, vous réduisez son angle de tir et rendez la passe plus difficile." },
                { question: "Quel type de passe un défenseur doit-il privilégier en sortie de zone?", options: ["Passe haute et longue", "Passe courte et précise le long de la bande", "Passe au centre de la patinoire"], correct: 1, explanation: "La passe le long de la bande est la plus sûre pour éviter les revirements dangereux au centre." },
            ]
        },
        'Intermédiaire': {
            title: 'Test de Passage - Niveau Avancé',
            questions: [
                { question: "Comment gérer un attaquant qui fait du 'cycling' derrière votre filet?", options: ["Le suivre partout", "Rester devant le filet", "Coordonner avec le partenaire pour le serrer"], correct: 2, explanation: "La communication et la coordination avec votre partenaire sont essentielles pour contrer le cycle sans vous désorganiser." },
                { question: "Quelle technique utiliser pour un tir frappé efficace depuis la ligne bleue?", options: ["Transfert de poids arrière vers avant", "Mouvement rapide des bras seulement", "Position statique"], correct: 0, explanation: "Un bon tir frappé tire sa puissance d'un transfert de poids complet du corps." }
            ]
        },
        'Avancé': {
            title: 'Test de Passage - Niveau Elite',
            questions: [
                 { question: "Dans un 'pinch' réussi, quelle est la clé?", options: ["La vitesse", "La surprise", "La certitude de récupérer la rondelle"], correct: 2, explanation: "Ne pincez que si vous êtes sûr à 90% ou plus de réussir. Un pinch raté mène souvent à un surnombre contre votre équipe." },
            ]
        }
    };
    const exercises = {
        positionnement: [
            { title: 'Situation 2 contre 1', scenario: "L'adversaire arrive à 2 contre vous. Votre priorité est de couper la ligne de passe tout en contrôlant le porteur. [20]", level: 'Débutant' },
            { title: 'Couverture de la "Maison"', scenario: "En zone défensive, votre corps doit toujours être entre l'attaquant et le filet. Protégez l'enclave avant tout. [7]", level: 'Débutant' },
            { title: "Pincer' à la Ligne Bleue", scenario: "Apprenez à lire le jeu pour savoir quand vous pouvez agressivement garder la rondelle en zone offensive sans vous faire prendre à contre-pied. [1]", level: 'Intermédiaire' }
        ],
        tirPasse: [
            { title: 'Tir des poignets rapide', scenario: "Depuis la ligne bleue, exercez-vous à prendre un tir des poignets rapidement après une passe. La vitesse de lancer surprend les gardiens. [16]", level: 'Débutant' },
            { title: 'Passe de sortie de zone', scenario: "Sous pression, utilisez la bande pour faire une passe indirecte sécuritaire à votre ailier.", level: 'Débutant' },
            { title: 'Tirs bas pour déviations', scenario: "Visez les jambières du gardien. Un tir bas et dur est plus facile à dévier pour vos attaquants et peut créer des retours.", level: 'Intermédiaire' }
        ]
    };

    // ======== STATE ========
    let state = {
        currentLevel: 'Débutant',
        playerStats: { points: 0, testsCompleted: 0, streak: 0 },
        currentTest: null,
        testAnswers: {},
    };

    // ======== DOM ELEMENTS ========
    const views = document.querySelectorAll('.view');
    const dashboardView = document.getElementById('dashboard-view');
    const moduleView = document.getElementById('module-view');
    const testView = document.getElementById('test-view');
    const resultsView = document.getElementById('results-view');
    const navDashboardBtn = document.getElementById('nav-dashboard');

    // ======== RENDER FUNCTIONS ========

    function renderDashboard() {
        document.getElementById('current-level-display').textContent = state.currentLevel;
        document.getElementById('stats-points').textContent = state.playerStats.points;
        document.getElementById('stats-tests').textContent = state.playerStats.testsCompleted;
        document.getElementById('stats-streak').textContent = state.playerStats.streak;

        const modulesContainer = document.getElementById('modules-container');
        modulesContainer.innerHTML = '';
        for (const key in modules) {
            const module = modules[key];
            const btn = document.createElement('button');
            btn.className = `module-btn ${module.color}`;
            btn.innerHTML = `<i class="${module.icon} icon"></i><p>${module.title}</p>`;
            btn.onclick = () => renderModule(key);
            modulesContainer.appendChild(btn);
        }

        const testContainer = document.getElementById('level-test-container');
        if (state.currentLevel !== 'Elite') {
            const nextLevel = levels[levels.indexOf(state.currentLevel) + 1];
            testContainer.innerHTML = `
                <p>Prêt à passer au niveau <strong>${nextLevel}</strong> ?</p>
                <button id="start-test-btn" class="btn btn-red">
                    <i class="fa-solid fa-play icon-left"></i>Commencer le Test
                </button>`;
            document.getElementById('start-test-btn').onclick = () => startTest(state.currentLevel);
        } else {
            testContainer.innerHTML = `<p class="font-bold">🏆 Niveau Maximum Atteint!</p>`;
        }
        showView('dashboard-view');
    }

    function renderModule(moduleKey) {
        const module = modules[moduleKey];
        const moduleExercises = exercises[moduleKey]?.filter(ex => levels.indexOf(ex.level) <= levels.indexOf(state.currentLevel)) || [];
        
        moduleView.innerHTML = `
            <div class="module-header ${module.color}">
                <div style="display: flex; align-items: center;">
                    <i class="${module.icon} icon"></i>
                    <div>
                        <h2>${module.title}</h2>
                        <p>Exercices pour le niveau ${state.currentLevel}</p>
                    </div>
                </div>
            </div>
            <div class="card">
                ${moduleExercises.map(ex => `
                    <div class="exercise-card ${module.color}">
                        <h4>${ex.title}</h4>
                        <p>${ex.scenario}</p>
                    </div>
                `).join('') || '<p>Aucun exercice pour ce module au niveau actuel.</p>'}
            </div>`;
        showView('module-view');
    }

    function startTest(level) {
        state.currentTest = levelTests[level];
        state.testAnswers = {};
        
        testView.innerHTML = `
            <div class="card">
                <h2>${state.currentTest.title}</h2>
                <p>Répondez à toutes les questions. Un score de 80% est requis pour passer.</p>
            </div>
            ${state.currentTest.questions.map((q, index) => `
                <div class="card test-question">
                    <p class="font-bold">${index + 1}. ${q.question}</p>
                    <div class="options-container" data-q-index="${index}">
                        ${q.options.map((opt, oIndex) => `
                            <button class="option-btn" data-o-index="${oIndex}">${opt}</button>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
            <button id="submit-test-btn" class="btn btn-green" disabled>Soumettre le Test</button>
        `;

        testView.querySelectorAll('.options-container').forEach(container => {
            container.addEventListener('click', (e) => {
                if (e.target.classList.contains('option-btn')) {
                    const qIndex = container.dataset.qIndex;
                    const oIndex = e.target.dataset.oIndex;
                    state.testAnswers[qIndex] = parseInt(oIndex);

                    container.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('selected'));
                    e.target.classList.add('selected');

                    document.getElementById('submit-test-btn').disabled = Object.keys(state.testAnswers).length !== state.currentTest.questions.length;
                }
            });
        });
        
        document.getElementById('submit-test-btn').onclick = submitTest;
        showView('test-view');
    }

    function submitTest() {
        let correct = 0;
        state.currentTest.questions.forEach((q, index) => {
            if(state.testAnswers[index] === q.correct) correct++;
        });
        const score = (correct / state.currentTest.questions.length) * 100;
        const passed = score >= 80;

        if (passed) {
            const currentIndex = levels.indexOf(state.currentLevel);
            if (currentIndex < levels.length - 1) {
                state.currentLevel = levels[currentIndex + 1];
            }
            state.playerStats.points += 100;
            state.playerStats.testsCompleted += 1;
            state.playerStats.streak += 1;
        } else {
            state.playerStats.streak = 0;
        }

        renderTestResults({ score, passed, correct, total: state.currentTest.questions.length });
    }
    
    function renderTestResults(results) {
        resultsView.innerHTML = `
            <div class="card results-card">
                ${results.passed ? `
                    <i class="far fa-check-circle icon"></i>
                    <h2 style="color: var(--green-600);">Félicitations !</h2>
                    <p>Vous avez passé au niveau <strong>${state.currentLevel}</strong> !</p>
                ` : `
                    <i class="far fa-times-circle icon"></i>
                    <h2 style="color: var(--red-600);">Test Échoué</h2>
                    <p>Continuez à vous entraîner et réessayez !</p>
                `}
                <div class="results-feedback">
                    <p class="score">${results.score.toFixed(0)}%</p>
                    <p>${results.correct} / ${results.total} réponses correctes</p>
                </div>
                <button id="back-to-dashboard-btn" class="btn btn-blue">Retour au Tableau de Bord</button>
            </div>
        `;
        document.getElementById('back-to-dashboard-btn').onclick = renderDashboard;
        showView('results-view');
    }

    // ======== UTILITY FUNCTIONS ========
    function showView(viewId) {
        views.forEach(v => v.classList.remove('active'));
        document.getElementById(viewId).classList.add('active');
        window.scrollTo(0, 0);
    }

    // ======== INITIALIZATION ========
    navDashboardBtn.onclick = renderDashboard;
    renderDashboard();
});
