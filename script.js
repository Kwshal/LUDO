const board = document.getElementById("board");
const tokens = Array.from(document.querySelectorAll(".token"));
const moveSquares = Array.from(document.querySelectorAll(".move-square"));
// console.log(moveSquares);
// const homeSquares = [...document.querySelectorAll(".homeSquare")];
const currentPlayerElement = document.getElementById("current-player");

let dice = document.getElementById("dice");
let diceNumber = null;
let currentPlayer = "blue";
let tokenHasMove = true; //! add condition
let diceRollable = true;
let turnDone = false;
let x = -1;
let tokenIsColored = false;
let tokensColored = {
     blue: 0,
     yellow: 0,
     pink: 0,
     green: 0
};

dice.addEventListener("click", () => {
     if (diceRollable) {
          !(diceNumber === "#" || diceNumber === 6) && updatePlayer(++x); //? ++ (post increment operator)
          diceNumber = Math.floor(Math.random() * 6 + 1);
          dice.innerText = diceNumber;
          diceRollable = false;
          turnDone = false;
          if (!someOpenToken()) {
               if (diceNumber !== 6) {
                    setTimeout(() => {
                         turnDone = true;
                         diceRollable = true;
                         diceNumber = "#";
                         dice.innerHTML = "#";
                         updatePlayer(++x);
                    }, 600);
               }
               // turnDone && updatePlayer(++x);
               // console.log(currentPlayer,"d:", diceNumber);
          }
     }
});
function someOpenToken() {
     let tokens = [...document.querySelectorAll(`.token-${currentPlayer}`)];
     return tokens.some(token => {
          return token.classList.contains("open") && tokenHasMove;
     });
}

board.addEventListener("click", e => {
     if (e.target.classList.contains("token") && e.target.classList.contains(`token-${currentPlayer}`)) {
          let token = e.target;
          let tokenIsOpen = token.classList.contains("open");
          let startSquare = document.querySelector(`.${currentPlayer}-stop`);
          let currentSquare = +token.parentElement.dataset.sqNum;
          let idx = moveSquares.findIndex(sq => +sq.dataset.sqNum === (currentSquare + diceNumber) % 52);
          let nextSquare = moveSquares[idx];
          let home = document.querySelector(`.${currentPlayer}-home`);

          if (diceNumber !== 6) {
               if (tokenIsOpen && tokenHasMove) {
                    nextSquare.appendChild(token);
                    turnDone = true;
                    diceRollable = true;
                    diceNumber = "#";
                    dice.innerHTML = "#"
               } else diceRollable = false;
          } else {
               if (tokenIsOpen && tokenHasMove) {
                    nextSquare.appendChild(token);
                    diceRollable = true;
               } else {
                    startSquare.appendChild(token);
                    token.classList.add("open");
                    diceRollable = true;
               }
               turnDone = false;
               diceNumber = "#";
               dice.innerHTML = "#"
          }
          turnDone && updatePlayer(++x);
     }
});

function updatePlayer(x) {
     currentPlayer = ["blue", "yellow", "green", "pink"][x % 4];
     // console.log(currentPlayer, "d", diceNumber);
     currentPlayerElement.innerText = currentPlayer.toUpperCase();
}

// function openToken(token, homeSquare) {

// }

// 1 to 17 instead of 1 to 6????? edit: bad idea.




document.querySelectorAll(".final-arrow, .token").forEach(el => {
     el.style.width = `min(${el.parentElement.offsetWidth}px, ${el.parentElement.offsetHeight}px)`;
})