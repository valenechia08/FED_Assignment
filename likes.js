/************************************************
 * likes.js — FINAL, WORKING
 * - Injects IG-style heart
 * - Saves to localStorage
 * - Blocks unavailable items
 ************************************************/

const FAV_KEY = "shioklah_fav_items_v1";

/* ---------- storage ---------- */
function loadFavs() {
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY)) || {};
  } catch {
    return {};
  }
}

function saveFavs(map) {
  localStorage.setItem(FAV_KEY, JSON.stringify(map));
}

/* ---------- helpers ---------- */
function makeId(stall, item) {
  return `${stall}::${item}`;
}

function getStallName() {
  const el = document.getElementById("stallName");
  return el ? el.textContent.trim() : "";
}

/* ---------- core ---------- */
function attachHeart(card) {
  if (card.querySelector(".heart-btn")) return;

  const stallName = getStallName();
  if (!stallName) return;

  const titleEl = card.querySelector(".menu-title");
  if (!titleEl) return;

  const itemName = titleEl.textContent.trim();
  const favs = loadFavs();
  const id = makeId(stallName, itemName);

  const isUnavailable =
    card.classList.contains("unavailable") ||
    card.querySelector(".plus-btn")?.disabled;

  const actions = card.querySelector(".menu-actions");
  if (!actions) return;

  const btn = document.createElement("button");
  btn.className = "heart-btn";
  btn.type = "button";
  btn.innerHTML = `<span class="heart-icon">♥</span>`;

  if (favs[id]) btn.classList.add("active");

  if (isUnavailable) {
    btn.disabled = true;
  } else {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const map = loadFavs();

      if (map[id]) {
        delete map[id];
        btn.classList.remove("active");
      } else {
        const priceText =
          card.querySelector(".menu-price")?.textContent || "0";
        const price = Number(priceText.replace("$", "")) || 0;
        const img = card.querySelector("img")?.src || "";

        map[id] = {
          id,
          stallName,
          itemName,
          price,
          image: img,
          savedAt: Date.now(),
        };

        btn.classList.add("active");
      }

      saveFavs(map);
    });
  }

  actions.prepend(btn);
}

/* ---------- observer ---------- */
function initLikes() {
  const root = document.getElementById("menuRoot");
  if (!root) return;

  const run = () =>
    root.querySelectorAll(".menu-card").forEach(attachHeart);

  run();

  new MutationObserver(run).observe(root, {
    childList: true,
    subtree: true,
  });
}

document.addEventListener("DOMContentLoaded", initLikes);
