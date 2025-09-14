const board = document.getElementById("board");
const tokens = Array.from(document.querySelectorAll(".token"));
const moveSquares = Array.from(document.querySelectorAll(".move-square"));
const homeSquares = Array.from(document.querySelectorAll(".home-square"));
document.querySelectorAll(".final-arrow, .token").forEach(el => {
     el.style.width = `min(${el.parentElement.offsetWidth}px, ${el.parentElement.offsetHeight}px)`;
});
const currentPlayerElement = document.getElementById("current-player");

let dice = document.getElementById("dice");
let diceNumber = null;
let currentPlayer = "blue";
let tokenHasMove = true; //! add condition
let diceRollable = true;
let extraTurn = false;
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
          extraTurn = false;
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
          }
          autoMove();
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
                    captureToken(nextSquare);
                    nextSquare.appendChild(token);
                    turnDone = true;
                    diceRollable = true;
                    diceNumber = "#";
                    dice.innerHTML = "#"
                    token.style.scale = ".5";
               } else diceRollable = false;
          } else {
               if (tokenIsOpen && tokenHasMove) {
                    captureToken(nextSquare);
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
               token.style.scale = ".5";
          }
          !extraTurn && turnDone && updatePlayer(++x);
     }
});

function updatePlayer(x) {
     currentPlayer = ["blue", "yellow", "green", "pink"][x % 4];
     currentPlayerElement.innerText = currentPlayer.toUpperCase();
     priortiseTokens(tokens.filter(token => token.classList.contains(`token-${currentPlayer}`)));
}


// let colors = {
//      blue: "blue",
//      yellow: "yellow",
//      green: "green",
//      pink: "pink"
// }
const indicator = document.createElement("span");
indicator.className = "indicator";

function priortiseTokens(currentTokens) {
     tokens.forEach(token => {
          token.style.zIndex = "1";
          token.style.boxShadow = "0 1px 2px gray"

          // token.innerHTML = "";
          // token.style.border = "none";
     });
     currentTokens.forEach(token => {
          token.style.zIndex = "2";
          token.style.boxShadow = "0 2px 3px gray";

          // token.style.border = "1px solid";
          // token.appendChild(indicator.cloneNode(true));
     });
}

function captureToken(square) {
     if (!square.classList.contains(".stop")) {
          let token = square.querySelector(".token");
          if (token) {
               token.style.scale = "1.7";
               token.classList.remove("open");
               let homeSquare = document.querySelector(`.home-square-${token.dataset.color}`)
               homeSquare.appendChild(token);
               extraTurn = true;
          }
     }
}

function autoMove() {
     let tokens = Array.from(document.querySelectorAll(`.token-${currentPlayer}`));
     let allTokensClosed = tokens.every(token => !token.classList.contains("open"));
     let openTokens = tokens.filter(token => token.classList.contains("open"));
     let onlyToken = openTokens.length === 1;
     let tokensAtSamePlace = openTokens.length > 0 && openTokens.every(token => token.parentElement.classList.contains(`${currentPlayer}-stop`));

     setTimeout(() => {
          
     if ((onlyToken || tokensAtSamePlace) && diceNumber !== 6) {
          openTokens[0].click();
     }
     if (allTokensClosed && diceNumber === 6) {
          tokens[0].click();
     }
     }, 600);
}

//? colored tokens can just have their .token removed.