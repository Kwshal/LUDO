// --- element refs ---
const board = document.getElementById("board");
const allTokens = Array.from(document.querySelectorAll(".token"));
const moveSquares = Array.from(document.querySelectorAll(".moveSquare"));
const currentPlayerElement = document.getElementById("current-player");
const dice = document.getElementById("dice");

// --- players & state ---
const players = ["blue", "yellow", "green", "pink"];
let currentIndex = 0;
let diceNumber = null;     // current roll (null when none)
let diceRollable = true;   // can the dice be clicked now?

updateCurrentPlayerUI();

// ------------- dice roll -------------
dice.addEventListener("click", () => {
  if (!diceRollable) return;

  diceNumber = Math.floor(Math.random() * 6) + 1;
  dice.innerText = diceNumber;
  diceRollable = false; // block re-roll until we handle the roll

  const player = players[currentIndex];
  const movable = getMovableTokens(player, diceNumber);

  if (movable.length === 0) {
    // no valid move for this roll -> pass turn immediately
    console.log(player, "rolled", diceNumber, "— no moves available, passing turn");
    advanceTurn();
    return;
  }

  // there are valid moves — wait for the player to click one of them
  console.log(player, "rolled", diceNumber, "— movables:", movable.length);
  // (Optional) highlight movable tokens here
});

// ------------- board click (token move) -------------
board.addEventListener("click", (e) => {
  const el = e.target;
  if (!el.classList.contains("token")) return;

  const player = players[currentIndex];
  if (!el.classList.contains(`token-${player}`)) return; // not this player's token
  if (diceNumber === null) return; // nothing to move with

  // ensure clicked token is actually movable for this roll
  const movables = getMovableTokens(player, diceNumber);
  if (!movables.includes(el)) {
    console.log("That token cannot move with the current roll.");
    return;
  }

  // perform the move
  handleTokenMove(el);
});

// ------------- helpers -------------
function updateCurrentPlayerUI() {
  currentPlayerElement.innerText = players[currentIndex].toUpperCase();
}

function getMovableTokens(player, roll) {
  const tokens = Array.from(document.querySelectorAll(`.token-${player}`));
  return tokens.filter(token => {
    if (token.classList.contains("open")) {
      const idx = getCurrentSquareIndex(token);
      if (idx === -1) return false; // can't determine position -> not movable
      // simple move-available check (wrap-around allowed here)
      const destIdx = (idx + roll) % 52;
      return Boolean(moveSquares[destIdx]);
    } else {
      // closed token: only movable (openable) on a 6
      return roll === 6;
    }
  });
}

function getCurrentSquareIndex(token) {
  const parent = token.parentElement;
  // fast check: is parent one of moveSquares?
  let idx = moveSquares.indexOf(parent);
  if (idx !== -1) return idx;

  // fallback: check dataset.sqNum on parent (if present)
  if (parent && parent.dataset && parent.dataset.sqNum !== undefined) {
    const ds = Number(parent.dataset.sqNum);
    if (!Number.isNaN(ds)) {
      const found = moveSquares.find(sq => Number(sq.dataset.sqNum) === ds);
      if (found) return moveSquares.indexOf(found);
    }
  }

  // couldn't find index
  return -1;
}

function handleTokenMove(token) {
  const player = players[currentIndex];
  const roll = diceNumber; // snapshot

  if (token.classList.contains("open")) {
    const currentIdx = getCurrentSquareIndex(token);
    if (currentIdx === -1) {
      console.warn("Can't determine token's current square. Aborting move.");
      return;
    }
    const destIdx = (currentIdx + roll) % 52;
    const nextSquare = moveSquares[destIdx];
    if (!nextSquare) {
      console.warn("Destination square not found for index", destIdx);
      return;
    }
    nextSquare.appendChild(token);
    console.log(player, "moved token from", currentIdx, "to", destIdx, "with roll", roll);
  } else {
    // closed token -> only open on 6
    if (roll !== 6) {
      console.log("Need a 6 to open this token.");
      return;
    }
    const startSquare = document.querySelector(`.${player}-stop`);
    if (!startSquare) {
      console.warn("Start square not found for", player);
      return;
    }
    startSquare.appendChild(token);
    token.classList.add("open");
    console.log(player, "opened a token onto start square");
  }

  // move done — clear roll and decide who plays next
  const rolledSix = roll === 6;
  diceNumber = null;

  if (rolledSix) {
    // CORRECT BEHAVIOUR: player keeps the turn after a successful move on a 6
    diceRollable = true; // allow them to roll again
    console.log(player, "rolled a 6 and keeps the turn.");
  } else {
    // non-6 -> pass turn
    advanceTurn();
  }
}

function advanceTurn() {
  currentIndex = (currentIndex + 1) % 4;
  updateCurrentPlayerUI();
  diceNumber = null;
  diceRollable = true;
  console.log("Turn passed. Current player:", players[currentIndex]);
}
