const expInputEl = document.querySelector(".exp-input");

const numBtns = document.querySelectorAll(".num");
const operatorBtns = document.querySelectorAll(".operator");

const clearBtn = document.getElementById("clear");

clearBtn.addEventListener("click", () => {
  expInputEl.textContent = "";
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
        span.textContent = `${e.target.textContent} `;
        break;
      default:
        span.textContent = ` ${e.target.textContent} `;
        break;
    }

    span.style.color = "#94fc13";

    expInputEl.appendChild(span);
  });
});
