const board = document.getElementById("board");
const tokens = Array.from(document.querySelectorAll(".token"));
const moveSquares = Array.from(document.querySelectorAll(".move-square"));
const homeSquares = Array.from(document.querySelectorAll(".home-square"));
document.querySelectorAll(".final-arrow, .token, .star").forEach(el => {
     el.style.width = `min(${el.parentElement.offsetWidth}px, ${el.parentElement.offsetHeight}px)`;
});
// for (let i = 1; i <= 4; i++) {
//      ["blue", "yellow", "pink", "green"].forEach(color => {
//      document.querySelector(`.token-${color}:nth-child(${1}`).style.transitionDelay = `${i * 0.1}s`;
//      });
// }
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

dice.addEventListener("click", async () => {
     if (diceRollable) {
          // console.log(diceRollable);
          activateTokens(getCurrTokens());
          diceNumber === null && updatePlayer(++x) && console.log("dice"); //? ++ (post increment operator)
          diceNumber = Math.floor(Math.random() * 6 + 1);
          dice.innerText = diceNumber;
          diceRollable = false;
          turnDone = false;
          extraTurn = false;
          if (!someMovableToken()) {
               if (diceNumber !== 6) {
                    setTimeout(() => {
                         turnDone = true;
                         updatePlayer(++x) && console.log("auto");
                         initDice();
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

function initDice() {
     // !extraTurn && updatePlayer(++x) && console.log("handle");
     diceRollable = true;
     dice.innerHTML = "#";
     diceNumber = "#";
}

board.addEventListener("click", e => {
     if (e.target.classList.contains("token") && e.target.classList.contains(`token-${currentPlayer}`)) {
          let token = e.target;
          let tokenHasMove = ((!token.classList.contains("open") && !token.classList.contains("colored") && diceNumber === 6) || token.classList.contains("open")) && (+token.dataset.squaresMoved + diceNumber < 59) && diceNumber !== "#" && diceNumber !== "✦";
          tokenHasMove && moveToken(token);
     }
});

function colorToken(token) {
     let placeSquare = Array.from(document.querySelectorAll(`.home-square-${token.dataset.color} .place-square`)).find(sq => !sq.querySelector(".token"));
     // placeSquare.appendChild(token);
     animateMovement(placeSquare, token, 1.7);
     token.classList.add("colored");
     token.classList.remove(`token-${currentPlayer}`);
     token.style.scale = "1.7";
     console.log("here");
     token.innerHTML = "✪";
     tokenIsColored[currentPlayer] += 1;
     currentPlayerElement.innerHTML = currentPlayer.toUpperCase() + " ↻";
     checkWinner();
}

async function moveToken(token) {

     let startSquare = document.querySelector(`.${currentPlayer}-stop`);
     let currentSquare = +token.parentElement.dataset.sqNum;
     let squaresMoved = +token.dataset.squaresMoved;
     let moveSquare = (i) => moveSquares.find(sq => +sq.dataset.sqNum === (currentSquare + i) % 52);
     let finalSquare = (i) => Array.from(document.querySelectorAll(`.final-square-${currentPlayer}`)).find(sq => +sq.dataset.sqNum === (squaresMoved + i - 52));

     extraTurn = diceNumber === 6;

     // token.style.translate = "0 -5px";
     // await new Promise(resolve => setTimeout(resolve, 500));
     for (let i = 1; i <= diceNumber; i++) {
          // console.log(token.dataset.squaresMoved, "a");

          if (squaresMoved === 0 && diceNumber === 6) {
               // startSquare.appendChild(token);
               animateMovement(startSquare, token);
               token.style.scale = ".5";
               // console.log("here");
               token.classList.add("open");
               diceNumber = 1;
               break;
          } else if (squaresMoved + i < 53) {
               i === diceNumber && captureToken(moveSquare(i)) && (extraTurn = true);
               // moveSquare(i).appendChild(token);
               animateMovement(moveSquare(i), token);
               await new Promise(resolve => setTimeout(resolve, 250));
          } else if (squaresMoved + i === 58) {
               colorToken(token);
               extraTurn = true;
          } else {
               // finalSquare(i).appendChild(token);
               animateMovement(finalSquare(i), token);
               await new Promise(resolve => setTimeout(resolve, 250));
          }
     }
     // token.style.translate = "0 0px";
     token.dataset.squaresMoved = `${squaresMoved + diceNumber}`;
     // console.log(token.dataset.squaresMoved);
     !extraTurn && deactivateTokens(getCurrTokens()) && updatePlayer(++x) && console.log("move");
     initDice();
     // console.log(diceRollable);
}


function updatePlayer(x) {
     // return; 
     currentPlayer = ["blue", "yellow", "green", "pink"][x % 4];
     currentPlayerElement.innerText = currentPlayer.toUpperCase();
     priortiseTokens(tokens.filter(token => token.classList.contains(`token-${currentPlayer}`)));
     // console.log("switched");
     return true;
}

function priortiseTokens(currentTokens) {
     tokens.forEach(token => {
          token.style.zIndex = "1";
          token.style.boxShadow = "0 1px 2px black";
     });
     currentTokens.forEach(token => {
          token.style.zIndex = "2";
          token.style.boxShadow = "0 2px 3px black";
     });
}

function captureToken(square) {
     if (square.classList.contains("stop")) return;
     let token = square.querySelector(".token");
     if (token) {
          token.style.zIndex = "99999";
          console.log("here");
          token.classList.remove("open");
          let placeSquare = Array.from(document.querySelectorAll(`.home-square-${token.dataset.color} .place-square`)).find(sq => !sq.querySelector(".token"));
          // placeSquare.appendChild(token);
          //todo animate token going back to home
          animateMovement(placeSquare, token, 1.7);
          currentPlayerElement.innerHTML = currentPlayer.toUpperCase() + " ↻";
          token.dataset.squaresMoved = "0";
          return true;
     }
     return false;
}
async function animateMovement(square, token, val = 0.7) {
     let rect1 = token.getBoundingClientRect();
     let rect2 = square.getBoundingClientRect();

     // centers
     let tokenCenterX = rect1.left + rect1.width / 2;
     let tokenCenterY = rect1.top + rect1.height / 2;
     let squareCenterX = rect2.left + rect2.width / 2;
     let squareCenterY = rect2.top + rect2.height / 2;

     // deltas
     let deltaX = squareCenterX - tokenCenterX;
     let deltaY = squareCenterY - tokenCenterY;

         token.style.transition = "transform 0.5s ease-in-out";
     token.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.7)`;

     await new Promise(resolve => setTimeout(resolve, 250));

     token.style.transition = "";
     token.style.transform = "";
     square.appendChild(token);
     token.style.scale = `${val}`;
}

function autoMove() {
     let tokens = Array.from(document.querySelectorAll(`.token-${currentPlayer}`));
     let allTokensClosed = tokens.every(token => !token.classList.contains("open"));
     let openTokens = tokens.filter(token => token.classList.contains("open"));
     let onlyOpenToken = openTokens.length === 1;
     let onlyMovableToken = getMovableTokens(openTokens).length === 1;
     let tokensAtSamePlace = openTokens.length > 0 && openTokens.every(token => token.parentElement.classList.contains(`${currentPlayer}-stop`));
     let r = Math.floor(Math.random() * 4);
     setTimeout(() => {
          if ((onlyOpenToken || tokensAtSamePlace || onlyMovableToken) && diceNumber !== 6) {
               openTokens[0].click();
          }
          if (allTokensClosed && diceNumber === 6) {
               tokens[r].click();
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

function activateTokens(currTokens) {
     diceNumber === 6 ? currTokens.forEach(token => !token.classList.contains("colored") && token.classList.add("active")) : getMovableTokens(currTokens).forEach(token => token.classList.contains("open") && token.classList.add("active"));
}
function deactivateTokens(currentTokens) {
     currentTokens.forEach(token => token.classList.remove("active"));
     return true;
}
function getCurrTokens() {
     return Array.from(document.querySelectorAll(`.token-${currentPlayer}`));
}


