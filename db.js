// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getDatabase, set, ref, onValue } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";
import { dice, currentPlayerElement, diceNumber, updatePlayers, currentPlayer, moveToken, captureToken, colorToken } from "./script.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
     apiKey: "AIzaSyBevUfLUcb9k1oevYg4AflFWcJkE78QzKw",
     authDomain: "ludo-38.firebaseapp.com",
     projectId: "ludo-38",
     databaseURL: "https://ludo-38-default-rtdb.asia-southeast1.firebasedatabase.app",
     storageBucket: "ludo-38.firebasestorage.app",
     messagingSenderId: "327259101653",
     appId: "1:327259101653:web:f930ddc5634da47cec855c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize realtime database and get a reference to the service
const db = getDatabase(app);

let diceNumberRef = ref(db, "diceNumber");
let currentPlayerRef = ref(db, "currentPlayer");
let movingTokenRef = ref(db, "token");
let capturedTokenRef = ref(db, "capturedToken");
let coloringTokenRef = ref(db, "coloringToken");
let xRef = ref(db, "x");

onValue(diceNumberRef, (snapshot) => {
     let diceNumber = snapshot.val();
     
     dice.innerText = diceNumber || "#";
});
onValue(xRef, (snapshot) => {
     let data = snapshot.val()
     let x = data;
     x && updatePlayers(+x)
})
onValue(currentPlayerRef, (snapshot) => {
     let currentPlayer = snapshot.val();
     currentPlayerElement.innerHTML = currentPlayer || "BLUE<span id='turn'>'s Turn</span>";
});
onValue(movingTokenRef, (snapshot) => {
     let data = snapshot.val();
     let token = document.getElementById(data);
     token && moveToken(token);
});
onValue(capturedTokenRef, (snapshot) => {
     let data = snapshot.val();
     let token = document.getElementById(data);
     token && captureToken(token);
});
onValue(coloringTokenRef, (snapshot) => {
     let data = snapshot.val();
     let token = document.getElementById(data);
     token && colorToken(token);
});

export {diceNumberRef, currentPlayerRef, movingTokenRef, capturedTokenRef, coloringTokenRef, set};