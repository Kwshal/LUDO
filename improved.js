function mobility(e, currentPlayerStop, diceNumber) {
     if ((!e.target.classList.contains("open")) && diceNumber === 6) {
          e.target.classList.add('open');
          currentPlayerStop.appendChild(e.target);
     } else if (e.target.classList.contains("open")) {
          let currentSquareNumber = e.target.parentElement.getAttribute('value');
          let nextSquare = document.querySelector(`.move-square[value="${Number(currentSquareNumber) + diceNumber}"]`);
          if (nextSquare) {
               nextSquare.appendChild(e.target);
          }
     } else return;

     movePlayed = true;
}
