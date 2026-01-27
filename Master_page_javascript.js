/* ================================
   1. Import Firebase modules
================================ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getDatabase,
    ref,
    push,
    set,
    get,
    update,
    remove,
    child
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

/* ================================
   Firebase configuration
   (REPLACE with your own config) DONE
================================ */
const firebaseConfig = {
    apiKey: "AIzaSyCoYoGP4NYJPHqA-kV_swajQ4LSQYdyWV4",
    authDomain: "grp3fedapp.firebaseapp.com",
    databaseURL: "https://grp3fedapp-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "grp3fedapp",
    storageBucket: "grp3fedapp.firebasestorage.app",
    messagingSenderId: "791146838729",
    appId: "1:791146838729:web:446baee191feeb036e2b18"
  };

/* ================================
   Initialize Firebase
================================ */
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);


//Navigation Dropdown
document.querySelectorAll('.toggle').forEach(mainItem => {
        mainItem.addEventListener('click', () => {
          const submenu = mainItem.nextElementSibling;
          const arrow = mainItem.querySelector('.arrow');

          if (submenu.style.display === 'block') {
            submenu.style.display = 'none';
            arrow.textContent = 'v';
          } else {
            submenu.style.display = 'block';
            arrow.textContent = '^';
          }
        });
      });


// Grab all cuisine cards
const cuisines = document.querySelectorAll(".cuisine");

// Grab all stall cards
const stalls = document.querySelectorAll(".stall-card");

cuisines.forEach(cuisine => {
  cuisine.addEventListener("click", () => {
    // check if this cuisine is already selected
    const isSelected = cuisine.classList.contains("selected");

    // remove 'selected' from all cuisines
    cuisines.forEach(c => c.classList.remove("selected"));

    if (isSelected) {
      // if clicked again, deselect and show all stalls
      stalls.forEach(stall => {
        stall.style.display = "flex";
      });
    } else {
      // otherwise, select this cuisine
      cuisine.classList.add("selected");

      // get the cuisine class (e.g. "malay", "chinese", "indian", "other")
      let chosenCuisine = cuisine.querySelector("span").classList[0];
      console.log("Chosen cuisine:", chosenCuisine);

      // filter stalls based on class
      stalls.forEach(stall => {
        if (stall.classList.contains(chosenCuisine)) {
          stall.style.display = "flex";   // show matching stalls
        } else {
          stall.style.display = "none";    // hide non-matching stalls
        }
      });
    }
  });
});
