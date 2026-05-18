const APPS_SCRIPT_URL = "TU MISMO URL";

class AudioController {
    constructor(audioId, buttonId, counterId, maxPlays = 4) {
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
        this.counter.textContent = "Remaining plays: " + (this.maxPlays - this.plays);

        if (this.plays >= this.maxPlays) {
            this.button.disabled = true;
            this.button.textContent = "No More Plays";
        }
    }
}

const answers = {
q1:"c", q2:"b", q3:"d",
q4:"b", q5:"a", q6:"c",
q7:"a", q8:"b", q9:"d",
q10:"c", q11:"a", q12:"b",
q13:"b", q14:"c", q15:"a",
q16:"b", q17:"d", q18:"a"
};

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

["Where does the speaker work?",["At a school","At a restaurant","At a hospital","At a bank"]],
["What does he repair?",["Phones","Computers","Cars","TVs"]],
["What time does he usually arrive home?",["5:00","5:30","6:00","6:30"]],

["What job does Charlie's mother have?",["Doctor","Journalist","Teacher","Nurse"]],
["Where does she work?",["The Times","School","Hospital","Radio"]],
["What does Amelia want to be?",["Doctor","Teacher","Footballer","Pilot"]],

["What time does Tom wake up?",["7:00","8:00","6:00","9:00"]],
["How many classes does he teach?",["4","5","6","3"]],
["What pet does Tom have?",["Cat","Bird","Fish","Dog"]],

["What are they planning?",["Study","Travel","Go shopping","Go to cinema"]],
["Which movie do they choose?",["Comedy","Horror","Science fiction","Romantic"]],
["What time will they meet?",["7:30","8:00","9:00","6:30"]],

["Why does Tina call?",["She is bored","She is scared","She is happy","She is working"]],
["What movie did she watch?",["Avatar","The Sixth Sense","Titanic","Frozen"]],
["What will they watch together?",["Action","Drama","Comedy","Horror"]],

["What kind of movie is Shadow of Tomorrow?",["Documentary","Action and mystery","Romance","Animation"]],
["Who is Alex Carter?",["Teacher","Doctor","Scientist","Police officer"]],
["What is the promotion inviting people to do?",["Read a book","Go to the premiere","Travel","Play games"]]

];

let q=1;
let audio=1;

for(let i=0;i<questions.length;i+=3){

container.innerHTML += `
<section class="audio-card">
<p class="directions">Listen and answer questions ${q}-${q+2}</p>
<audio id="audio${audio}">
<source src="audio${audio}.mp3" type="audio/mpeg">
</audio>
<div class="audio-controls">
<button type="button" class="play-btn" id="playBtn${audio}">Play Audio</button>
<span class="counter" id="counter${audio}">Remaining plays: 4</span>
</div>
</section>
`;

for(let j=0;j<3;j++){

let current = questions[i+j];

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

function checkAnswers(e){

e.preventDefault();

const studentName = document.getElementById("studentName").value.trim();

if(!studentName){
alert("Write your name.");
return;
}

let score = 0;
const total = 18;

for(const key in answers){
const selected = document.querySelector(`input[name="${key}"]:checked`);
if(selected && selected.value === answers[key]){
score++;
}
}

const score100 = Math.round((score/total)*100);
const examPercent = ((score/total)*10).toFixed(1);

guardarEnGoogleSheets({
nombre: studentName,
puntaje: `${score}/${total} points — ${score100} score — ${examPercent}/10 %`
});

bloquearExamen();
}

function bloquearExamen(){

document.querySelectorAll("input").forEach(el=>el.disabled=true);
document.querySelectorAll(".play-btn").forEach(el=>el.disabled=true);

const btn=document.querySelector(".submit-btn");
btn.disabled=true;
btn.textContent="Exam Submitted";
}

function guardarEnGoogleSheets(datos){

const statusEl = document.getElementById("saveStatus");

statusEl.className = "save-status saving";
statusEl.textContent = "Submitting exam...";

fetch(APPS_SCRIPT_URL,{
method:"POST",
headers:{ "Content-Type":"text/plain;charset=utf-8" },
body:JSON.stringify(datos)
})
.then(r=>r.json())
.then(result=>{

if(result.success){
statusEl.className = "save-status saved";
statusEl.innerHTML = `✓ Exam submitted successfully.<br><strong>${datos.nombre}</strong>`;
}else{
throw new Error();
}

})
.catch(()=>{
statusEl.className = "save-status error";
statusEl.textContent = "Could not submit.";
});
}
