const board = document.getElementById("board");
const tokens = [...document.querySelectorAll(".token")];
const moveSquares = [...document.querySelectorAll(".moveSquare")];
const homeSquares = [...document.querySelectorAll(".homeSquare")];
// const stops = [...document.querySelectorAll(".stop")];
// console.log(stops);

let dice = document.getElementById("dice");
let diceNumber = null;
let currentPlayer = "blue";
let tokenMovable = false;
let diceRollable = true;
let tokenHasMove = true; //! to be changed
console.log("currentPlayer:", currentPlayer);
let x = 0;

dice.addEventListener("click", () => {
     if (diceRollable) {
          diceNumber = Math.floor(Math.random() * 6 + 1);
          dice.innerText = diceNumber;
          // tokenMovable = true;
          x += +(diceNumber !== 6 && !someOpenToken());

          updatePlayer();
     }
});
function someOpenToken() {
     let tokens = [...document.querySelectorAll(`.token-${currentPlayer}`)];
     return tokens.some(token => {
          token.classList.contains("open") && hasAMove;
     });
}

board.addEventListener("click", e => {
     let token = null;
     let tokenIsOpen = null;
     let currentSquare = null;
     let startSquare = null;
     let moveSquare = null;
     let home = null;
     if (e.target.classList.contains("token") && e.target.classList.contains(`token-${currentPlayer}`)) {
          token = e.target;
          tokenIsOpen = token.classList.contains("open");
          if (tokenIsOpen) {
               currentSquare = +token.parentElement.getAttribute("value");
               moveSquare = moveSquares[(currentSquare + diceNumber) % 52];
          } else {
               startSquare = document.querySelector(`.${currentPlayer}-stop`);
          }
     }

     if (token && tokenMovable) {
          if (!tokenIsOpen && diceNumber === 6) {
               startSquare.appendChild(token);
          } else updatePlayer();
          tokenMovable = false;
          diceRollable = true;

          if (tokenIsOpen) {
               moveSquare.appendChild(token);
          }
     }
});

function updatePlayer(x) {
     currentPlayer = ["blue", "yellow", "pink", "green"][x % 4];
     console.log(currentPlayer, diceNumber);
}

// function openToken(token, homeSquare) {

// }

// 1 to 17 instead of 1 to 6????? edit: bad idea.
