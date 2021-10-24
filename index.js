const expInputEl = document.querySelector(".exp-input");
const output = document.querySelector(".output");

const numBtns = document.querySelectorAll(".num");
const operatorBtns = document.querySelectorAll(".operator");

const clearBtn = document.getElementById("clear");
const backspaceBtn = document.getElementById("backspace");

const equalsBtn = document.getElementById("equals");
const parenthesisBtn = document.getElementById("parenthesis");
const negateBtn = document.getElementById("negate");

let equalsClicked = 0;
let operatorClicked = 0;
let openingParenthesisClicked = 0;

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
  openingParenthesisClicked = 0;
});

backspaceBtn.addEventListener("click", () => {
  const span = expInputEl.lastElementChild;
  const prevText = span ? span.textContent : null;

  if (/ [+−×/] /.test(prevText) || prevText === " × (") {
    operatorClicked = 0;
  }

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
    openingParenthesisClicked = 0;

    const span = document.createElement("span");
    span.textContent = e.target.textContent;
    span.style.color = "#fafafa";

    expInputEl.appendChild(span);
  });
});

operatorBtns.forEach((operatorBtn) => {
  operatorBtn.addEventListener("click", (e) => {
    const prevEl = expInputEl.lastElementChild;
    const prevText = prevEl ? prevEl.textContent : null;

    if (
      ((!prevEl || /[×/(× (]/.test(prevText)) &&
        e.target.textContent !== "−") ||
      /(?![%])[+−]/.test(prevText)
    ) {
      // Empty input (except first operator is −)
      // Repeating operators (except for %) or operator (except for −) clicked after × or / or opening parenthesis
      return;
    }

    if (equalsClicked) {
      // Change the color of the result in main display if the user enters an operator
      expInputEl.firstChild.style.color = "#fafafa";
    }

    operatorClicked = e.target.id === "percent" ? 0 : 1; // Allow operation if previous operator = %
    equalsClicked = 0;
    openingParenthesisClicked = 0;

    const span = document.createElement("span");

    switch (e.target.id) {
      case "divide":
        span.textContent = " / ";
        break;
      case "percent":
        span.textContent = "%";
        break;
      default:
        // If - after opening parenthesisBtn, space not required around -
        span.textContent = /[(x(]/.test(prevText)
          ? "−"
          : ` ${e.target.textContent} `;
        break;
    }

    // If - after opening parenthesis, white color for -
    span.style.color = /[(x(]/.test(prevText) ? "#fafafa" : "#94fc13";

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

parenthesisBtn.addEventListener("click", () => {
  const prevEl = expInputEl.lastElementChild;
  const prevText = prevEl ? prevEl.textContent : null;

  const openingParenthesisCount = (expInputEl.textContent.match(/[(]/g) || [])
    .length;
  const closingParenthesisCount = (expInputEl.textContent.match(/[)]/g) || [])
    .length;
  const unclosedParenthesisCount =
    openingParenthesisCount - closingParenthesisCount;

  const span = document.createElement("span");
  span.style.color = "#fafafa";

  if (
    prevText === "(" ||
    prevText === " × (" ||
    prevText === "(−" ||
    / [+−×/] /.test(prevText)
  ) {
    span.textContent = "(";
    openingParenthesisClicked = 1;
  } else if (unclosedParenthesisCount >= 1) {
    span.textContent = ")";
  } else if (/[0-9]/.test(prevText) || prevText === ")") {
    span.innerHTML = `<span style="color:#94fc13"> &times;</span><span> (</span>`;
    openingParenthesisClicked = 1;
  } else {
    span.textContent = "(";
    openingParenthesisClicked = 1;
  }

  expInputEl.appendChild(span);
});

negateBtn.addEventListener("click", () => {
  const prevEl = expInputEl.lastElementChild;
  const prevText = prevEl ? prevEl.textContent : null;

  const secondLastEl = prevEl ? prevEl.previousElementSibling : null;
  const secondLastText = secondLastEl ? secondLastEl.textContent : null;

  const thirdLastEl = secondLastEl ? secondLastEl.previousElementSibling : null;
  const thirdLastText = thirdLastEl ? thirdLastEl.textContent : null;

  const span = document.createElement("span");
  span.style.color = "#fafafa";

  if (secondLastText === "(−" || secondLastText === " × (−") {
    // Use of negate button after (negate button + number)
    expInputEl.removeChild(secondLastEl);
  } else if (prevText === "(−") {
    // Use of negate button only
    expInputEl.removeChild(prevEl);
  } else if (secondLastText === "−" && thirdLastText === "(") {
    // Use of negate button after ('(' + '-' + number)
    expInputEl.removeChild(secondLastEl);
    expInputEl.removeChild(thirdLastEl);
  } else if (prevText === "−" && secondLastText === "(") {
    // Use of negate button after ('(' + '-')
    expInputEl.removeChild(prevEl);
    expInputEl.removeChild(secondLastEl);
  } else if (/[0-9]/g.test(prevText)) {
    // Use of negate button after number
    span.textContent = `(−${prevText}`;
    expInputEl.removeChild(prevEl);
  } else if (prevText === "%") {
    span.innerHTML = `<span style="color:#94fc13"> × </span><span>(−</span>`;
    // % changes to % × (-
  } else {
    // Empty previous text or an operator (+, −, ×, ÷)
    span.textContent = "(−";
  }

  expInputEl.appendChild(span);
});
