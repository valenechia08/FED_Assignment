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
  child,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

/* ================================
   Firebase configuration
   (REPLACE with your own config) DONE
================================ */
const firebaseConfig = {
  apiKey: "AIzaSyCoYoGP4NYJPHqA-kV_swajQ4LSQYdyWV4",
  authDomain: "grp3fedapp.firebaseapp.com",
  databaseURL:
    "https://grp3fedapp-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "grp3fedapp",
  storageBucket: "grp3fedapp.firebasestorage.app",
  messagingSenderId: "791146838729",
  appId: "1:791146838729:web:446baee191feeb036e2b18",
};

/* ================================
   Initialize Firebase
================================ */
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* =========================
   HELPERS
========================= */
function $(id) {
  return document.getElementById(id);
}

function showMessage(text, color = "red") {
  const msg = $("message");
  if (!msg) return;
  msg.style.color = color;
  msg.textContent = text;
}

function normalizeUsername(u) {
  return (u ?? "").trim().toLowerCase();
}

function isValidUsername(u) {
  // Avoid characters that can cause key issues. Keep it simple.
  // Allowed: letters, numbers, dot, underscore
  return /^[a-z0-9._]+$/.test(u);
}

async function sha256(text) {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function clearIfExists(ids) {
  ids.forEach((id) => {
    const el = $(id);
    if (el) el.value = "";
  });
}

/* =========================
   REGISTRATION
========================= */
async function registerMember() {
  const name = ($("name")?.value ?? "").trim();
  const username = normalizeUsername($("username")?.value ?? "");
  const email = ($("email")?.value ?? "").trim();
  const password = $("password")?.value ?? "";
  const confirmPassword = $("confirmPassword")?.value ?? "";

  // Basic checks
  if (!name || !username || !email || !password || !confirmPassword) {
    showMessage("Please fill in all fields.", "red");
    return;
  }

  if (!isValidUsername(username)) {
    showMessage(
      "Username can only contain letters, numbers, dot (.) and underscore (_).",
      "red",
    );
    return;
  }

  if (password.length < 6) {
    showMessage("Password must be at least 6 characters.", "red");
    return;
  }

  if (password !== confirmPassword) {
    showMessage("Passwords do not match.", "red");
    return;
  }

  try {
    const memberRef = ref(db, `members/${username}`);

    // Ensure username is unique
    const snap = await get(memberRef);
    if (snap.exists()) {
      showMessage("Username already taken. Please choose another.", "red");
      return;
    }

    // Store password hash (not plaintext)
    const passwordHash = await sha256(password);

    await set(memberRef, {
      name,
      username,
      email,
      passwordHash,
      createdAt: Date.now(),
    });

    showMessage("Registration successful! ✅", "green");
    clearIfExists(["name", "username", "email", "password", "confirmPassword"]);
  } catch (err) {
    console.error(err);
    showMessage(
      `Registration failed: ${err?.message ?? "Unknown error"}`,
      "red",
    );
  }
}

/* =========================
   LOGIN
========================= */
async function loginMember() {
  const username = normalizeUsername($("username")?.value ?? "");
  const password = $("password")?.value ?? "";
  if (!username || !password) {
    showMessage("Please enter username and password.", "red");
    return;
  }

  if (!isValidUsername(username)) {
    showMessage("Invalid username format.", "red");
    return;
  }

  try {
    const memberRef = ref(db, `members/${username}`);
    const snap = await get(memberRef);

    if (!snap.exists()) {
      showMessage("User not found.", "red");
      return;
    }

    const data = snap.val();
    const inputHash = await sha256(password);

    if (inputHash !== data.passwordHash) {
      showMessage("Incorrect password.", "red");
      return;
    }

    // Save session + redirect
    sessionStorage.setItem("loggedInUser", username);
    showMessage("Login successful! 🎉", "green");
    window.location.href = "PerformanceDashboard.html";
  } catch (err) {
    console.error(err);
    showMessage(`Login failed: ${err?.message ?? "Unknown error"}`, "red");
  }
}

async function retrieveAccount() {
  const username = normalizeUsername($("username")?.value ?? "");
  const continueButton = $("continueBtn");

  if (!username) {
    showMessage("Please enter your username.");
    return;
  } else {
    const memberRef = ref(db, `members/${username}`);

    const snap = await get(memberRef);
    if (snap.exists()) {
      sessionStorage.setItem("currentUser", username);
      window.location.href = "ConfirmAccount.html";
      return;
    }
  }
}

/* =========================
   AUTO-BIND EVENTS (based on page)
========================= */
document.addEventListener("DOMContentLoaded", () => {
  // Register page
  if ($("registerBtn")) {
    $("registerBtn").addEventListener("click", registerMember);
  }

  // Login page
  if ($("loginBtn")) {
    $("loginBtn").addEventListener("click", loginMember);
  }

  // Reset Password
  if ($("continueBtn")) {
    $("continueBtn").addEventListener("click", retrieveAccount);
  }

  // Optional: allow Enter key to submit on login page
  if ($("loginBtn") && $("password")) {
    $("password").addEventListener("keydown", (e) => {
      if (e.key === "Enter") loginMember();
    });
  }

  // Optional: allow Enter key to submit on register page
  if ($("registerBtn")) {
    $("registerBtn").addEventListener("keydown", (e) => {
      if (e.key === "Enter") registerMember();
    });
  }

  //
  if ($("continueBtn")) {
    $("continueBtn").addEventListener("keydown", (e) => {
      if (e.key === "Enter") retrieveAccount();
    });
  }
});

//LOGOUT & Login
// Check login
document.addEventListener("DOMContentLoaded", () => {
  const username = sessionStorage.getItem("loggedInUser");

  // if (!username || !password) {
  //   document.querySelector(".message").textContent="Please enter both username and password.";
  // } else {
  // if (username) {
  //   document.querySelector(".usernameDisplay").textContent = `${username}`; //Displays username under profile
  // }
  // }

  // Logout
  document.querySelector(".logout").addEventListener("click", () => {
    sessionStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
  });
});

//Top Navigation 
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', e => {
      const dropdown = item.querySelector('.dropdown');
      if (dropdown) {
        e.preventDefault();
        dropdown.style.display =
          dropdown.style.display === 'block' ? 'none' : 'block';
      }
    });
  });


/*Mobile Navigation*/
document.querySelectorAll(".mobile-nav-item").forEach((item) => {
  item.addEventListener("click", () => {
    const target = item.getAttribute("data-link");
    if (target) {
      window.location.href = target;
    }
  });
});

/*Search Bar to search up stalls*/
const searchInput = document.querySelector(".search-input");
const stallCards = document.querySelectorAll(".stall-card");

// Listen for typing
searchInput.addEventListener("keyup", function () {
  const query = this.value.toLowerCase();

  stallCards.forEach((card) => {
    const name = card.querySelector("h4").textContent.toLowerCase();
    const info = card.querySelector("p").textContent.toLowerCase();

    // Show if query matches name or info
    if (name.includes(query) || info.includes(query)) {
      card.style.display = "";
    } else {
      card.style.display = "none";
    }
  });
});

// Grab all cuisine cards
const cuisines = document.querySelectorAll(".cuisine");

// Grab all stall cards
const stalls = document.querySelectorAll(".stall-card");

cuisines.forEach((cuisine) => {
  cuisine.addEventListener("click", () => {
    // check if this cuisine is already selected
    const isSelected = cuisine.classList.contains("selected");

    // remove 'selected' from all cuisines
    cuisines.forEach((c) => c.classList.remove("selected"));

    if (isSelected) {
      // if clicked again, deselect and show all stalls
      stalls.forEach((stall) => {
        stall.style.display = "flex";
      });
    } else {
      // otherwise, select this cuisine
      cuisine.classList.add("selected");

      // get the cuisine class (e.g. "malay", "chinese", "indian", "other")
      let chosenCuisine = cuisine.querySelector("span").classList[0];
      console.log("Chosen cuisine:", chosenCuisine);

      // filter stalls based on class
      stalls.forEach((stall) => {
        if (stall.classList.contains(chosenCuisine)) {
          stall.style.display = "flex"; // show matching stalls
        } else {
          stall.style.display = "none"; // hide non-matching stalls
        }
      });
    }
  });
});
