/* ================================
   1. Import Firebase modules
================================ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,   
  push,
  set,
  get,
  update,
  remove,
  child,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
// import { onValue } from "firebase-database";

// import {
//   getDatabase,
//   ref,
//   onValue,
// } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
// import { Chart } from "https://cdn.jsdelivr.net/npm/chart.js"; valene original code

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
// const db = getFire(app); valene original code

const rootRef = ref(db, "/");

// ✅ Real-time listen to ALL data
onValue(ref(db, "/"), (snapshot) => {
  console.log("REAL-TIME DATA:", snapshot.val());
});

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
  const role = sessionStorage.getItem("currentRole");
  const rule = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{9,}$/;

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

  if (!rule.test(password)) {
    showMessage("Must be 9+ chars with letters & numbers only", "red");
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
      role,
      username,
      email,
      passwordHash,
      userType: "registered",   //  ADD THIS✅  valene add this
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
    const role = data.role;
    const inputHash = await sha256(password);

    if (inputHash !== data.passwordHash) {
      showMessage("Incorrect password.", "red");
      return;
    }
    
    // ✅ update both browser + firebase
    sessionStorage.setItem("currentUserId", username);

    await update(ref(db, `members/${username}`), {
      userType: data.userType || "registered",
      lastLoginAt: Date.now()
    });

    // Save session + redirect
    sessionStorage.setItem("loggedInUser", username);
    showMessage("Login successful! 🎉", "green");
    if (role === "patron") {
      //sessionStorage.clear("currentRole");
      window.location.href = "FED_ASG.html";
    } else if (role === "vendor") {
      //sessionStorage.clear("currentRole");
      window.location.href = "PerformanceDashboard.html";
    } else {
      //sessionStorage.clear("currentRole");
      window.location.href = "R&C inspection log all.html";
    }
  } catch (err) {
    console.error(err);
    showMessage(`Login failed: ${err?.message ?? "Unknown error"}`, "red");
  }
}

async function retrieveAccount() {
  const username = normalizeUsername($("username")?.value ?? "");

  if (!username) {
    showMessage("Please enter a username", "red");
    return;
  }

  const snapshot = await get(ref(db, `members/${username}`));

  if (!snapshot.exists()) {
    showMessage("Account not found", "red");
    return;
  }
  sessionStorage.setItem("currentUser", username);
  window.location.href = "ConfirmAccount.html";
}
function generateCode() {
  let generatedCode = Math.floor(100000 + Math.random() * 900000).toString();

  // Fake alert (what you asked for)
  alert(`Your verification code is: ${generatedCode}`);
  return generatedCode;
}
document.addEventListener("DOMContentLoaded", () => {
  if (
    window.location.pathname.endsWith("login.html") &&
    sessionStorage.getItem("currentRole") === "patron"
  ) {
    let guestDiv = $("guestLogin");
    guestDiv.style.display = "block";
    guestDiv.innerHTML = `<a href="FED_ASG.html">Continue as guest</a>`;
  } else if (
    window.location.pathname.endsWith("login.html") &&
    sessionStorage.getItem("currentRole") === "officer"
  ) {
    let register = $("register-account");
    let links = $("links");
    register.style.display = "none";
    links.classList.add("nea-alignment");
  }
});
document.addEventListener("DOMContentLoaded", () => {
  let finalCode = null;
  if (window.location.pathname.endsWith("ConfirmAccount.html")) {
    // Generate code on page load
    finalCode = generateCode();
  }
  document.querySelector(".secondBackBtn").addEventListener("click", () => {
    window.location.href = "FindAccount.html";
  });

  // Resend button
  document.getElementById("resendBtn").addEventListener("click", () => {
    finalCode = generateCode();
  });

  // Verify OTP
  document.getElementById("primaryBtn").addEventListener("click", () => {
    const userCode = document.getElementById("code").value.trim();

    if (!userCode) {
      showMessage("Please enter the code.", "red");
      return;
    }

    if (userCode === finalCode) {
      showMessage("Verification successful!", "green");
      window.location.href = "ChangePassword.html";
    } else {
      showMessage("Invalid code. Try again.", "red");
    }
  });
});

//Change Password
async function resetPassword() {
  const username = sessionStorage.getItem("currentUser");
  const password = $("newPassword")?.value ?? "";
  const confirmPassword = $("confirmPassword2")?.value ?? "";

  const rule = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{9,}$/;
  if (!password) {
    showMessage("Please enter a password", "red");
    return;
  }
  if (!rule.test(password)) {
    showMessage("Must be 9+ chars with letters & numbers only", "red");
    return;
  }
  if (password !== confirmPassword) {
    showMessage("Passwords do not match.", "red");
    return;
  }
  try {
    const passwordHash = await sha256(password);

    await update(ref(db, `members/${username}`), {
      passwordHash: passwordHash,
      passwordUpdatedAt: Date.now(),
    });

    showMessage("Password updated successfully — you can now log in", "green");
    sessionStorage.removeItem("currentUser");
  } catch (err) {
    showMessage(`Login failed: ${err?.message ?? "Unknown error"}`, "red");
  }
}

//Select Role
function goLogin(role) {
  console.log(role);
  sessionStorage.setItem("currentRole", role);
  window.location.href = "login.html";
}
/* =========================
   AUTO-BIND EVENTS (based on page)
========================= */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".backBtn").addEventListener("click", () => {
    window.location.href = "SelectRole.html";
  });
});
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".roleBtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      goLogin(btn.dataset.role);
    });
  });

  // Register page
  if ($("registerBtn")) {
    $("registerBtn").addEventListener("click", registerMember);
  }

  // Login page
  if ($("loginBtn")) {
    $("loginBtn").addEventListener("click", loginMember);
  }

  // Find account page
  if ($("continueBtn")) {
    $("continueBtn").addEventListener("click", retrieveAccount);
  }
  //Reset password page
  if ($("resetPasswordBtn")) {
    $("resetPasswordBtn").addEventListener("click", resetPassword);
  }

  document.querySelector(".thirdBackBtn").addEventListener("click", () => {
    window.location.href = "login.html";
  });

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
// document.addEventListener("DOMContentLoaded", () => {
//   const username = sessionStorage.getItem("loggedInUser");

// if (!username || !password) {
//   document.querySelector(".message").textContent="Please enter both username and password.";
// } else {
//   if (username) {
//     document.querySelector(".usernameDisplay").textContent = `${username}`; //Displays username under profile
//   }
//   // }

//   // Logout
//   document.querySelector(".logout").addEventListener("click", () => {
//     sessionStorage.removeItem("loggedInUser");
//     window.location.href = "login.html";
//   });
// });



// Top Navigation
document.addEventListener("click", () => {
        document
          .querySelectorAll(".menu-item")
          .forEach((item) => item.classList.remove("active"));
      });


//Create Stall Object & Menu Item
function createStallObject(stall_name, cuisine, rating, image) {
  return {
    [stall_name]: {
      cuisine,
      rating,
      image,
      menuItems: {},
    },
  };
}

function createMenuItemObject(item_name, price, available = true,image) {
  return {
    [item_name]: {
      price,
      available,
      image,
    },
  };
}


async function uploadStall(stall_name, cuisine, rating, image) {
  const stallObj = createStallObject(stall_name, cuisine, rating, image);
  await update(ref(db, "stalls"), stallObj);
}

async function addMenuItem(stall_name, item_name, price, available = true,image) {
  const itemObj = createMenuItemObject(item_name, price, available,image);
  await update(ref(db, `stalls/${stall_name}/menuItems`), itemObj);
}

// createStallObject("Banana Leaf Nasi Lemak", "Malay", 4.0, "images/Banana Leaf Nasi Lemak Picture.jpg");

(async () => {
  await uploadStall(
    "Banana Leaf Nasi Lemak",
    "Malay",
    4.0,
    "images/Banana Leaf Nasi Lemak Picture.jpg",
  );
  await addMenuItem(
    "Banana Leaf Nasi Lemak",
    "5 pcs Spicy Fish Otah",
    7.5,
    true,
    "images/Otah Picture.webp",
  );
  await addMenuItem(
    "Banana Leaf Nasi Lemak",
    "1 Pcs Spicy Fish Otah",
    1.5,
    true,
    "images/Otah Picture.webp",
  );

  await addMenuItem(
    "Banana Leaf Nasi Lemak",
    "Set Meal A",
    5,
    true,
    "images/Set Meal A Picture.jpg",
  );

  await addMenuItem(
    "Banana Leaf Nasi Lemak",
    "Set Meal B",
    4,
    true,
    "images/Set Meal B Picture.jpg",
  );
  await addMenuItem(
    "Banana Leaf Nasi Lemak",
    "Set Meal C",
    4,
    true,
    "images/Set Meal C Picture.jpg",
  );
  await addMenuItem(
    "Banana Leaf Nasi Lemak",
    "Set Meal D",
    3.5,
    true,
    "images/Set Meal D Picture.jpg",
  );


  await uploadStall(
    "Boon Lay Lu Wei",
    "Chinese",
    4.2,
    "images/Boon Lay Lu Wei Picture.jpg",
  );
  await uploadStall(
    "IMohamed Ismail Food Stall",
    "Indian",
    4.5,
    "images/I.Mohamed Ismail Food Stall Picture.jpg",
  );
  await uploadStall(
    "Boon Lay Fried Carrot Cake & Kway Teow Mee",
    "Chinese",
    4.2,
    "images/Boon Lay Fried Carrot Cake & Kway Teow Mee Picture.jpg",
  );
  await uploadStall(
    "Big Daddy’s Chicken & Noodle Stall",
    "Others",
    4.5,
    "images/Big Daddy's Chicken & Noodle Picture.webp",
  );
})();

async function loadMenu(stall_name) {
  const snap = await get(ref(db, `stalls/${stall_name}/menuItems`));

  if (!snap.exists()) {
    console.log("No menu items");
    document.querySelector("#menuRoot").innerHTML = "<p>No menu items.</p>";
    return;
  }

  const menuItems = snap.val();
  renderMenu(menuItems, stall_name);
}

function renderMenu(menuItems, stall_name) {
  const root = document.querySelector("#menuRoot");
  root.innerHTML = ""; // clear old

  // Optional heading
  const heading = document.createElement("h2");
  heading.textContent = "Menu";
  heading.style.margin = "10px 0 16px";
  root.appendChild(heading);

  // grid container
  const grid = document.createElement("div");
  grid.className = "menu-grid"; // style in CSS if you want
  root.appendChild(grid);

  for (const item_name in menuItems) {
    const item = menuItems[item_name];

    const card = document.createElement("div");
    card.className = "menu-card";

    const title = document.createElement("div");
    title.className = "menu-title";
    title.textContent = item_name;

    const price = document.createElement("div");
    price.className = "menu-price";
    price.textContent = `$${Number(item.price).toFixed(2)}`;

    const actions = document.createElement("div");
    actions.className = "menu-actions";

    const plusBtn = document.createElement("button");
    plusBtn.className = "plus-btn";
    plusBtn.type = "button";
    plusBtn.textContent = "+";

    // disable if unavailable
    if (item.available === false) {
      plusBtn.disabled = true;
      plusBtn.textContent = "—";
      card.classList.add("unavailable");
    } else {
      plusBtn.addEventListener("click", () => {
        addToCart(stall_name, item_name, item.price);
      });
    }

    actions.appendChild(plusBtn);

    card.appendChild(title);
    card.appendChild(price);
    card.appendChild(actions);

    grid.appendChild(card);
  }
}
loadMenu("Banana Leaf Nasi Lemak");

async function renderStalls() {
  const grid = document.querySelector("#stall-grid");
  grid.innerHTML = "";

  const snap = await get(ref(db, "stalls"));

  if (!snap.exists()) {
    grid.textContent = "No stalls found.";
    return;
  }

  const stalls = snap.val();

  for (const stall_name in stalls) {
    const stall = stalls[stall_name];

    const card = document.createElement("div");
    card.className = `stall-card ${stall.cuisine.toLowerCase()}`;

    const img = document.createElement("img");
    img.src = stall.image;

    const info = document.createElement("div");
    info.className = "stall-info";

    const title = document.createElement("h4");
    title.textContent = `${stall_name}`;
    const meta = document.createElement("p");
    meta.textContent = `⭐ ${stall.rating} · ${stall.cuisine}`;

    info.appendChild(title);
    info.appendChild(meta);

    card.appendChild(img);
    card.appendChild(info);

    // click handler (optional)
    card.onclick = () => {
      console.log("Selected stall:", stall_name);
      // loadMenu(stall_name);
    };

    grid.appendChild(card);
  }
}

renderStalls();

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
if (searchInput) {
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
}

// Fetch all stalls from Firebase
async function fetchStalls() {
  const snap = await get(ref(db, "stalls"));
  if (!snap.exists()) return;

  allStalls = snap.val(); // save globally
  renderStalls(allStalls); // initial render
}
document.addEventListener("DOMContentLoaded", async () => {
  await fetchStalls(); // fetch and render stalls first

  const filterDivs = document.querySelectorAll(".filter-btn");

  filterDivs.forEach((div) => {
    div.addEventListener("click", () => {
      console.log("hi");
      const cuisine = div.getAttribute("data-cuisine").trim().toLowerCase();

      // Toggle behavior
      if (selectedCuisine === cuisine) {
        selectedCuisine = null;
        renderStalls(allStalls);
        filterDivs.forEach((d) => d.classList.remove("active"));
      } else {
        selectedCuisine = cuisine;
        filterDivs.forEach((d) => d.classList.remove("active"));
        div.classList.add("active");

        const filtered = Object.fromEntries(
          Object.entries(allStalls).filter(
            ([_, stall]) => stall.cuisine.trim().toLowerCase() === cuisine,
          ),
        );

        renderStalls(filtered);
      }
    });
  });
});

exports.placeOrder = functions.https.onRequest(async (req, res) => {
  const { username, stall, items } = req.body;

  // Validate
  if (!username || !stall || !items) {
    return res.status(400).json({ error: "Invalid data" });
  }

  // Calculate total on SERVER
  let total = 0;
  for (const item of items) {
    total += item.price * item.qty;
  }

  await admin.database().ref("orders").push({
    username,
    stall,
    items,
    total,
    createdAt: Date.now()
  });

  res.json({ success: true, total });
});
