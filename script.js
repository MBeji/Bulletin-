document.addEventListener('DOMContentLoaded', () => {
    const matieres = [
        { nom: "Arabe", coefficient: 4, grades: {} },
        { nom: "Français", coefficient: 4, grades: {} },
        { nom: "Anglais", coefficient: 2, grades: {} },
        { nom: "Histoire", coefficient: 1, grades: {} },
        { nom: "Géographie", coefficient: 1, grades: {} },
        { nom: "Éducation Islamique", coefficient: 1, grades: {} },
        { nom: "Éducation Civique", coefficient: 1, grades: {} },
        { nom: "Mathématiques", coefficient: 3, grades: {} },
        { nom: "Sciences Physiques", coefficient: 1.5, grades: {} },
        { nom: "SVT", coefficient: 1.5, grades: {} }, // Sciences de la Vie et de la Terre
        { nom: "Technologie", coefficient: 1, grades: {} },
        { nom: "Éducation Artistique", coefficient: 1, grades: {} }, // (Plastique ou Musicale)
        { nom: "Informatique", coefficient: 1, grades: {} },
        { nom: "Éducation Physique", coefficient: 1, grades: {} },
        { nom: "Éducation Musicale", coefficient: 1, grades: {} },
        { nom: "Éducation Théâtrale", coefficient: 1, grades: {} }
    ];

    const gradesTableBody = document.getElementById('gradesTable').querySelector('tbody');
    const overallAverageSpan = document.getElementById('overallAverage');
    const mentionSpan = document.getElementById('mention');
    const newSubjectNameInput = document.getElementById('newSubjectName');
    const newSubjectCoefficientInput = document.getElementById('newSubjectCoefficient');
    const addSubjectBtn = document.getElementById('addSubjectBtn');


    // Grade types for input fields
    const gradeTypes = ['devoir1', 'devoir2', 'synthese']; // Can be expanded

    function populateTable() {
        if (!gradesTableBody) return;
        gradesTableBody.innerHTML = ''; // Clear existing rows

        matieres.forEach(matiere => {
            const row = gradesTableBody.insertRow();
            row.insertCell().textContent = matiere.nom;
            row.insertCell().textContent = matiere.coefficient;

            const gradesCell = row.insertCell();
            gradeTypes.forEach(type => {
                const input = document.createElement('input');
                input.type = 'number';
                input.min = 0;
                input.max = 20;
                input.placeholder = type.charAt(0).toUpperCase() + type.slice(1); // e.g., Devoir1
                input.dataset.subject = matiere.nom;
                input.dataset.gradeType = type;
                // Set the initial value if it exists in matiere.grades
                if (matiere.grades && matiere.grades[type] !== undefined) {
                    input.value = matiere.grades[type];
                }
                input.addEventListener('input', handleGradeChange);
                gradesCell.appendChild(input);
            });

            const subjectAverageCell = row.insertCell();
            subjectAverageCell.id = `avg-${matiere.nom.replace(/\s+/g, '-')}`; // e.g., avg-Arabe
            subjectAverageCell.textContent = 'N/A';

            // Add Remove Button
            const removeCell = row.insertCell();
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Supprimer';
            removeButton.classList.add('remove-subject-btn');
            removeButton.dataset.subjectName = matiere.nom;
            removeButton.addEventListener('click', () => removeSubject(matiere.nom));
            removeCell.appendChild(removeButton);
        });
    }

    function removeSubject(subjectName) {
        const index = matieres.findIndex(m => m.nom === subjectName);
        if (index > -1) {
            matieres.splice(index, 1);
            populateTable(); // Re-populate table to reflect removal
            calculateOverallAverage(); // Recalculate overall average
        }
    }

    function addSubject() {
        const name = newSubjectNameInput.value.trim();
        const coefficient = parseFloat(newSubjectCoefficientInput.value);

        if (!name) {
            alert("Le nom de la matière ne peut pas être vide.");
            return;
        }
        if (isNaN(coefficient) || coefficient <= 0) {
            alert("Le coefficient doit être un nombre positif.");
            return;
        }
        if (matieres.some(m => m.nom.toLowerCase() === name.toLowerCase())) {
            alert("Une matière avec ce nom existe déjà.");
            return;
        }

        matieres.push({ nom: name, coefficient: coefficient, grades: {} });

        // Clear input fields
        newSubjectNameInput.value = '';
        newSubjectCoefficientInput.value = '';

        populateTable(); // Re-populate table with the new subject
        calculateOverallAverage(); // Recalculate overall average
    }


    function calculateSubjectAverage(matiere) {
        if (!matiere) return NaN; // Guard clause if matiere is undefined

        const weights = {
            'devoir1': 1,
            'devoir2': 1,
            'synthese': 2
        };
        // gradeTypes is ['devoir1', 'devoir2', 'synthese']
        // These keys match what's used in handleGradeChange and populateTable for dataset.gradeType

        let weightedSum = 0;
        let totalWeight = 0;

        gradeTypes.forEach(type => { // Iterate using the defined gradeTypes
            const gradeValue = matiere.grades[type]; // Access grades using keys like 'devoir1'
            const weight = weights[type];

            if (gradeValue !== undefined && gradeValue !== null && !isNaN(parseFloat(gradeValue)) && weight !== undefined) {
                weightedSum += parseFloat(gradeValue) * weight;
                totalWeight += weight;
            }
        });

        if (totalWeight === 0) {
            return NaN; // No valid grades with weights were entered
        }
        const average = weightedSum / totalWeight;
        return average;
    }

    function updateSubjectAverageDisplay(matiereNom) {
        const matiere = matieres.find(m => m.nom === matiereNom);
        if (!matiere) return;

        const average = calculateSubjectAverage(matiere);
        const avgCellId = `avg-${matiereNom.replace(/\s+/g, '-')}`;
        const avgCell = document.getElementById(avgCellId);
        if (avgCell) {
            avgCell.textContent = isNaN(average) ? 'N/A' : average.toFixed(2);
        }
    }

    function calculateOverallAverage() {
        let totalPoints = 0;
        let totalCoefficients = 0;

        matieres.forEach(matiere => {
            const subjectAverage = calculateSubjectAverage(matiere);
            if (!isNaN(subjectAverage)) {
                totalPoints += subjectAverage * matiere.coefficient;
                totalCoefficients += matiere.coefficient;
            }
        });

        if (totalCoefficients === 0) {
            overallAverageSpan.textContent = 'N/A';
            mentionSpan.textContent = 'N/A';
            return NaN;
        }

        const overallAvg = totalPoints / totalCoefficients;
        overallAverageSpan.textContent = overallAvg.toFixed(2);

        // Determine Mention
        let mention = 'Faible';
        if (overallAvg >= 18) mention = 'Excellent';
        else if (overallAvg >= 16) mention = 'Très Bien';
        else if (overallAvg >= 14) mention = 'Bien';
        else if (overallAvg >= 12) mention = 'Assez Bien';
        else if (overallAvg >= 10) mention = 'Passable';

        mentionSpan.textContent = mention;
        return overallAvg;
    }

    function handleGradeChange(event) {
        const input = event.target;
        const subjectName = input.dataset.subject;
        const gradeType = input.dataset.gradeType;
        let value = parseFloat(input.value);

        // Validate and clamp the value
        if (isNaN(value) || value < 0) {
            value = undefined; // Treat as not entered if invalid or less than 0
            input.value = ''; // Clear invalid input
        } else if (value > 20) {
            value = 20; // Clamp to max value
            input.value = '20';
        }

        const matiere = matieres.find(m => m.nom === subjectName);
        if (matiere) {
            if (value === undefined) {
                delete matiere.grades[gradeType]; // Remove if input is cleared or invalid
            } else {
                matiere.grades[gradeType] = value;
            }
            updateSubjectAverageDisplay(subjectName);
            calculateOverallAverage();
        }
    }

    // Initial population and calculation
    populateTable();
    calculateOverallAverage(); // Calculate initial overall average (will be N/A)

    // Event listener for the Add Subject button
    if (addSubjectBtn) {
        addSubjectBtn.addEventListener('click', addSubject);
    }

    // Expose functions for potential debugging or extension, otherwise not necessary
    // window.bulletinApp = { matieres, populateTable, calculateOverallAverage, addSubject, removeSubject };
    console.log("script.js loaded and initialized");
});
