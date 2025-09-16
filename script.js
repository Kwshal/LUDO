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
          if (!someMovableToken()) {
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
function someMovableToken() {
     let currentTokens = [...document.querySelectorAll(`.token-${currentPlayer}`)];
     return currentTokens.some(token => {
          return token.classList.contains("open") && (+token.dataset.squaresMoved + diceNumber) < 59;
     });
}

board.addEventListener("click", e => {
     if (e.target.classList.contains("token") && e.target.classList.contains(`token-${currentPlayer}`)) {
          let token = e.target;
          let tokenHasMove = token.classList.contains("open") && (+token.dataset.squaresMoved + diceNumber < 59);
          let startSquare = document.querySelector(`.${currentPlayer}-stop`);
          let currentSquare = +token.parentElement.dataset.sqNum;
          let nextSquare = moveSquares.find(sq => +sq.dataset.sqNum === (currentSquare + diceNumber) % 52);
          let squaresMoved = +token.dataset.squaresMoved;
          let finalSquare = Array.from(document.querySelectorAll(`.final-square-${currentPlayer}`)).find(sq => +sq.dataset.sqNum === (squaresMoved + diceNumber - 52));

          if (diceNumber === "#") return;
          if (squaresMoved + diceNumber > 58) return;
          
          if ((squaresMoved + diceNumber) <= 52) {
               if (diceNumber !== 6) {
                    if (tokenHasMove) {
                         captureToken(nextSquare);
                         nextSquare.appendChild(token);
                         turnDone = true;
                         diceRollable = true;
                         token.dataset.squaresMoved = `${squaresMoved + diceNumber}`;
                         diceNumber = "#";
                         dice.innerHTML = "#";
                         token.style.scale = ".5";
                    }
               } else {
                    if (tokenHasMove) {
                         token.dataset.squaresMoved = `${squaresMoved + diceNumber}`;
                         captureToken(nextSquare);
                         nextSquare.appendChild(token);
                         diceRollable = true;
                    } else {
                         token.dataset.squaresMoved = `${squaresMoved + 1}`;
                         startSquare.appendChild(token);
                         token.classList.add("open");
                         diceRollable = true;
                    }
                    turnDone = false;
                    extraTurn = true;
                    currentPlayerElement.innerHTML = currentPlayer.toUpperCase() + " ↻";
                    diceNumber = "#";
                    dice.innerHTML = "#"
                    token.style.scale = ".5";
               }
               // console.log(token.dataset.squaresMoved);
          }
          else if ((squaresMoved + diceNumber) > 52 && (squaresMoved + diceNumber) < 58) {
               finalSquare.appendChild(token);
               turnDone = true;
               diceRollable = true;
               token.dataset.squaresMoved = `${squaresMoved + diceNumber}`;
               diceNumber = "#";
               dice.innerHTML = "#";
          }
          else if ((squaresMoved + diceNumber) === 58) {
               token.classList.add("colored");
               token.classList.remove(`token-${currentPlayer}`);
               token.style.scale = "1.7";
               tokenIsColored[currentPlayer] += 1;
               let placeSquare = Array.from(document.querySelectorAll(`.home-square-${token.dataset.color} .place-square`)).find(sq => !sq.querySelector(".token"));
               placeSquare.appendChild(token);
               token.innerHTML = "✪";
               diceNumber = "#";
               dice.innerHTML = "#";
               diceRollable = true;
               extraTurn = true;
               currentPlayerElement.innerHTML = currentPlayer.toUpperCase() + " ↻";
               checkWinner();
          }
          !extraTurn && turnDone && updatePlayer(++x);
     }
});

function updatePlayer(x) {
     currentPlayer = ["blue", "yellow", "green", "pink"][x % 4];
     currentPlayerElement.innerText = currentPlayer.toUpperCase();
     priortiseTokens(tokens.filter(token => token.classList.contains(`token-${currentPlayer}`)));
}

function priortiseTokens(currentTokens) {
     tokens.forEach(token => {
          token.style.zIndex = "1";
          token.style.boxShadow = "0 1px 2px gray";
     });
     currentTokens.forEach(token => {
          token.style.zIndex = "2";
          token.style.boxShadow = "0 2px 3px gray";
     });
}

function captureToken(square) {
     if (square.classList.contains("stop")) return;
     let token = square.querySelector(".token");
     if (token) {
          token.style.scale = "1.7";
          token.classList.remove("open");
          let placeSquare = Array.from(document.querySelectorAll(`.home-square-${token.dataset.color} .place-square`)).find(sq => !sq.querySelector(".token"));
          placeSquare.appendChild(token);
          extraTurn = true;
          currentPlayerElement.innerHTML = currentPlayer.toUpperCase() + " ↻";
          token.dataset.squaresMoved = "0";
     }
}

function autoMove() {
     let tokens = Array.from(document.querySelectorAll(`.token-${currentPlayer}`));
     let allTokensClosed = tokens.every(token => !token.classList.contains("open"));
     let openTokens = tokens.filter(token => token.classList.contains("open"));
     let onlyOpenToken = openTokens.length === 1;
     let onlyMovableToken = getMovableTokens(openTokens).length === 1;
     let tokensAtSamePlace = openTokens.length > 0 && openTokens.every(token => token.parentElement.classList.contains(`${currentPlayer}-stop`));

     setTimeout(() => {
          if ((onlyOpenToken || tokensAtSamePlace || onlyMovableToken) && diceNumber !== 6) {
               openTokens[0].click();
          }
          if (allTokensClosed && diceNumber === 6) {
               tokens[0].click();
          }
     }, 600);
}

function getMovableTokens(openTokens) {
     let movableTokens = openTokens.filter(token => token && ((+token.dataset.squaresMoved + diceNumber) < 59));
     return movableTokens;
}

function checkWinner() {
     let currentTokens = [...document.querySelectorAll(`.token-${currentPlayer}`)];
     let win = currentTokens.every(token => token.classList.contains("colored"));
     if (win) {
          currentPlayerElement.innerHTML = `${currentPlayer.toUpperCase()} WINS!`;
          dice.innerHTML = "✦";
          // location.reload();
     }
     extraTurn = false;
}

async function animateMoves(currentSquare, squaresMoved) {
     for (let i = 1; i < diceNumber+1; i++) {
          let nextSquare = moveSquares[(currentSquare + i) % 52];
          setTimeout(() => {
               if ((squaresMoved + i) < 52) {
                    
               }

          }, 250);
          (currentSquare+diceNumber === squaresMoved) && (diceRollable = true);
     }
}

