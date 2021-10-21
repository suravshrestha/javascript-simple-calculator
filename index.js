const expInputEl = document.querySelector(".exp-input");
const output = document.querySelector(".output");

const numBtns = document.querySelectorAll(".num");
const operatorBtns = document.querySelectorAll(".operator");

const clearBtn = document.getElementById("clear");

const backspaceBtn = document.getElementById("backspace");

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
    const span = document.createElement("span");
    span.textContent = e.target.textContent;
    span.style.color = "#fafafa";

    expInputEl.appendChild(span);
  });
});

operatorBtns.forEach((operatorBtn) => {
  operatorBtn.addEventListener("click", (e) => {
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
