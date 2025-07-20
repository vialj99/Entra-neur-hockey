document.addEventListener('DOMContentLoaded', function() {
    loadProgress();
});

const quizzes = {
    1: {
        title: "Quiz du Niveau 1",
        questions: [
            {
                question: "Quelle est la priorité absolue d'un défenseur dans sa propre zone ?",
                options: ["Faire une longue passe pour l'attaque", "Protéger la 'maison' (l'enclave)", "Mettre en échec le porteur de la rondelle n'importe où"],
                answer: "Protéger la 'maison' (l'enclave)"
            },
            {
                question: "Quelle est la distance idéale à maintenir avec un attaquant (Gap Control) ?",
                options: ["Le plus près possible", "À deux longueurs de bâton", "Environ une longueur de bâton"],
                answer: "Environ une longueur de bâton"
            }
        ]
    },
    2: {
        title: "Quiz du Niveau 2",
        questions: [
            {
                question: "Quand un défenseur devrait-il 'pincer' (pinch) à la ligne bleue offensive ?",
                options: ["À chaque fois que la rondelle est près des bandes", "Seulement s'il est certain de récupérer la rondelle", "Jamais, c'est trop risqué"],
                answer: "Seulement s'il est certain de récupérer la rondelle"
            }
        ]
    }
};

let currentQuizNum = 0;
let selectedOption = null;

function updateProgress() {
    const levels = [1, 2, 3];
    levels.forEach(levelNum => {
        const exercises = document.querySelectorAll(`#level-${levelNum} .exercise input`);
        if (exercises.length > 0) {
            const allDone = Array.from(exercises).every(cb => cb.checked);
            const quizBtn = document.getElementById(`quiz${levelNum}-btn`);
            if (quizBtn) {
                quizBtn.disabled = !allDone;
            }
        }
    });
    saveProgress();
}

function startQuiz(levelNum) {
    currentQuizNum = levelNum;
    const quiz = quizzes[levelNum];
    document.getElementById('quiz-title').innerText = quiz.title;
    
    const modal = document.getElementById('quiz-modal');
    displayQuestion(0);
    modal.style.display = "block";
}

function displayQuestion(questionIndex) {
    const quiz = quizzes[currentQuizNum];
    const question = quiz.questions[questionIndex];
    
    document.getElementById('quiz-question').innerText = question.question;
    const optionsContainer = document.getElementById('quiz-options');
    optionsContainer.innerHTML = '';
    selectedOption = null;

    question.options.forEach(option => {
        const button = document.createElement('button');
        button.innerText = option;
        button.onclick = () => {
            if(selectedOption) {
                selectedOption.classList.remove('selected');
            }
            selectedOption = button;
            selectedOption.classList.add('selected');
        };
        optionsContainer.appendChild(button);
    });
    
    document.getElementById('quiz-feedback').innerText = '';
    document.getElementById('quiz-submit-btn').style.display = 'block';

}


function submitQuiz() {
    if (!selectedOption) {
        alert("Choisis une réponse !");
        return;
    }

    const quiz = quizzes[currentQuizNum];
    // Pour ce cas simple, on ne gère qu'une question à la fois.
    const currentQuestion = quiz.questions[0]; 
    const feedback = document.getElementById('quiz-feedback');

    if (selectedOption.innerText === currentQuestion.answer) {
        feedback.innerText = "Bonne réponse ! Niveau débloqué !";
        feedback.style.color = 'green';
        unlockNextLevel(currentQuizNum);
        setTimeout(closeQuiz, 2000);
    } else {
        feedback.innerText = "Mauvaise réponse. Revois tes classiques et réessaie !";
        feedback.style.color = 'red';
    }
     document.getElementById('quiz-submit-btn').style.display = 'none';
}


function closeQuiz() {
    document.getElementById('quiz-modal').style.display = "none";
}

function unlockNextLevel(levelNum) {
    const nextLevelNum = levelNum + 1;
    const nextLevel = document.getElementById(`level-${nextLevelNum}`);
    if (nextLevel) {
        nextLevel.classList.remove('locked');
        nextLevel.innerHTML += getLevelContent(nextLevelNum); // Ajoute le contenu du niveau
        updateProgress();
    }
    localStorage.setItem(`level-${nextLevelNum}-unlocked`, 'true');
}

function getLevelContent(levelNum) {
    if (levelNum === 2) {
        return `
            <div class="skill-category">
                <h3><i class="fas fa-map-marker-alt"></i> Positionnement</h3>
                <div class="exercise" data-skill="positioning-2">
                    <input type="checkbox" id="pos2-1" onchange="updateProgress()">
                    <label for="pos2-1"><strong>Jeu à la ligne bleue offensive :</strong> Apprends quand 'pincer' pour garder la rondelle en zone offensive et quand reculer pour éviter un 2 contre 1. [1] C'est une question de lecture de jeu.</label>
                </div>
            </div>
             <div class="skill-category">
                <h3><i class="fas fa-bullseye"></i> Tirs</h3>
                <div class="exercise" data-skill="shooting-2">
                    <input type="checkbox" id="shoot2-1" onchange="updateProgress()">
                    <label for="shoot2-1"><strong>Tirs bas pour déviations :</strong> Au lieu de toujours viser la lucarne, entraîne-toi à tirer bas et fort en direction du but pour que tes attaquants puissent dévier la rondelle.</label>
                </div>
            </div>
            <button class="quiz-btn" id="quiz2-btn" onclick="startQuiz(2)" disabled>Quiz du Niveau 2</button>
        `;
    }
     if (levelNum === 3) {
        return `
            <div class="skill-category">
                <h3><i class="fas fa-map-marker-alt"></i> Intelligence de Jeu</h3>
                <div class="exercise" data-skill="gameiq-3">
                    <input type="checkbox" id="gi3-1" onchange="updateProgress()">
                    <label for="gi3-1"><strong>Lecture de la montée (Rush Reading) :</strong> Analyse rapidement la situation (2 contre 1, 3 contre 2) et communique avec ton partenaire pour savoir qui prend le porteur de la rondelle et qui couvre la passe. [20]</label>
                </div>
            </div>
        `;
    }
    return '';
}

// Sauvegarde et chargement de la progression
function saveProgress() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => {
        localStorage.setItem(cb.id, cb.checked);
    });
}

function loadProgress() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => {
        const isChecked = localStorage.getItem(cb.id) === 'true';
        cb.checked = isChecked;
    });

    if (localStorage.getItem('level-2-unlocked') === 'true') {
        const level2 = document.getElementById('level-2');
        level2.classList.remove('locked');
        level2.innerHTML = `<h2>Niveau 2 : Maîtrise Tactique</h2>` + getLevelContent(2);
    }
    if (localStorage.getItem('level-3-unlocked') === 'true') {
         const level3 = document.getElementById('level-3');
        level3.classList.remove('locked');
        level3.innerHTML = `<h2>Niveau 3 : Le Défenseur d'Élite</h2>` + getLevelContent(3);
    }
    
    // Re-check checkboxes after loading dynamic content
     const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
    allCheckboxes.forEach(cb => {
        const isChecked = localStorage.getItem(cb.id) === 'true';
        cb.checked = isChecked;
    });

    updateProgress();
}
