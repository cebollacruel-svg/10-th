const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby2qTBUwWN5_zsBrGhslaw4asYc0EiY-TohO-DfRrU7aBFg42Zu0xmOkpT0yfmV5O6l/exec";

/* =========================================================
   1. AUDIO CONTROLLER
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
   2. INIT AUDIOS
========================================================= */
document.addEventListener("DOMContentLoaded", () => {

    new AudioController("audio1", "playBtn1", "counter1");
    new AudioController("audio2", "playBtn2", "counter2");
    new AudioController("audio3", "playBtn3", "counter3");
    new AudioController("audio4", "playBtn4", "counter4");
    new AudioController("audio5", "playBtn5", "counter5");
    new AudioController("audio6", "playBtn6", "counter6");
    new AudioController("audio7", "playBtn7", "counter7");
    new AudioController("audio8", "playBtn8", "counter8");
    new AudioController("audio9", "playBtn9", "counter9");

    const form = document.getElementById("quizForm");
    if (form) {
        form.addEventListener("submit", checkAnswers);
    }
});


/* =========================================================
   3. ANSWER KEY
========================================================= */
const answers = {
    q1: "b",
    q2: "b",
    q3: "a",
    q4: "a",
    q5: "b",
    q6: "c",
    q7: "b",
    q8: "c",
    q9: "c",
    q10: "b",
    q11: "c",
    q12: "a",
    q13: "c",
    q14: "c",
    q15: "b",
    q16: "d",
    q17: "c",
    q18: "a",
    q19: "e",
    q20: "b"
};


/* =========================================================
   4. CHECK ANSWERS
========================================================= */
function checkAnswers(event) {
    event.preventDefault();

    const studentName = document.getElementById("studentName").value.trim();

    if (!studentName) {
        alert("Please write your full name before submitting.");
        document.getElementById("studentName").focus();
        return;
    }

    let score = 0;
    const total = 20;

    for (const key in answers) {
        const radio = document.querySelector(`input[name="${key}"]:checked`);
        const select = document.querySelector(`select[name="${key}"]`);

        const selectedValue = radio ? radio.value : (select ? select.value : "");

        if (selectedValue === answers[key]) {
            score++;
        }
    }

    // score en escala 100
    const score100 = ((score / total) * 100).toFixed(0);

    // porcentaje real del examen (10%)
    const examPercent = ((score / total) * 10).toFixed(1);

    guardarEnGoogleSheets({
        nombre: studentName,
        puntaje: `${score}/${total} points — ${score100} score — ${examPercent}/10 %`,
        grado: "11"
    });

    bloquearExamen();
}


/* =========================================================
   5. LOCK EXAM
========================================================= */
function bloquearExamen() {

    document.querySelectorAll('input[type="radio"], select.match-select').forEach(el => {
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
        submitBtn.style.cursor = "not-allowed";
    }

    const nameInput = document.getElementById("studentName");

    if (nameInput) {
        nameInput.disabled = true;
    }
}


/* =========================================================
   6. SAVE TO GOOGLE SHEETS
========================================================= */
function guardarEnGoogleSheets(datos) {

    const statusEl = document.getElementById("saveStatus");

    if (!APPS_SCRIPT_URL) {
        statusEl.className = "save-status error";
        statusEl.textContent = "Configuration error.";
        return;
    }

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

            statusEl.innerHTML = `
                ✓ Exam submitted successfully.<br>
                Thank you, <strong>${datos.nombre}</strong>.
            `;

            statusEl.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

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
