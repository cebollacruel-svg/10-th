const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby2qTBUwWN5_zsBrGhslaw4asYc0EiY-TohO-DfRrU7aBFg42Zu0xmOkpT0yfmV5O6l/exec";

/* =========================================================
   AUDIO CONTROLLER
========================================================= */
class AudioController {
    constructor(audioId, buttonId, counterId, maxPlays = 4) {
        this.audio = document.getElementById(audioId);
        this.button = document.getElementById(buttonId);
        this.counter = document.getElementById(counterId);
        this.maxPlays = maxPlays;
        this.plays = 0;

        if (this.button) {
            this.button.addEventListener("click", () => this.play());
        }
    }

    play() {
        if (this.plays >= this.maxPlays) return;

        this.audio.currentTime = 0;
        this.audio.play();

        this.plays++;
        this.updateUI();
    }

    updateUI() {
        const remaining = this.maxPlays - this.plays;

        if (this.counter) {
            this.counter.textContent = "Remaining plays: " + remaining;
        }

        if (this.plays >= this.maxPlays) {
            this.button.disabled = true;
            this.button.textContent = "No More Plays";
        }
    }
}

/* =========================================================
   INIT
========================================================= */
document.addEventListener("DOMContentLoaded", () => {

    for (let i = 1; i <= 6; i++) {
        new AudioController(`audio${i}`, `playBtn${i}`, `counter${i}`);
    }

    const form = document.getElementById("quizForm");
    if (form) {
        form.addEventListener("submit", checkAnswers);
    }
});

/* =========================================================
   ANSWERS
========================================================= */
const answers = {
    q1:"c", q2:"b", q3:"d",
    q4:"a", q5:"c", q6:"d",
    q7:"b", q8:"a", q9:"c",
    q10:"c", q11:"a", q12:"d",
    q13:"b", q14:"c", q15:"a",
    q16:"b", q17:"d", q18:"a"
};

/* =========================================================
   CHECK ANSWERS
========================================================= */
function checkAnswers(event) {
    event.preventDefault();

    const studentName = document.getElementById("studentName").value.trim();

    if (!studentName) {
        alert("Please write your full name before submitting.");
        return;
    }

    let score = 0;
    const total = 18;

    for (const key in answers) {
        const selected = document.querySelector(`input[name="${key}"]:checked`);
        const selectedValue = selected ? selected.value : "";

        if (selectedValue === answers[key]) {
            score++;
        }
    }

    const score100 = ((score / total) * 100).toFixed(0);
    const examPercent = ((score / total) * 10).toFixed(1);

    guardarEnGoogleSheets({
        exam: "10th",
        nombre: studentName,
        puntaje: `${score}/${total} points — ${score100} score — ${examPercent}/10 %`
    });

    bloquearExamen();
}

/* =========================================================
   LOCK
========================================================= */
function bloquearExamen() {

    document.querySelectorAll('input[type="radio"]').forEach(el => {
        el.disabled = true;
    });

    document.querySelectorAll('.play-btn').forEach(btn => {
        btn.disabled = true;
    });

    const submitBtn = document.querySelector(".submit-btn");

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Exam Submitted";
        submitBtn.style.opacity = "0.6";
    }

    const nameInput = document.getElementById("studentName");

    if (nameInput) {
        nameInput.disabled = true;
    }
}

/* =========================================================
   SAVE GOOGLE SHEETS
========================================================= */
function guardarEnGoogleSheets(datos) {

    const statusEl = document.getElementById("saveStatus");

    statusEl.className = "save-status saving";
    statusEl.textContent = "Submitting exam...";

    fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: {
            "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(datos)
    })
    .then(response => response.json())
    .then(result => {

        if (result.success) {

            statusEl.className = "save-status saved";
            statusEl.innerHTML = `✓ Exam submitted successfully.<br>Thank you, <strong>${datos.nombre}</strong>.`;

        } else {
            throw new Error(result.error || "Unknown error");
        }

    })
    .catch(error => {

        console.error(error);

        statusEl.className = "save-status error";
        statusEl.textContent = "Could not submit. Please try again.";
    });
}
