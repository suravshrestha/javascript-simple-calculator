const expInputEl = document.querySelector(".exp-input");
const output = document.querySelector(".output");

const numBtns = document.querySelectorAll(".num");
const operatorBtns = document.querySelectorAll(".operator");

const clearBtn = document.getElementById("clear");
const backspaceBtn = document.getElementById("backspace");

const equalsBtn = document.getElementById("equals");

let equalsClicked = 0;
let operatorClicked = 0;

function evaluateExpression() {
  const expression = expInputEl.textContent
    .replace(/\u00D7/g, "*") // Unicode for × (&times;)
    .replace(/\u00F7/g, "/") // Unicode for ÷ (&divide;)
    .replace(/\u2212/g, "-") // Unicode for − (&minus;)
    .replace(/%/g, "/100");

  try {
    output.textContent = eval(expression);
  } catch (error) {
    output.textContent = "";
  }
}

// Detect number and operator insertion (button click)
expInputEl.addEventListener("DOMNodeInserted", evaluateExpression);

clearBtn.addEventListener("click", () => {
  expInputEl.textContent = "";
  output.textContent = "";

  equalsClicked = 0;
  operatorClicked = 0;
});

backspaceBtn.addEventListener("click", () => {
  const span = expInputEl.lastElementChild;

  if (span) {
    expInputEl.removeChild(span);
  }

  evaluateExpression();
});

numBtns.forEach((numBtn) => {
  numBtn.addEventListener("click", (e) => {
    if (equalsClicked && !operatorClicked) {
      // Clear the output if the user enters a number when result displayed in main display
      expInputEl.textContent = "";
    }

    equalsClicked = 0;
    operatorClicked = 0;

    const span = document.createElement("span");
    span.textContent = e.target.textContent;
    span.style.color = "#fafafa";

    expInputEl.appendChild(span);
  });
});

operatorBtns.forEach((operatorBtn) => {
  operatorBtn.addEventListener("click", (e) => {
    if (!expInputEl.lastChild) {
      // Empty input
      return;
    }

    const prevOperator = expInputEl.lastChild.textContent;
    if (operatorClicked && prevOperator !== "%") {
      // Repeating operators (except for %)
      return;
    }

    if (equalsClicked) {
      // Change the color of the result in main display if the user enters an operator
      expInputEl.firstChild.style.color = "#fafafa";
    }

    operatorClicked = e.target.id === "percent" ? 0 : 1; // Allow operation if previous operator = %
    equalsClicked = 0;

    const span = document.createElement("span");

    switch (e.target.id) {
      case "divide":
        span.textContent = " / ";
        break;
      case "percent":
        span.textContent = "%";
        break;
      default:
        span.textContent = ` ${e.target.textContent} `;
        break;
    }

    span.style.color = "#94fc13";

    expInputEl.appendChild(span);
  });
});

equalsBtn.addEventListener("click", () => {
  if (equalsClicked) {
    // Multiple equals clicks
    return;
  }

  equalsClicked = 1;

  const span = document.createElement("span");
  span.style.color = "#94fc13";
  span.textContent = output.textContent;

  expInputEl.textContent = "";

  expInputEl.appendChild(span);

  output.textContent = "";
});
