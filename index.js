const expInputEl = document.querySelector(".exp-input");
const output = document.querySelector(".output");

const numBtns = document.querySelectorAll(".num");
const operatorBtns = document.querySelectorAll(".operator");

const clearBtn = document.getElementById("clear");
const backspaceBtn = document.getElementById("backspace");

const equalsBtn = document.getElementById("equals");
const parenthesisBtn = document.getElementById("parenthesis");
const negateBtn = document.getElementById("negate");
const decimalBtn = document.getElementById("decimal");

const historyBtn = document.getElementById("history");
const keyboard = document.querySelector(".keyboard");

const syntaxErrorPopup = document.querySelector(".syntax-error-popup");

let operatorClicked = 0;
let openingParenthesisClicked = 0;

// Represents a calculation history
class Calculation {
  constructor(expression, answer) {
    this.expression = expression;
    this.answer = answer;
  }
}

// Handles Storage
class Store {
  static getCalculations() {
    let calculations;

    if (localStorage.getItem("calculations") === null) {
      calculations = []; // Initialize
    } else {
      // Local storage stores the data in string format
      // Convert the string data into array of JSON data
      calculations = JSON.parse(localStorage.getItem("calculations"));
    }

    return calculations;
  }

  static addCalculation(calculation) {
    const calculations = Store.getCalculations();

    if (calculations.length != 0) {
      const { expression: currentExpression } = calculation;
      const { expression: prevExpression } = calculations[0];

      if (currentExpression === prevExpression) {
        // Previous calculation is the same as current
        return;
      }
    }

    calculations.unshift(calculation); // For displaying the recent calculation at the top

    localStorage.setItem("calculations", JSON.stringify(calculations));
  }

  static removeCalculation(calculationIdx) {
    const calculations = Store.getCalculations();

    calculations.splice(calculationIdx, 1);
    localStorage.setItem("calculations", JSON.stringify(calculations));

    if (calculations.length === 0) {
      // Empty history
      const historyDiv = document.querySelector(".history-div");
      const clearHistoryBtn = document.querySelector(".clear-history-btn");

      CalculationHistoryUI.showEmptyHistoryMessage(historyDiv, clearHistoryBtn);
    }
  }
}

// Handles UI tasks for calculation history
class CalculationHistoryUI {
  static displayCalculations() {
    const historyDiv = document.querySelector(".history-div");
    const clearHistoryBtn = document.querySelector(".clear-history-btn");

    const calculations = Store.getCalculations();

    if (calculations.length === 0) {
      // Empty history
      CalculationHistoryUI.showEmptyHistoryMessage(historyDiv, clearHistoryBtn);
      return;
    }

    const messageDiv = document.querySelector(".empty-history-message");
    if (messageDiv) {
      expInputEl.removeChild(messageDiv);
    }

    calculations.forEach((calculation) => {
      const container = document.createElement("div");

      const calcDiv = document.createElement("div");
      const expressionDiv = document.createElement("div");
      const answerDiv = document.createElement("div");

      const deleteCalculationBtn = document.createElement("i");

      container.className = "history-calculation-container";
      calcDiv.className = "history-calculation";
      expressionDiv.className = "history-expression";
      answerDiv.className = "history-answer";
      deleteCalculationBtn.className = "bi bi-trash delete-calculation-btn";

      expressionDiv.innerHTML = calculation.expression;
      answerDiv.textContent = " = " + calculation.answer;

      deleteCalculationBtn.setAttribute("title", "Delete this calculation");

      calcDiv.appendChild(expressionDiv);
      calcDiv.appendChild(answerDiv);

      container.appendChild(calcDiv);
      container.appendChild(deleteCalculationBtn);

      historyDiv.appendChild(container);

      calcDiv.addEventListener("click", () => {
        expInputEl.textContent = "";

        const expression = calcDiv.firstElementChild.innerHTML;
        expInputEl.innerHTML = expression;
      });

      deleteCalculationBtn.addEventListener("click", (e) => {
        const historyCalculationContainer = e.target.parentElement;

        const calculationIdx = [
          ...historyCalculationContainer.parentElement.children,
        ].indexOf(historyCalculationContainer);

        // Remove the calculation from UI
        CalculationHistoryUI.deleteCalculation(historyCalculationContainer);

        // Remove the calculation from storage
        Store.removeCalculation(calculationIdx);
      });
    });

    clearHistoryBtn.addEventListener("click", () => {
      localStorage.setItem("calculations", JSON.stringify([])); // Clear the local storage
      historyDiv.textContent = "";
      CalculationHistoryUI.displayCalculations();
    });
  }

  static showEmptyHistoryMessage(historyDiv, clearHistoryBtn) {
    clearHistoryBtn.classList.remove("hover");
    clearHistoryBtn.classList.remove("active");

    const messageDiv = document.createElement("div");
    messageDiv.textContent =
      "Your calculations and results appear here so that you can reuse them";
    messageDiv.className = "empty-history-message";

    historyDiv.appendChild(messageDiv);
  }

  static deleteCalculation(historyCalculationContainer) {
    historyCalculationContainer.parentElement.removeChild(
      historyCalculationContainer
    );
  }
}

function evaluateExpression() {
  let expression = expInputEl.textContent
    .replace(/\u00D7/g, "*") // Unicode for × (&times;)
    .replace(/\u00F7/g, "/") // Unicode for ÷ (&divide;)
    .replace(/\u2212/g, "-") // Unicode for − (&minus;)
    .replace(/%/g, "/100");

  // Close the unclosed parentheses
  expression += ")".repeat(unclosedParenthesisCount());

  try {
    // For handling floating decimals
    // Show at most 10 decimals if necessary
    // output.textContent = Math.round((eval(expression) + Number.EPSILON) * 10 ** 10) / 10 ** 10;
    output.textContent = eval(expression);
  } catch (error) {
    output.textContent = "";
    return null;
  }
}

function unclosedParenthesisCount() {
  let unclosed = 0;
  for (const curChar of expInputEl.textContent) {
    if (curChar === "(") {
      unclosed++;
    } else if (curChar === ")") {
      unclosed--;
    }
  }

  return unclosed;
}

function equalsClicked() {
  if (
    expInputEl.firstElementChild &&
    expInputEl.firstElementChild.style.color === "rgb(148, 252, 19)"
  ) {
    return 1;
  }

  return 0;
}

// Detect changes made to expression input element
// Options for the observer (which mutations to observe)
const config = { childList: true };

// Callback function to execute when mutations are observed
function callback(mutationsList, observer) {
  // Use traditional 'for loops' for IE 11
  for (const mutation of mutationsList) {
    if (mutation.type === "childList") {
      // A chlid node has been added or removed
      syntaxErrorPopup.classList.remove("visible"); // Remove the syntax error message

      evaluateExpression();

      if (expInputEl.lastElementChild) {
        expInputEl.lastElementChild.scrollIntoView();
      }
    }
  }
}

// Create an observer instance linked to the callback function
const observer = new MutationObserver(callback);

// Start observing the target node for configured mutations
observer.observe(expInputEl, config);

clearBtn.addEventListener("click", () => {
  expInputEl.textContent = "";
  output.textContent = "";

  operatorClicked = 0;
  openingParenthesisClicked = 0;
});

backspaceBtn.addEventListener("click", () => {
  const span = expInputEl.lastElementChild;
  const prevText = span ? span.textContent : null;

  if (/[+−×/(]/.test(prevText)) {
    operatorClicked = 0;
  }

  if (span) {
    expInputEl.removeChild(span);
  }

  evaluateExpression();
});

numBtns.forEach((numBtn) => {
  numBtn.addEventListener("click", (e) => {
    if (equalsClicked() && !operatorClicked) {
      // Clear the output if the user enters a number when result displayed in main display
      expInputEl.textContent = "";
    }

    operatorClicked = 0;
    openingParenthesisClicked = 0;

    const span = document.createElement("span");

    if (
      expInputEl.lastElementChild &&
      (expInputEl.lastElementChild.textContent === "%" ||
        expInputEl.lastElementChild.textContent === ")")
    ) {
      const timesSpan = document.createElement("span");
      timesSpan.textContent = " × ";
      timesSpan.style.color = "#94fc13";

      const numSpan = document.createElement("span");
      numSpan.textContent = e.target.textContent;
      numSpan.style.color = "#fafafa";

      expInputEl.appendChild(timesSpan);
      expInputEl.appendChild(numSpan);

      return;
    } else {
      span.textContent = e.target.textContent;
      span.style.color = "#fafafa";
    }

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

    if (equalsClicked()) {
      // Change the color of the result in main display if the user enters an operator
      expInputEl.firstChild.style.color = "#fafafa";
    }

    operatorClicked = e.target.id === "percent" ? 0 : 1; // Allow operation if previous operator = %
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
  if (equalsClicked()) {
    // Multiple equals clicks
    return;
  }

  const answer = output.textContent;

  if (evaluateExpression() === null) {
    // Error popup message (invalid expression)
    if (syntaxErrorPopup.classList.contains("visible")) {
      // Repeated equals click
      return;
    }

    syntaxErrorPopup.classList.add("visible");
    return;
  }

  if (answer === "") {
    // Empty input
    return;
  }

  const expression = expInputEl.innerHTML;

  // Instantiate calculation history
  const calculationHistory = new Calculation(expression, answer);

  // Add calculation history to storage
  Store.addCalculation(calculationHistory);

  const span = document.createElement("span");
  span.style.color = "#94fc13";
  span.textContent = answer;

  expInputEl.textContent = "";
  expInputEl.appendChild(span);
});

parenthesisBtn.addEventListener("click", () => {
  if (equalsClicked()) {
    expInputEl.firstElementChild.style.color = "#fafafa";
  }

  const prevEl = expInputEl.lastElementChild;
  const prevText = prevEl ? prevEl.textContent : null;

  const span = document.createElement("span");
  span.style.color = "#fafafa";

  if (/[(+−×/]/.test(prevText)) {
    // Parenthesis button clicked after opening parenthesis or negate button or +,−,×, or /
    span.textContent = "(";
    openingParenthesisClicked = 1;
  } else if (unclosedParenthesisCount() >= 1) {
    span.textContent = ")";
  } else if (/[0-9)%]/.test(prevText)) {
    // Parenthesis button clicked after number or ) or %
    const timesSpan = document.createElement("span");
    timesSpan.textContent = " × ";
    timesSpan.style.color = "#94fc13";

    const parenthesisSpan = document.createElement("span");
    parenthesisSpan.textContent = "(";
    parenthesisSpan.style.color = "#fafafa";

    expInputEl.appendChild(timesSpan);
    expInputEl.appendChild(parenthesisSpan);

    openingParenthesisClicked = 1;

    return;
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

  if (secondLastText === "(−") {
    // Use of negate button after (negate button + digit)
    expInputEl.removeChild(secondLastEl);
  } else if (prevText === "(−") {
    // Use of negate button only
    expInputEl.removeChild(prevEl);
  } else if (secondLastText === "−" && thirdLastText === "(") {
    // Use of negate button after ('(' + '-' + digit)
    expInputEl.removeChild(secondLastEl);
    expInputEl.removeChild(thirdLastEl);
  } else if (prevText === "−" && secondLastText === "(") {
    // Use of negate button after ('(' + '-')
    expInputEl.removeChild(prevEl);
    expInputEl.removeChild(secondLastEl);
  } else if (/[0-9]/g.test(prevText)) {
    // This case can handle all the above cases. For only the sake of speed the above edge cases have been used.

    // Use of negate button after number
    const expressionTokens = expInputEl.textContent.split(/[\s(−]/);
    const lastNumber = expressionTokens[expressionTokens.length - 1];
    let numberLength = lastNumber.length;

    // Remove the digits of the last number
    while (numberLength) {
      const span = expInputEl.lastElementChild;
      expInputEl.removeChild(span);
      numberLength--;
    }

    const lastEl = expInputEl.lastElementChild;
    const lastText = lastEl ? lastEl.textContent : null;

    const secondLastEl = lastEl ? lastEl.previousElementSibling : null;
    const secondLastText = secondLastEl ? secondLastEl.textContent : null;

    // Toggle negation
    if (lastText === "(−") {
      // Use of negate button after (negate button + number)
      expInputEl.removeChild(lastEl);
    } else if (lastText === "−" && secondLastText === "(") {
      // Use of negate button after ('(' + '-' + number)
      expInputEl.removeChild(lastEl);
      expInputEl.removeChild(secondLastEl);
    } else {
      const negateSpan = document.createElement("span");
      negateSpan.textContent = "(−";
      negateSpan.style.color = "#fafafa";
      expInputEl.appendChild(negateSpan);
    }

    // Add the digits of the last number
    for (const num of lastNumber.toString()) {
      let numSpan = document.createElement("span");
      numSpan.textContent = num;
      numSpan.style.color = "#fafafa";
      expInputEl.appendChild(numSpan);
    }
  } else if (prevText === "%") {
    // % changes to % × (-
    const timesSpan = document.createElement("span");
    timesSpan.textContent = " × ";
    timesSpan.style.color = "#94fc13";

    const negateSpan = document.createElement("span");
    negateSpan.textContent = "(−";
    negateSpan.style.color = "#fafafa";

    expInputEl.appendChild(timesSpan);
    expInputEl.appendChild(negateSpan);
  } else {
    // Empty previous text or an operator (+, −, ×, ÷)
    span.textContent = "(−";
    expInputEl.appendChild(span);
  }
});

decimalBtn.addEventListener("click", () => {
  if (expInputEl.lastElementChild === null) {
    // First decimal
    expInputEl.innerHTML = `<span style="color:#fafafa;">0</span><span style="color:#fafafa;">.</span>`;
    return;
  }

  const expressionTokens = expInputEl.textContent.split(/[\s(−]/);
  const lastNumber = expressionTokens[expressionTokens.length - 1];

  if (/[.]/.test(lastNumber)) {
    return;
  }

  const prevText = expInputEl.lastElementChild.textContent;

  const times = document.createElement("span");
  const zero = document.createElement("span");
  const decimal = document.createElement("span");

  times.style.color = "#94fc13";
  zero.style.color = "#fafafa";
  decimal.style.color = "#fafafa";

  times.textContent = " × ";
  zero.textContent = "0";
  decimal.textContent = ".";

  if (/[+−×/(]/.test(prevText)) {
    // Decimal after +, −, ×, / or (
    expInputEl.appendChild(zero);
    expInputEl.appendChild(decimal);
  } else if (/[%]/.test(prevText)) {
    // Decimal after %
    expInputEl.appendChild(times);
    expInputEl.appendChild(zero);
    expInputEl.appendChild(decimal);
  } else {
    // Decimal after number
    expInputEl.appendChild(decimal);
  }
});

historyBtn.addEventListener("click", () => {
  historyBtn.classList.toggle("bi-clock-history");
  historyBtn.classList.toggle("bi-calculator");

  if (historyBtn.classList.contains("bi-clock-history")) {
    const historyMainDiv = document.querySelector(".history-main-div");
    keyboard.removeChild(historyMainDiv);

    return;
  }

  const mainDiv = document.createElement("div");
  const historyDiv = document.createElement("div");

  const clearHistoryDiv = document.createElement("div");
  const clearHistoryBtn = document.createElement("button");

  mainDiv.className = "history-main-div";

  historyDiv.className = "history-div";
  historyDiv.textContent = "";

  clearHistoryDiv.className = "clear-history-div";

  clearHistoryBtn.className = "clear-history-btn hover active";
  clearHistoryBtn.textContent = "Clear history";

  clearHistoryDiv.appendChild(clearHistoryBtn);

  mainDiv.appendChild(historyDiv);
  mainDiv.appendChild(clearHistoryDiv);

  keyboard.appendChild(mainDiv);

  CalculationHistoryUI.displayCalculations();
});
