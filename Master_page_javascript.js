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

// async function retrieveAccount() {
//   const username = normalizeUsername($("username")?.value ?? "");
//   const continueButton = $("continueBtn");

//   if (!username) {
//     showMessage("Please enter your username.");
//     return;
//   }
//   try {
//     const memberRef = ref(db, `members/${username}`);
//     const snap = await get(memberRef);

//     if (!snap.exists()) {
//       showMessage("User not found", "red");
//       return;
//     } else {
//       sessionStorage.setItem("currentInUser", username);
//       window.location.href = "ConfirmAccount.html";
//     }
//   } catch (err) {
//     console.error(err);
//     showMessage(`Login failed: ${err?.message ?? "Unknown error"}`, "red");
//   }
// }
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
  let finalCode = null;
  if (window.location.pathname.endsWith("ConfirmAccount.html")) {
    // Generate code on page load
    finalCode = generateCode();
  }
  document.querySelector(".backBtn").addEventListener("click", () => {
    window.location.href = "ChangePassword.html";
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
      showMessage("✅ Verification successful!", "green");
      window.location.href = "ChangePassword.html";
    } else {
      showMessage("❌ Invalid code. Try again.", "red");
    }
  });
});

//Change Password
async function resetPassword() {
  const username = sessionStorage.getItem("currentUser");
  console.log(username);
  const password = $("newPassword")?.value ?? "";
  const msg = document.getElementById("msg");

  const rule = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{9,}$/;

  if (!rule.test(password)) {
    msg.innerHTML = "❌ Must be 9+ chars with letters & numbers only";
    return;
  }
  try {
    const passwordHash = await sha256(password);

    await update(ref(db, `members/${username}`), {
      passwordHash: passwordHash,
      passwordUpdatedAt: Date.now(),
    });

    msg.innerHTML = "✅ Password updated successfully — you can now log in";
    sessionStorage.removeItem("currentUser");
  } catch (err) {
    msg.innerHTML = "❌ " + err.message;
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

  // Find account page
  if ($("continueBtn")) {
    $("continueBtn").addEventListener("click", retrieveAccount);
  }
  //Reset password page
  if ($("resetPasswordBtn")) {
    $("resetPasswordBtn").addEventListener("click", resetPassword);

    document.querySelector(".secondBackBtn").addEventListener("click", () => {
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

//Top Navigation
// Top Navigation
document.querySelectorAll(".menu-item").forEach((item) => {
  const mainLink = item.querySelector("a"); // main menu link
  const dropdown = item.querySelector(".dropdown");

  // Toggle dropdown when clicking the main menu link
  if (mainLink && dropdown) {
    mainLink.addEventListener("click", (e) => {
      e.preventDefault(); // prevent navigation for main menu
      dropdown.style.display =
        dropdown.style.display === "block" ? "none" : "block";
    });
  }

  // Allow submenu links to navigate normally
  if (dropdown) {
    dropdown.querySelectorAll("a").forEach((subLink) => {
      subLink.addEventListener("click", () => {
        // no preventDefault here → browser navigates to href
        dropdown.style.display = "none"; // optional: close dropdown after click
      });
    });
  }
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

  // Grab all cuisine cards
  const cuisines = document.querySelectorAll(".cuisine-card");

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

        // get the cuisine name from the <p> tag and normalize it
        let chosenCuisine = cuisine
          .querySelector("p")
          .textContent.trim()
          .toLowerCase();

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
}

import React from 'react';
import { Home, Package, ShoppingBag, User, Clock } from 'lucide-react';

const OrderDashboard = () => {
  const orders = [
    { id: 1, name: 'Tobi', phone: '432112340987', items: '1 Cap', time: '11:04am', day: 'Today' },
    { id: 2, name: 'David', phone: '098712348765', items: '4 Caps', time: '08:04am', day: 'Today' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
      {/* 1. SIDEBAR (Desktop Navigation) */}
      <aside className="w-64 bg-white border-r flex flex-col items-center py-8 gap-8">
        <div className="text-orange-600 font-bold text-2xl mb-4">LOGO</div>
        <nav className="flex flex-col gap-6 w-full px-6">
          <NavItem icon={<Home size={20} />} label="Home" />
          <NavItem icon={<Package size={20} />} label="Orders" active />
          <NavItem icon={<ShoppingBag size={20} />} label="Inventory" />
          <NavItem icon={<User size={20} />} label="Profile" />
        </nav>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-10">
        
        {/* Header Stat Card */}
        <div className="bg-orange-600 rounded-3xl p-8 text-white mb-10 flex justify-between items-center shadow-lg max-w-4xl">
          <div>
            <h2 className="text-xl opacity-90 font-medium">Pending Orders</h2>
            <p className="text-6xl font-bold mt-2">20</p>
          </div>
          <div className="opacity-20 hidden md:block">
             {/* Decorative pattern placeholder */}
             <svg width="100" height="100" viewBox="0 0 100 100" fill="currentColor"><circle cx="50" cy="50" r="40" /></svg>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-8 border-b border-gray-200 mb-8 max-w-4xl">
          {['Pending', 'In Progress', 'Shipped', 'Declined'].map((tab) => (
            <button 
              key={tab} 
              className={`pb-4 px-2 text-sm font-semibold transition-all ${tab === 'Pending' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Order List Section */}
        <section className="max-w-4xl">
          <h3 className="text-xl font-bold mb-6">Today</h3>
          <div className="grid gap-4">
            {orders.map(order => (
              <div key={order.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-start hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                  <div className="bg-orange-50 p-3 rounded-xl text-orange-600">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Pending order</h4>
                    <p className="text-gray-500 mt-1">You have an order from <span className="text-gray-800 font-medium">{order.name} ({order.phone})</span> for {order.items}.</p>
                    <p className="text-sm text-gray-400 mt-2 italic">Please review and process the order.</p>
                  </div>
                </div>
                <span className="text-gray-900 font-bold">{order.time}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

// Helper Component
const NavItem = ({ icon, label, active = false }) => (
  <button className={`flex items-center gap-4 w-full p-3 rounded-xl transition-colors ${active ? 'bg-orange-600 text-white shadow-md shadow-orange-200' : 'text-gray-400 hover:bg-gray-100'}`}>
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);

export default OrderDashboard;