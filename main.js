const screenDisplay = document.querySelector('.screen');
const buttons = document.querySelectorAll('button');
const clickSound = new Audio('clicksound.mp3');
clickSound.preload = 'auto';

let calculation = []
let accumulativeCalculation

// function for when you click the buttons
function calculate(button) {
    const value = button.textContent
    if (value === "CLEAR") {
        calculation = []
        accumulativeCalculation="";
        screenDisplay.textContent = ''
    } else if (value === '=') {
        accumulativeCalculation = calculation.join('');
        console.log(accumulativeCalculation)
        screenDisplay.textContent = eval(accumulativeCalculation)
    } else {
    calculation.push(value)
    accumulativeCalculation = calculation.join('')
    screenDisplay.textContent = accumulativeCalculation
    }

}

// sound on buttons
buttons.forEach(button => {
    button.addEventListener("click", () => {
        const value = button.textContext;
        if(value != "CLEAR" && value !== "=") {
        const sound = clickSound.cloneNode();
        sound.play();
        }

        calculate(button);
    });
});