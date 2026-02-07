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

//null check
function bind(selector, event, handler) {
  const el = document.querySelector(selector);
  if (el) el.addEventListener(event, handler);
}

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
      userType: "registered", //  ADD THIS✅  valene add this
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
      lastLoginAt: Date.now(),
    });

    // Save session + redirect
    localStorage.setItem("loggedInUser", username);
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
      window.location.href = "Regulatory&Complianceinfo.html";
    }
  } catch (err) {
    console.error(err);
    showMessage(`Login failed: ${err?.message ?? "Unknown error"}`, "red");
  }
}
window.getCurrentUsername = function () {
  return (
    localStorage.getItem("loggedInUser") ||
    sessionStorage.getItem("loggedInUser") ||
    ""
  ).trim();
};

  document.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      document.getElementById("loginBtn").click();
    }
  });
  
// =========================
// SHOW USERNAME IN GREETING
// =========================
document.addEventListener("DOMContentLoaded", () => {
  const usernameEl = document.getElementById("usernameDisplay");
  if (!usernameEl) return; // not on this page

  const username = sessionStorage.getItem("loggedInUser");

  if (username) {
    usernameEl.textContent = username;
  } else {
    usernameEl.textContent = "Guest";
  }
});

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

// Verify OTP
document.addEventListener("DOMContentLoaded", () => {
  // Only run OTP logic on ConfirmAccount page
  if (!window.location.pathname.endsWith("ConfirmAccount.html")) return;

  let finalCode = generateCode(); // generate on load

  bind(".secondBackBtn", "click", () => {
    window.location.href = "FindAccount.html";
  });

  bind("#resendBtn", "click", () => {
    finalCode = generateCode();
  });

  bind("#primaryBtn", "click", () => {
    const userCode = document.getElementById("code")?.value.trim();

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

// document.addEventListener("DOMContentLoaded", () => {
//   document.querySelector(".backBtn").addEventListener("click", () => {
//     window.location.href = "SelectRole.html";
//   });
// });
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".roleBtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      goLogin(btn.dataset.role);
    });
  });
});
document.addEventListener("DOMContentLoaded", () => {
  bind(".backBtn", "click", () => {
    window.location.href = "SelectRole.html";
  });

  bind(".secondBackBtn", "click", () => {
    window.location.href = "FindAccount.html";
  });

  bind(".thirdBackBtn", "click", () => {
    window.location.href = "login.html";
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
//   localStorage.removeItem("loggedInUser");
//     sessionStorage.removeItem("loggedInUser");
//     window.location.href = "login.html";
//   });
// });
//Makes sure all tabs where user is logged in, gets logout!
//window.addEventListener("storage", (e) => {
//   if (e.key === "loggedInUser" && !e.newValue) {
//     // logged out in another tab
//     window.location.href = "login.html";
//   }
// });

//loading stalls(bananaleafhtml)
// async function loadStallHeader(stallName) {
//   const snap = await get(ref(db, `stalls/${stallName}`));
//   if (!snap.exists()) return;

//   const stall = snap.val();

//   document.getElementById("stallName").textContent = stallName;
//   document.getElementById("stallRating").textContent = stall.rating;
//   document.getElementById("stallCuisine").textContent = stall.cuisine;
//   document.getElementById("stallImg").src = stall.image;
// }
// document.addEventListener("DOMContentLoaded", () => {
//   if (document.getElementById("stallImg")) {
//     loadStallHeader("Banana Leaf Nasi Lemak");
//   }
// });
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

function createMenuItemObject(item_name, price, available = true, image) {
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

async function addMenuItem(
  stall_name,
  item_name,
  price,
  available = true,
  image,
) {
  const itemObj = createMenuItemObject(item_name, price, available, image);
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
    "images/Set Meal C Picture.png",
  );
  await addMenuItem(
    "Banana Leaf Nasi Lemak",
    "Set Meal D",
    3.5,
    true,
    "images/Set Meal D Picture.jpg",
  );
  await uploadStall(
    "Boon Lay Fried Carrot Cake & Kway Teow Mee",
    "Chinese",
    4.2,
    "images/Boon Lay Fried Carrot Cake & Kway Teow Mee Picture.jpg",
  );
  await addMenuItem(
    "Boon Lay Fried Carrot Cake & Kway Teow Mee",
    "Black Carrot Cake (Small)",
    3,
    true,
    "images/Black Carrot Cake Picture.jpg",
  );
  await addMenuItem(
    "Boon Lay Fried Carrot Cake & Kway Teow Mee",
    "Black Carrot Cake (Medium)",
    4,
    true,
    "images/Black Carrot Cake Picture.jpg",
  );
  await addMenuItem(
    "Boon Lay Fried Carrot Cake & Kway Teow Mee",
    "Black Carrot Cake (Large)",
    5,
    true,
    "images/Black Carrot Cake Picture.jpg",
  );
  await addMenuItem(
    "Boon Lay Fried Carrot Cake & Kway Teow Mee",
    "White Carrot Cake (Small)",
    3,
    true,
    "images/White Carrot Cake Picture.jpg",
  );
  await addMenuItem(
    "Boon Lay Fried Carrot Cake & Kway Teow Mee",
    "White Carrot Cake (Medium)",
    4,
    true,
    "images/White Carrot Cake Picture.jpg",
  );
  await addMenuItem(
    "Boon Lay Fried Carrot Cake & Kway Teow Mee",
    "White Carrot Cake (Large)",
    5,
    true,
    "images/White Carrot Cake Picture.jpg",
  );
  await addMenuItem(
    "Boon Lay Fried Carrot Cake & Kway Teow Mee",
    "Char Kway Teow",
    4.5,
    true,
    "images/Char Kway Teow Picture.webp",
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
    "Big Daddy’s Chicken & Noodle Stall",
    "Others",
    4.5,
    "images/Big Daddy's Chicken & Noodle Picture.webp",
  );
})();
async function loadStallInfo(stallName) {
  const snap = await get(ref(db, `stalls/${stallName}`));

  if (!snap.exists()) {
    console.error("Stall not found:", stallName);
    return;
  }

  const stall = snap.val();

  const img = document.getElementById("stallImg");
  const name = document.getElementById("stallName");
  const rating = document.getElementById("stallRating");
  const cuisine = document.getElementById("stallCuisine");

  if (img) img.src = stall.image;
  if (name) name.textContent = stallName;
  if (rating) rating.textContent = stall.rating;
  if (cuisine) cuisine.textContent = stall.cuisine;
}

//Update cart number
function getCartCount() {
  return getCart().reduce((sum, x) => sum + (x.qty || 1), 0); // ✅ count items incl qty
}

function updateCartUI() {
  const el = document.getElementById("cartCount");
  if (!el) return;
  el.textContent = String(getCartCount());
}

// =========================
// CART (simple test version)
// =========================
function addToCart(stall_name, item_name, price, image = "") {
  const cart = JSON.parse(sessionStorage.getItem("cart") || "[]");

  const existing = cart.find(
    (x) =>
      x.stall === stall_name &&
      x.item === item_name &&
      Number(x.price) === Number(price),
  );

  if (existing) {
    existing.qty = (existing.qty || 0) + 1;
    if (!existing.image && image) existing.image = image;
  } else {
    cart.push({
      stall: stall_name,
      item: item_name,
      price: Number(price),
      qty: 1,
      image,
      addedAt: Date.now(),
    });
  }

  sessionStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();
}
function removeFromCart(stall_name, item_name, price) {
  const cart = JSON.parse(sessionStorage.getItem("cart") || "[]");

  const idx = cart.findIndex(
    (x) =>
      x.stall === stall_name &&
      x.item === item_name &&
      Number(x.price) === Number(price),
  );

  if (idx === -1) return;

  cart[idx].qty = (cart[idx].qty || 0) - 1;

  if (cart[idx].qty <= 0) cart.splice(idx, 1);

  sessionStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();
}

function getItemQty(stall_name, item_name, price) {
  const cart = JSON.parse(sessionStorage.getItem("cart") || "[]");
  const row = cart.find(
    (x) =>
      x.stall === stall_name &&
      x.item === item_name &&
      Number(x.price) === Number(price),
  );
  return row ? row.qty || 0 : 0;
}

/* =========================
   RENDER MENU
========================= */
function renderMenu(menuItems, stall_name) {
  const root = document.querySelector("#menuRoot");
  root.innerHTML = "";

  const heading = document.createElement("h2");
  heading.textContent = "Menu";
  heading.style.margin = "10px 0 16px";
  root.appendChild(heading);

  const grid = document.createElement("div");
  grid.className = "menu-grid";
  root.appendChild(grid);

  for (const item_name in menuItems) {
    const item = menuItems[item_name];

    const card = document.createElement("div");
    card.className = "menu-card";

    // (Optional) image if your item has it
    if (item.image) {
      const img = document.createElement("img");
      img.className = "menu-img";
      img.src = item.image;
      img.alt = item_name;
      card.appendChild(img);
    }

    const title = document.createElement("div");
    title.className = "menu-title";
    title.textContent = item_name;

    const price = document.createElement("div");
    price.className = "menu-price";
    price.textContent = `$${Number(item.price).toFixed(2)}`;

    const actions = document.createElement("div");
    actions.className = "menu-actions";

    // ===== HEART BUTTON (NEW) =====
    const heartBtn = document.createElement("button");
    heartBtn.className = "heart-btn";
    heartBtn.type = "button";
    heartBtn.setAttribute("aria-label", "Add to favourites");

    const heartIcon = document.createElement("span");
    heartIcon.className = "heart-icon";
    heartIcon.textContent = "♥"; // icon stays ♥, colour changes by class
    heartBtn.appendChild(heartIcon);

    // set initial state
    const favNow = isFavouriteItem(stall_name, item_name);
    if (favNow) heartBtn.classList.add("active");

    heartBtn.addEventListener("click", () => {
      const nowFav = toggleFavouriteItem({
        stallName: stall_name,
        itemName: item_name,
        price: item.price,
        image: item.image || "",
      });

      heartBtn.classList.toggle("active", nowFav);

      // optional: quick redirect to favourites page items section
      // comment this out if you don’t want auto-jump
      // window.location.href = "Favourites.html#items";
    });

    // ===== PLUS BUTTON (YOUR EXISTING) =====
    const plusBtn = document.createElement("button");
    plusBtn.className = "plus-btn";
    plusBtn.type = "button";
    plusBtn.textContent = "+";

    if (item.available === false) {
      plusBtn.disabled = true;
      plusBtn.textContent = "—";
      card.classList.add("unavailable");
    } else {
      plusBtn.addEventListener("click", () => {
        addToCart(stall_name, item_name, item.price);
      });
    }

    // Put heart left, plus right
    actions.appendChild(heartBtn);
    actions.appendChild(plusBtn);

    card.appendChild(title);
    card.appendChild(price);
    card.appendChild(actions);

    grid.appendChild(card);
  }
}


//load menu(one time) or listen menu(realtime) choose one

// /* =========================
//    LOAD MENU FROM FIREBASE
// ========================= */
// async function loadMenu(stall_name) {
//   const snap = await get(ref(db, `stalls/${stall_name}/menuItems`));

//   if (!snap.exists()) {
//     document.querySelector("#menuRoot").innerHTML =
//       "<p>No menu items.</p>";
//     return;
//   }

//   renderMenu(snap.val(), stall_name);
// }

// // Load default stall menu
// loadMenu("Banana Leaf Nasi Lemak");

//reading

let stopMenuListener = null;

function listenToMenu(stall_name) {
  if (stopMenuListener) stopMenuListener(); // stop old listener

  const menuRef = ref(db, `stalls/${stall_name}/menuItems`);
  stopMenuListener = onValue(menuRef, (snap) => {
    if (!snap.exists()) {
      document.querySelector("#menuRoot").innerHTML = "<p>No menu items.</p>";
      return;
    }
    renderMenu(snap.val(), stall_name);
  });
}

/* =========================
   RENDER STALLS
========================= */
function renderStalls(stalls) {
  const grid = document.querySelector("#stall-grid");
  if (!grid) return; // ✅ page doesn't have stall grid

  grid.innerHTML = "";

  if (!stalls) {
    grid.textContent = "No stalls found.";
    return;
  }

  for (const stall_name in stalls) {
    const stall = stalls[stall_name];

    const card = document.createElement("div");
    card.className = `stall-card ${stall.cuisine.toLowerCase()}`;

    const img = document.createElement("img");
    img.src = stall.image;

    const info = document.createElement("div");
    info.className = "stall-info";

    const title = document.createElement("h4");
    title.textContent = stall_name;

    const meta = document.createElement("p");
    meta.textContent = `⭐ ${stall.rating} · ${stall.cuisine}`;

    info.appendChild(title);
    info.appendChild(meta);

    card.appendChild(img);
    card.appendChild(info);

    // card.onclick = () => {
    //   if (stall_name === "Banana Leaf Nasi Lemak") {
    //     window.location.href = "BananaLeafNasiLemak.html";
    //   } else if (stall_name === "Boon Lay Fried Carrot Cake & Kway Teow Mee") {
    //     window.location.href = "BananaLeafNasiLemak.html";
    //   } else {
    //     listenToMenu(stall_name);
    //   }
    // };
    card.addEventListener("click", () => {
      const url = `FoodStalls.html?stall=${encodeURIComponent(stall_name)}`;
      window.location.href = url;
    });

    grid.appendChild(card);
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const stallName = params.get("stall");

  if (!stallName) {
    document.querySelector("#menuRoot").innerHTML = "<p>No stall selected.</p>";
    return;
  }

  // Optional: show stall name on the page somewhere
  const titleEl = document.getElementById("stallTitle");
  if (titleEl) titleEl.textContent = stallName;

  listenToMenu(stallName);
});

/* =========================
   FETCH STALLS (ONCE)
========================= */
let allStalls = {};

// async function fetchStalls() {
//   const snap = await get(ref(db, "stalls"));
//   if (!snap.exists()) return;

//   allStalls = snap.val();
//   renderStalls(allStalls);
// }

// fetchStalls();

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
    const stallCards = document.querySelectorAll(".stall-card");
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
let selectedCuisine = null;

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
/*
exports.placeOrder = functions.https.onRequest(async (req, res) => {
  const { username, stall, items } = req.body;

  Validate
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
  */
document.addEventListener("DOMContentLoaded", () => {
  updateCartUI();

  const menuRoot = document.querySelector("#menuRoot");
  if (!menuRoot) return; // not stall page

  const params = new URLSearchParams(window.location.search);
  const stallName = params.get("stall");

  if (!stallName) {
    menuRoot.innerHTML = "<p>No stall selected.</p>";
    return;
  }

  // ✅ load stall header info
  loadStallInfo(stallName);
});
const cartPill = document.getElementById("cartPill");
if (cartPill) {
  cartPill.addEventListener("click", () => {
    window.location.href = "OrderSummary.html";
  });
}

// example
// listenToMenu("Banana Leaf Nasi Lemak");
// listenToMenu("Boon Lay Fried Carrot Cake & Kway Teow Mee");

// Top Navigation - only close dropdowns when clicking OUTSIDE the nav
document.addEventListener("click", (e) => {
  const clickedInsideNav = e.target.closest(".navrectangle");
  if (clickedInsideNav) return; // don't close when clicking inside nav

  document.querySelectorAll(".menu-item").forEach((item) => {
    item.classList.remove("active");
  });
});

const hamburger = document.getElementById("hamburger");
const menu = document.getElementById("menu");
const overlay = document.getElementById("navOverlay");

function openNav() {
  menu.classList.add("show");
  overlay.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeNav() {
  menu.classList.remove("show");
  overlay.classList.remove("show");
  document.body.style.overflow = "";
}

hamburger.addEventListener("click", () => {
  menu.classList.contains("show") ? closeNav() : openNav();
});

overlay.addEventListener("click", closeNav);

/* optional: close menu when clicking any nav link (mobile) */
menu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    if (window.innerWidth <= 768) closeNav();
  });
});

/* =========================
   ORDER MODE (pickup/takeaway)
========================= */
function getOrderMode() {
  return sessionStorage.getItem("orderMode") || "pickup"; // default
}
function setOrderMode(mode) {
  sessionStorage.setItem("orderMode", mode);
}

/* =========================
   MONEY + CART STORAGE
========================= */
function money(n) {
  return `$${Number(n || 0).toFixed(2)}`;
}

function getCart() {
  return JSON.parse(sessionStorage.getItem("cart") || "[]");
}

function setCart(cart) {
  sessionStorage.setItem("cart", JSON.stringify(cart));
}

/* =========================
   TOTALS (includes packaging)
   takeaway = $0.30 per item
========================= */
function computeTotals(cart) {
  const subtotal = cart.reduce(
    (sum, x) => sum + Number(x.price) * (x.qty || 1),
    0,
  );
  const voucher = 0;

  const mode = getOrderMode();
  const itemsCount = cart.reduce((sum, x) => sum + (x.qty || 1), 0);

  const packaging = mode === "takeaway" ? itemsCount * 0.3 : 0;
  const total = Math.max(0, subtotal - voucher + packaging);

  return { subtotal, voucher, packaging, total, mode, itemsCount };
}

/* =========================
   STALL TITLE
========================= */
function updateStallTitle(lines) {
  const titleEl = document.getElementById("stallTitle");
  if (!titleEl) return;

  const stalls = Array.from(new Set(lines.map((x) => x.stall).filter(Boolean)));
  titleEl.textContent = stalls.length === 1 ? stalls[0] : "Order Summary";
}

/* =========================
   PAYMENT PICKER
========================= */
function setPayment(method) {
  sessionStorage.setItem("paymentMethod", method);

  document.querySelectorAll(".pay-row").forEach((row) => {
    const dot = row.querySelector(".dotpick");
    if (!dot) return;
    dot.classList.toggle("active", row.dataset.method === method);
  });
}

function initPaymentPicker() {
  const rows = document.querySelectorAll(".pay-row");
  if (!rows.length) return;

  const saved = sessionStorage.getItem("paymentMethod") || "visa";
  setPayment(saved);

  rows.forEach((row) => {
    row.addEventListener("click", () => {
      const method = row.dataset.method;
      if (!method) return;
      setPayment(method);
    });
  });
}

/* =========================
   ORDER TYPE TOGGLE UI
   (expects .mode-btn buttons)
========================= */
function initOrderModeToggle() {
  const btns = document.querySelectorAll(".mode-btn");
  if (!btns.length) return;

  function applyUI(mode) {
    btns.forEach((b) => b.classList.toggle("active", b.dataset.mode === mode));

    const note = document.getElementById("modeNote"); // optional
    if (note) note.style.display = mode === "takeaway" ? "block" : "none";
  }

  const saved = getOrderMode();
  applyUI(saved);

  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const mode = btn.dataset.mode;
      if (!mode) return;
      setOrderMode(mode);
      applyUI(mode);
      renderCart(); // ✅ recalc totals immediately
    });
  });
}

/* =========================
   RENDER CART
========================= */
function renderCart() {
  const itemsRoot = document.getElementById("itemsRoot");
  const emptyState = document.getElementById("emptyState");
  const placeBtn = document.getElementById("placeOrderBtn");

  if (!itemsRoot || !emptyState) return;

  const lines = getCart();
  itemsRoot.innerHTML = "";

  if (lines.length === 0) {
    emptyState.style.display = "block";
    if (placeBtn) placeBtn.disabled = true;

    const subtotalEl = document.getElementById("subtotalVal");
    const voucherEl = document.getElementById("voucherVal");
    const totalBreakdown = document.getElementById("totalValBreakdown");
    const totalSticky = document.getElementById("totalVal");

    if (subtotalEl) subtotalEl.textContent = money(0);
    if (voucherEl) voucherEl.textContent = `-${money(0).slice(1)}`;
    if (totalBreakdown) totalBreakdown.textContent = money(0);
    if (totalSticky) totalSticky.textContent = money(0);

    const packLabel = document.getElementById("packagingLabel");
    const packVal = document.getElementById("packagingVal");
    if (packLabel) packLabel.style.display = "none";
    if (packVal) packVal.style.display = "none";
    return;
  }

  emptyState.style.display = "none";
  if (placeBtn) placeBtn.disabled = false;

  updateStallTitle(lines);

  // ---- Render each line
  lines.forEach((row) => {
    const wrap = document.createElement("div");
    wrap.className = "item-row";

    const thumb = document.createElement("div");
    thumb.className = "thumb";

    const img = document.createElement("img");
    img.alt = row.item;
    img.src = row.image || "images/placeholder.png";
    img.onerror = () => (img.src = "images/placeholder.png");
    thumb.appendChild(img);

    const mid = document.createElement("div");
    mid.className = "item-mid";

    const name = document.createElement("p");
    name.className = "item-name";
    name.textContent = row.item;

    const sub = document.createElement("div");
    sub.className = "item-sub";

    const qty = document.createElement("div");
    qty.className = "qty";

    const minus = document.createElement("button");
    minus.type = "button";
    minus.textContent = "−";

    const qtyVal = document.createElement("span");
    qtyVal.textContent = String(row.qty || 1);

    const plus = document.createElement("button");
    plus.type = "button";
    plus.textContent = "+";

    qty.appendChild(minus);
    qty.appendChild(qtyVal);
    qty.appendChild(plus);

    const perItem = document.createElement("span");
    perItem.textContent = `${money(row.price)} each`;

    sub.appendChild(qty);
    sub.appendChild(perItem);

    mid.appendChild(name);
    mid.appendChild(sub);

    const price = document.createElement("div");
    price.className = "price";
    price.textContent = money(Number(row.price) * (row.qty || 1));

    // ✅ minus updates qty + removes when 0
    minus.addEventListener("click", () => {
      const cart = getCart();
      const i = cart.findIndex(
        (x) =>
          x.stall === row.stall &&
          x.item === row.item &&
          Number(x.price) === Number(row.price),
      );
      if (i < 0) return;

      cart[i].qty = (cart[i].qty || 1) - 1;
      if (cart[i].qty <= 0) cart.splice(i, 1);

      setCart(cart);
      renderCart();
    });

    // ✅ plus updates qty (or adds if missing)
    plus.addEventListener("click", () => {
      const cart = getCart();
      const i = cart.findIndex(
        (x) =>
          x.stall === row.stall &&
          x.item === row.item &&
          Number(x.price) === Number(row.price),
      );

      if (i >= 0) {
        cart[i].qty = (cart[i].qty || 1) + 1;
      } else {
        cart.push({
          stall: row.stall,
          item: row.item,
          price: Number(row.price),
          qty: 1,
          image: row.image,
          addedAt: Date.now(),
        });
      }

      setCart(cart);
      renderCart();
    });

    wrap.appendChild(thumb);
    wrap.appendChild(mid);
    wrap.appendChild(price);
    itemsRoot.appendChild(wrap);
  });

  // ---- Totals
  const totals = computeTotals(lines);

  const subtotalEl = document.getElementById("subtotalVal");
  const voucherEl = document.getElementById("voucherVal");
  const totalBreakdown = document.getElementById("totalValBreakdown"); // main totals line
  const totalSticky = document.getElementById("totalVal"); // bottom bar total

  if (subtotalEl) subtotalEl.textContent = money(totals.subtotal);
  if (voucherEl) voucherEl.textContent = `-${money(totals.voucher).slice(1)}`;

  // packaging row (optional elements in HTML)
  const packLabel = document.getElementById("packagingLabel");
  const packVal = document.getElementById("packagingVal");
  if (packLabel && packVal) {
    const showPack = totals.mode === "takeaway";
    packLabel.style.display = showPack ? "block" : "none";
    packVal.style.display = showPack ? "block" : "none";
    packVal.textContent = money(totals.packaging);
  }

  if (totalBreakdown) totalBreakdown.textContent = money(totals.total);
  if (totalSticky) totalSticky.textContent = money(totals.total);
}

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  renderCart();
  initPaymentPicker();
  initOrderModeToggle();

  const placeBtn = document.getElementById("placeOrderBtn");
  if (placeBtn) {
    placeBtn.addEventListener("click", () => {
      const cart = getCart();
      if (!cart.length) return alert("Cart is empty.");

      const payment = sessionStorage.getItem("paymentMethod") || "visa";
      const mode = getOrderMode();

      // redirect if Add Card selected
      if (payment === "add-card") {
        window.location.href = "PaymentFailed.html";
        return;
      }
      window.location.href = "PaymentSuccess.html";
    });
  }
});

// sessionStorage.removeItem("cart");
// renderCart();
/***********************
 * FAVOURITE MENU ITEMS (localStorage)
 * Unique ID: stallName::itemName
 ***********************/
const FAV_ITEM_KEY = "shioklah_fav_items_v1";

function loadFavItemsMap() {
  try {
    return JSON.parse(localStorage.getItem(FAV_ITEM_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveFavItemsMap(map) {
  localStorage.setItem(FAV_ITEM_KEY, JSON.stringify(map));
}

function makeFavItemId(stallName, itemName) {
  return `${stallName}::${itemName}`;
}

function isFavouriteItem(stallName, itemName) {
  const id = makeFavItemId(stallName, itemName);
  const map = loadFavItemsMap();
  return Boolean(map[id]);
}

function toggleFavouriteItem(itemData) {
  // itemData = { stallName, itemName, price, image }
  const id = makeFavItemId(itemData.stallName, itemData.itemName);
  const map = loadFavItemsMap();

  if (map[id]) {
    delete map[id];
    saveFavItemsMap(map);
    return false; // now not favourited
  } else {
    map[id] = {
      id,
      stallName: itemData.stallName,
      itemName: itemData.itemName,
      price: Number(itemData.price) || 0,
      image: itemData.image || "",
      savedAt: Date.now(),
    };
    saveFavItemsMap(map);
    return true; // now favourited
  }
}

// optional: expose for other pages
window.toggleFavouriteItem = toggleFavouriteItem;
window.isFavouriteItem = isFavouriteItem;
