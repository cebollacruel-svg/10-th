const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby2qTBUwWN5_zsBrGhslaw4asYc0EiY-TohO-DfRrU7aBFg42Zu0xmOkpT0yfmV5O6l/exec";

/* =========================================
   AUDIO CONTROLLER
========================================= */
class AudioController {
    constructor(audioId, buttonId, counterId, maxPlays = 3) {
        this.audio = document.getElementById(audioId);
        this.button = document.getElementById(buttonId);
        this.counter = document.getElementById(counterId);
        this.maxPlays = maxPlays;
        this.plays = 0;

        this.button.addEventListener("click", () => this.play());
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
        this.counter.textContent = "Remaining plays : " + remaining;

        if (this.plays >= this.maxPlays) {
            this.button.disabled = true;
            this.button.textContent = "No More Plays";
        }
    }
}

/* =========================================
   ANSWER KEY
========================================= */
const answers = {
    q1:"c",  q2:"b",  q3:"d",
    q4:"b",  q5:"a",  q6:"c",
    q7:"a",  q8:"b",  q9:"b",
    q10:"a", q11:"c", q12:"a",
    q13:"b", q14:"b", q15:"a",
    q16:"b", q17:"a", q18:"c"
};

/* =========================================
   AUDIO-SPECIFIC INSTRUCTIONS
========================================= */
const audioInstructions = [
    "Instructions: You will hear a person talking about their job. Choose the correct answer for each question.",
    "Instructions: You will hear a conversation between two friends. Choose the correct answer for each question.",
    "Instructions: You will hear a conversation about a daily routine. Choose the correct answer for each question.",
    "Instructions: You will hear a conversation between two friends making plans. Choose the correct answer for each question.",
    "Instructions: You will hear a phone conversation between two friends. Choose the correct answer for each question.",
    "Instructions: You will hear an announcement. Choose the correct answer for each question."
];

/* =========================================
   BUILD EXAM
========================================= */
document.addEventListener("DOMContentLoaded", () => {
    buildExam();

    for(let i=1;i<=6;i++){
        new AudioController(`audio${i}`, `playBtn${i}`, `counter${i}`);
    }

    document.getElementById("quizForm").addEventListener("submit", checkAnswers);
});

function buildExam(){

const container = document.getElementById("questions-container");

const questions = [

["Where does the technician work?",["At a school","At a restaurant","At a hospital","At a bank"]],
["What does she repair?",["Phones","Computers","Cars","TVs"]],
["What time does she get home?",["5:30","6:00","7:00","6:30"]],

["What is Charlie's mother’s job?",["Doctor","Journalist","Teacher","Lawyer"]],
["Where does she work?",["The Times","A hospital","A school","A website"]],
["What does Amelia want to become?",["Doctor","Footballer","Teacher","Pilot"]],

["What time does Tom wake up?",["7:00","8:00","6:00","9:00"]],
["How many classes does Tom teach?",["4","5","6","3"]],
["What kind of dog does Tom have?",["Golden Retriever","Labrador","Poodle","Bulldog"]],

["What are Jack and Ismael planning?",["Study together","Go shopping","Go to the cinema","Play football"]],
["Which movie do they choose?",["Comedy","Horror","Science fiction","Romantic comedy"]],
["What time will they meet?",["7:30","8:30","6:30","9:00"]],

["Why does Tina call?",["She is excited.","She is scared.","She is bored.","She is tired."]],
["What movie did she watch?",["Titanic","The Sixth Sense","Frozen","Avatar"]],
["What type of movie will they watch next?",["Comedy","Horror","Action","Drama"]],

["What kind of movie is Shadow of Tomorrow?",["Comedy","Action and mystery","Documentary","Romance"]],
["Who is Alex Carter?",["Scientist","Teacher","Doctor","Detective"]],
["What are people invited to do?",["Watch TV","Read the book","Go to the premiere","Stay home"]]

];

let q = 1;
let audio = 1;

for(let i=0;i<questions.length;i+=3){

const instruction = audioInstructions[audio - 1];

container.innerHTML += `
<section class="audio-card">
<p class="directions">${instruction}</p>
<audio id="audio${audio}">
<source src="audio${audio}.mp3" type="audio/mpeg">
</audio>
<div class="audio-controls">
<button type="button" class="play-btn" id="playBtn${audio}">Play Audio</button>
<span class="counter" id="counter${audio}">Remaining plays: 3</span>
</div>
</section>
`;

for(let j=0;j<3;j++){

const current = questions[i+j];

container.innerHTML += `
<article class="question">
<h2>${q}. ${current[0]}</h2>

<label class="option"><input type="radio" name="q${q}" value="a"> A) ${current[1][0]}</label>
<label class="option"><input type="radio" name="q${q}" value="b"> B) ${current[1][1]}</label>
<label class="option"><input type="radio" name="q${q}" value="c"> C) ${current[1][2]}</label>
<label class="option"><input type="radio" name="q${q}" value="d"> D) ${current[1][3]}</label>

</article>
`;

q++;
}

audio++;
}
}

/* =========================================
   CHECK ANSWERS
========================================= */
function checkAnswers(event){
    event.preventDefault();

    const studentName = document.getElementById("studentName").value.trim();

    if(!studentName){
        alert("Please write your full name.");
        return;
    }

    let score = 0;
    const total = 18;

    // Construir el detalle pregunta por pregunta
    let detalleArray = [];

    for(let n = 1; n <= total; n++){
        const key = "q" + n;
        const selected = document.querySelector(`input[name="${key}"]:checked`);
        const studentAnswer = selected ? selected.value.toUpperCase() : "—";
        const correctAnswer = answers[key].toUpperCase();
        const isCorrect = selected && selected.value === answers[key];

        if(isCorrect){
            score++;
            detalleArray.push(`Q${n}: ${studentAnswer} ✓`);
        } else {
            detalleArray.push(`Q${n}: ${studentAnswer} ✗ (correct: ${correctAnswer})`);
        }
    }

    const detalle = detalleArray.join("  |  ");

    const score100 = Math.round((score / total) * 100);
    const examPercent = ((score / total) * 10).toFixed(1);

    guardarEnGoogleSheets({
        exam: "10th",
        nombre: studentName,
        puntaje: `${score}/${total} points — ${score100} score — ${examPercent}/10 %`,
        detalle: detalle
    });

    bloquearExamen();
}

/* =========================================
   LOCK EXAM
========================================= */
function bloquearExamen(){
    document.querySelectorAll("input").forEach(el => el.disabled = true);
    document.querySelectorAll(".play-btn").forEach(el => el.disabled = true);

    const btn = document.querySelector(".submit-btn");
    btn.disabled = true;
    btn.textContent = "Exam Submitted";
}

/* =========================================
   SAVE TO GOOGLE SHEETS
========================================= */
function guardarEnGoogleSheets(datos){

    const statusEl = document.getElementById("saveStatus");

    statusEl.className = "save-status saving";
    statusEl.textContent = "Submitting exam...";

    fetch(APPS_SCRIPT_URL,{
        method:"POST",
        headers:{
            "Content-Type":"text/plain;charset=utf-8"
        },
        body:JSON.stringify(datos)
    })
    .then(response => response.json())
    .then(result => {
        if(result.success){
            statusEl.className = "save-status saved";
            statusEl.innerHTML = `✓ Exam submitted successfully.<br><strong>${datos.nombre}</strong>`;
        } else {
            throw new Error();
        }
    })
    .catch(() => {
        statusEl.className = "save-status error";
        statusEl.textContent = "Could not submit.";
    });
}
