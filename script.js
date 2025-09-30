
import {diceNumberRef, currentPlayerRef, movingTokenRef, capturedTokenRef, coloringTokenRef, set} from "./db.js";

const board = document.getElementById("board");
const tokens = Array.from(document.querySelectorAll(".token"));
const moveSquares = Array.from(document.querySelectorAll(".move-square"));
const homeSquares = Array.from(document.querySelectorAll(".home-square"));
document.querySelectorAll(".final-arrow, .token, .star").forEach(el => {
     el.style.width = `min(${el.parentElement.offsetWidth}px, ${el.parentElement.offsetHeight}px)`;
});
// for (let i = 1; i <= 4; i++) {
//      ["blue", "yellow", "red", "green"].forEach(color => {
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

let players = ["blue", "yellow", "green", "red"];
const translations = {
     blue: "-45% -45%",
     red: "-45% 45%",
     yellow: "45% -45%",
     green: "45% 45%",
};
let x = -1;

const checkboxes = document.querySelectorAll('input[type="checkbox"]');
checkboxes.forEach(box => {
     // box.style.accentColor = `var(--${box.value}-dark)`;
     // box.style.backgroundColor = `var(--${box.value}-soft)`;
     let span = document.querySelector(`.${box.value}-label`);
     span.style.color = `var(--${box.value})`;

     box.addEventListener("change", () => {
          let span = document.querySelector(`.${box.value}-label`);

          if (box.checked) {
               span.style.color = `var(--${box.value})`;
               const checkedBoxes = [...document.querySelectorAll('input[type="checkbox"]:checked')];
               players = checkedBoxes.map(b => b.value);
               // translations
          } else {
               span.style.color = `#ffffff60`;
               players.splice(players.indexOf(box.value), 1);
          }
          tokens.forEach(token => {
               token.style.display = players.includes(token.dataset.color) ? "flex" : "none";
          });
     });
});

dice.addEventListener("click", async () => {
     if (diceRollable) {
          // console.log(diceRollable);
          diceNumber === null && updatePlayers(++x); //? ++ (post increment operator)
          diceNumber = Math.floor(Math.random() * 6 + 1);
          dice.innerText = diceNumber;
          diceRollable = false;
          turnDone = false;
          extraTurn = false;
          activateTokens(getCurrTokens());
          autoMove();
     }
});

function someMovableToken() {
     let currentTokens = [...document.querySelectorAll(`.token-${currentPlayer}`)];
     return currentTokens.some(token => {
          return token.classList.contains("open") && (+token.dataset.squaresMoved + diceNumber) < 59;
     });
}

function handleDice() {
     // !extraTurn && updatePlayers(++x) && console.log("handle");
     diceRollable = true;
     dice.innerHTML = "#";
     diceNumber = "#";
     // move the dice slightly to the current player
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
     animateMovement(placeSquare, token, 1);
     token.classList.add("colored");
     token.classList.remove(`token-${currentPlayer}`);
     token.style.transform = "scale(1)";
     token.style.backgroundColor = `var(--${currentPlayer}-soft)`;
     // console.log("here");
     // token.innerHTML = "✪";
     // tokenIsColored[currentPlayer] += 1;
     currentPlayerElement.innerHTML = currentPlayer.toUpperCase() + " ↻";
     checkWinner();
}

async function moveToken(token) {
     let startSquare = document.querySelector(`.${currentPlayer}-stop`);
     let currentSquare = +token.parentElement.dataset.sqNum;
     let squaresMoved = +token.dataset.squaresMoved;
     let progress = squaresMoved; // track local progress

     if (progress + diceNumber > 58) return; // cannot move
     extraTurn = diceNumber === 6;
               deactivateTokens(getCurrTokens());

     for (let i = 1; i <= diceNumber; i++) {
          progress++; // step forward

          if (squaresMoved === 0 && diceNumber === 6 && i === 1) {
               // first entry to stop square
               // await animateMovement(startSquare, token);
               startSquare.appendChild(token);
               token.style.transform = "scale(0.7)";
               token.classList.add("open");
               break;
          } else if (progress < 53) {
               // normal board squares
               let square = moveSquares.find(sq => +sq.dataset.sqNum === (currentSquare + i) % 52);
               if (i === diceNumber) captureToken(square) && (extraTurn = true);
               await animateMovement(square, token);
          } else if (progress < 58) {
               // final colored path (53–57)
               let square = document.querySelector(
                    `.final-square-${currentPlayer}[data-sq-num="${progress - 52}"]`
               );
               await animateMovement(square, token);
          } else if (progress === 58) {
               // reached home
               colorToken(token);
               extraTurn = true;
               break;
          }
     }

     if (diceNumber !== "#") token.dataset.squaresMoved = `${progress}`;

     if (!extraTurn) {
          updatePlayers(++x);
     }

     handleDice();
}


function updatePlayers(x) {
     // return; 
     currentPlayer = players[x % players.length];
     currentPlayerElement.innerHTML = currentPlayer.toUpperCase() + "<span id='turn'>'s Turn</span>";
     currentPlayerElement.style.color = `var(--${currentPlayer})`;
     prepareTokens(tokens.filter(token => token.classList.contains(`token-${currentPlayer}`)));
     // console.log("switched");
     dice.style.translate = translations[currentPlayer];
     // dice.style.color = `var(--${currentPlayer}-dark)`;
     return true;
}

function prepareTokens(currentTokens) {
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
          animateMovement(placeSquare, token, 1);
          currentPlayerElement.innerHTML = currentPlayer.toUpperCase() + " ↻";
          token.dataset.squaresMoved = "0";
          return true;
     }
     return false;
}
function animateMovement(square, token, val = 0.7) {
     return new Promise(resolve => {
          const rect1 = token.getBoundingClientRect();
          const rect2 = square.getBoundingClientRect();

          // centers
          const tokenCenterX = rect1.left + rect1.width / 2;
          const tokenCenterY = rect1.top + rect1.height / 2;
          const squareCenterX = rect2.left + rect2.width / 2;
          const squareCenterY = rect2.top + rect2.height / 2;

          // deltas
          const deltaX = squareCenterX - tokenCenterX;
          const deltaY = squareCenterY - tokenCenterY;

          // set transition in CSS, not JS

          token.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${.8})`;

          function handleEnd(e) {
               if (e.propertyName === "transform") {
                    token.removeEventListener("transitionend", handleEnd);

                    // reset transform and actually move the token
                    token.style.transform = `scale(${val})`;
                    square.appendChild(token);
                    resolve();
               }
          }

          token.addEventListener("transitionend", handleEnd);
     });
}

function autoMove() {

     if (!someMovableToken()) {
          if (diceNumber !== 6) {
               setTimeout(() => {
                    turnDone = true;
                    updatePlayers(++x);
                    handleDice();
               }, 600);
          }
     }

     // gather all tokens of this player (includes colored tokens)
     const allTokens = Array.from(document.querySelectorAll(".token")).filter(t => t.dataset.color === currentPlayer);

     const openTokens = allTokens.filter(t => t.classList.contains("open") && !t.classList.contains("colored"));
     const closedTokens = allTokens.filter(t => !t.classList.contains("open") && !t.classList.contains("colored"));
     const coloredCount = allTokens.filter(t => t.classList.contains("colored")).length;
     const movable = getMovableTokens(openTokens); // relies on dataset.squaresMoved

     setTimeout(() => {
          // ---- Case 5 (expanded): Only one token left to finish (three already colored) ----
          if (coloredCount === 3) {
               // if the remaining token is already open -> move it
               if (openTokens.length === 1) {
                    openTokens[0].click();
                    console.log(0);
                    return;
               }
               // if the remaining token is closed and we rolled a 6 -> spawn it
               if (closedTokens.length === 1 && diceNumber === 6) {
                    closedTokens[0].click();
                    console.log(0);
                    return;
               }
               // otherwise no auto-move
               return;
          }

          // ---- Case 1: All tokens closed, dice = 6 -> spawn one ----
          if (closedTokens.length === allTokens.length && diceNumber === 6) {
               closedTokens[0].click();
               console.log(0);
               return;
          }

          // ---- Case 2: Only one open token -> move it ----
          if (openTokens.length === 1 && diceNumber !== 6) {
               openTokens[0].click();
               console.log(0);
               return;
          }

          // ---- Case 3: Only one token can move among opens -> move it ----
          if (movable.length === 1 && diceNumber !== 6) {
               movable[0].click();
               console.log(0);
               return;
          }
          if (movable.length === 1 && diceNumber === 6 && closedTokens.length === 0) {
               movable[0].click();
               console.log(0);
               return;
          }
          if (movable.length === 0 && closedTokens.length === 0) {
               turnDone = true;
               updatePlayers(++x) && console.log("auto");
               handleDice();

               // no token can move, do nothing
               return;
          }

          // ---- Case 4 (expanded): All open tokens are on a stop (any stop), dice != 6 ----
          // This covers stacks on stops that are NOT necessarily your own stop.
          if (
               openTokens.length > 0 &&
               openTokens.every(t => t.parentElement.classList.contains("stop") && t.parentElement.dataset.sqNum !== document.querySelector(`.token-${currentPlayer}`).parentElement.dataset.sqNum) &&
               diceNumber !== 6
          ) {
               openTokens[0].click();
               console.log(0);
               return;
          }

          // ---- Case 6: Exactly one can reach home with this roll ----
          const homeMovers = openTokens.filter(t => (+t.dataset.squaresMoved + diceNumber) === 58);
          if (homeMovers.length === 1) {
               homeMovers[0].click();
               console.log(0);
               return;
          }

          // otherwise: do nothing — player must choose
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
     players.splice(players.indexOf(currentPlayer), 1);
     // y--;
     // if (y === 1) {
     //      setTimeout(() => {
     //           location.reload();
     //      }, 2000);
     // }
}

function activateTokens(currTokens) {
     if (diceNumber === 6) {
          currTokens.forEach(token => !token.classList.contains("colored") && token.classList.add("active"));
     } else getMovableTokens(currTokens).forEach(token => token.classList.contains("open") && !token.classList.contains("colored") && token.classList.add("active"));
}
function deactivateTokens(currentTokens) {
     currentTokens.forEach(token => token.classList.remove("active"));
     return true;
}
function getCurrTokens() {
     return Array.from(document.querySelectorAll(`.token-${currentPlayer}`));
}



export { dice,diceNumber, currentPlayer, updatePlayers, currentPlayerElement, moveToken, captureToken, colorToken };