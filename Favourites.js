/************************************************************
 * FAVOURITES (STALLS) — ShiokLah!
 * Theme: white + orange (#e47329)
 * Uses localStorage to save favourite stall IDs.
 *
 * WHAT THIS FILE DOES
 * 1) Keeps a master list of stalls (your 5 current stalls).
 * 2) Reads/writes favourites from localStorage.
 * 3) Renders favourite stalls grid with search/filter/sort.
 * 4) Exposes helpers so other pages can toggle favourites:
 *    - window.toggleFavouriteStall(stallId)
 *    - window.isFavouriteStall(stallId)
 *    - window.addFavouriteStall(stallId)
 *    - window.removeFavouriteStall(stallId)
 ************************************************************/

document.addEventListener("DOMContentLoaded", () => {
  /***********************
   * 1) STALL DATA
   * Update img paths to your real filenames
   ***********************/
  const STALLS = [
    {
      id: "ST01",
      name: "Banana Leaf Nasi Lemak",
      cuisine: "Malay",
      rating: 4.0,
      img: "images/stalls/banana-leaf-nasi-lemak.jpg"
    },
    {
      id: "ST02",
      name: "Big Daddy’s Chicken & Noodle Stall",
      cuisine: "Others",
      rating: 4.5,
      img: "images/stalls/big-daddys-chicken-noodle.jpg"
    },
    {
      id: "ST03",
      name: "Boon Lay Fried Carrot Cake & Kway Teow Mee",
      cuisine: "Chinese",
      rating: 4.2,
      img: "images/stalls/boon-lay-fried-carrot-cake.jpg"
    },
    {
      id: "ST04",
      name: "Boon Lay Lu Wei",
      cuisine: "Chinese",
      rating: 4.2,
      img: "images/stalls/boon-lay-lu-wei.jpg"
    },
    {
      id: "ST05",
      name: "IMohamed Ismail Food Stall",
      cuisine: "Indian",
      rating: 4.5,
      img: "images/stalls/imohamed-ismail.jpg"
    }
  ];

  /***********************
   * 2) STORAGE
   ***********************/
  const FAV_KEY = "shioklah_fav_stalls_v1";

  function loadFavSet() {
    try {
      return new Set(JSON.parse(localStorage.getItem(FAV_KEY) || "[]"));
    } catch (err) {
      console.warn("Failed to load favourites:", err);
      return new Set();
    }
  }

  function saveFavSet(set) {
    localStorage.setItem(FAV_KEY, JSON.stringify([...set]));
  }

  /***********************
   * 3) DOM HOOKS
   * (Make sure these IDs exist in your HTML)
   ***********************/
  const gridEl = document.getElementById("grid");
  const emptyEl = document.getElementById("emptyState");
  const countText = document.getElementById("countText");

  const searchInput = document.getElementById("searchInput");
  const cuisineFilter = document.getElementById("cuisineFilter");
  const sortSelect = document.getElementById("sortSelect");

  const clearAllBtn = document.getElementById("clearAllBtn");
  const exportBtn = document.getElementById("exportBtn");
  const seedBtn = document.getElementById("seedBtn");

  // Toast (optional)
  const toast = document.getElementById("toast");
  const toastTitle = document.getElementById("toastTitle");
  const toastMsg = document.getElementById("toastMsg");
  let toastTimer = null;

  /***********************
   * 4) SMALL UTILITIES
   ***********************/
  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function showToast(title, msg) {
    // If you removed toast from HTML, this safely does nothing.
    if (!toast || !toastTitle || !toastMsg) return;

    toastTitle.textContent = title;
    toastMsg.textContent = msg;
    toast.style.display = "block";

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.style.display = "none";
    }, 2200);
  }

  function safeNumber(n, fallback = 0) {
    const x = Number(n);
    return Number.isFinite(x) ? x : fallback;
  }

  /***********************
   * 5) FILTER + SORT
   ***********************/
  function refreshCuisineOptions() {
    if (!cuisineFilter) return;

    const current = cuisineFilter.value || "all";
    const cuisines = Array.from(new Set(STALLS.map((s) => s.cuisine).filter(Boolean))).sort();

    cuisineFilter.innerHTML = `<option value="all">All cuisines</option>`;
    cuisines.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      cuisineFilter.appendChild(opt);
    });

    cuisineFilter.value = cuisines.includes(current) ? current : "all";
  }

  function applySearchFilterSort(stalls) {
    const q = (searchInput?.value || "").trim().toLowerCase();
    const cuisine = cuisineFilter?.value || "all";
    const sortBy = sortSelect?.value || "recent";

    let out = stalls.filter((s) => {
      const matchQ =
        !q ||
        (s.name || "").toLowerCase().includes(q) ||
        (s.cuisine || "").toLowerCase().includes(q);

      const matchCuisine = cuisine === "all" || s.cuisine === cuisine;
      return matchQ && matchCuisine;
    });

    out.sort((a, b) => {
      if (sortBy === "ratingHigh") return safeNumber(b.rating) - safeNumber(a.rating);
      if (sortBy === "nameAZ") return (a.name || "").localeCompare(b.name || "");
      // "recent" — we don't have per-stall timestamps yet, so keep stable by name
      return (a.name || "").localeCompare(b.name || "");
    });

    return out;
  }

  /***********************
   * 6) RENDER
   ***********************/
  function render() {
    if (!gridEl || !emptyEl || !countText) return;

    refreshCuisineOptions();

    const favs = loadFavSet();
    const favStalls = STALLS.filter((s) => favs.has(s.id));

    countText.textContent = `(${favStalls.length} stall${favStalls.length === 1 ? "" : "s"})`;

    gridEl.innerHTML = "";
    emptyEl.style.display = favStalls.length ? "none" : "block";

    if (!favStalls.length) return;

    const shown = applySearchFilterSort(favStalls);

    if (!shown.length) {
      gridEl.innerHTML = `
        <div class="empty" style="grid-column:1/-1;">
          <strong>No results found.</strong>
          <div style="margin-top:6px;">Try clearing your search or changing cuisine.</div>
        </div>
      `;
      return;
    }

    shown.forEach((s) => {
      const card = document.createElement("article");
      card.className = "stall-card";

      const imgHtml = s.img
        ? `<img src="${escapeHtml(s.img)}" alt="${escapeHtml(s.name)}" />`
        : "";

      const rating = safeNumber(s.rating).toFixed(1);

      card.innerHTML = `
        <div class="thumb">
          ${imgHtml}
          <div class="pill">❤️
            <button data-action="remove" data-id="${escapeHtml(s.id)}">Remove</button>
          </div>
        </div>

        <div class="stall-body">
          <div class="row">
            <div>
              <div class="title">${escapeHtml(s.name)}</div>
              <div class="sub">${escapeHtml(s.cuisine)} • <span class="rating"><span class="star">★</span>${rating}</span></div>
            </div>
          </div>

          <div class="meta">
            <span class="tag">${escapeHtml(s.cuisine)}</span>
            <span class="tag">Rating ${rating}</span>
          </div>
        </div>

        <div class="stall-actions">
          <button class="btn btn-primary" data-action="start" data-id="${escapeHtml(s.id)}">
            Start order
          </button>
          <button class="btn btn-ghost" data-action="view" data-id="${escapeHtml(s.id)}">
            View
          </button>
        </div>
      `;

      gridEl.appendChild(card);
    });
  }

  /***********************
   * 7) ACTIONS
   ***********************/
  function removeFavourite(stallId) {
    const favs = loadFavSet();
    favs.delete(stallId);
    saveFavSet(favs);
    showToast("Removed", "Stall removed from favourites.");
    render();
  }

  function clearAll() {
    saveFavSet(new Set());
    showToast("Cleared", "All favourite stalls removed.");
    render();
  }

  function seedFavourites() {
    // Add ALL stalls as favourites (demo/testing)
    const favs = loadFavSet();
    STALLS.forEach((s) => favs.add(s.id));
    saveFavSet(favs);
    showToast("Seeded", "Added your current stalls as favourites.");
    render();
  }

  function exportFavourites() {
    const favIds = [...loadFavSet()];
    const payload = {
      favouriteStallIds: favIds,
      count: favIds.length
    };

    const text = JSON.stringify(payload, null, 2);

    navigator.clipboard.writeText(text).then(
      () => showToast("Exported", "Copied favourite stall IDs to clipboard."),
      () => showToast("Oops", "Clipboard permission blocked.")
    );
  }

  /***********************
   * 8) EVENTS
   ***********************/
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;

    const action = btn.dataset.action;
    const id = btn.dataset.id;

    if (!action || !id) return;

    if (action === "remove") removeFavourite(id);

    if (action === "start") {
      // TODO: When your stall menu page exists:
      // location.href = `StallMenu.html?stallId=${encodeURIComponent(id)}`;
      showToast("Start order", "Link this button to your stall menu page later.");
    }

    if (action === "view") {
      // TODO: When stall details page exists:
      showToast("View stall", "Link this button to your stall details page later.");
    }
  });

  if (searchInput) searchInput.addEventListener("input", render);
  if (cuisineFilter) cuisineFilter.addEventListener("change", render);
  if (sortSelect) sortSelect.addEventListener("change", render);

  if (clearAllBtn) {
    clearAllBtn.addEventListener("click", () => {
      if (!loadFavSet().size) return;
      clearAll();
    });
  }

  if (seedBtn) seedBtn.addEventListener("click", seedFavourites);
  if (exportBtn) exportBtn.addEventListener("click", exportFavourites);

  /***********************
   * 9) HELPERS FOR OTHER PAGES
   * Use these on your Home/Start Order stalls list page
   ***********************/
  window.isFavouriteStall = function (stallId) {
    return loadFavSet().has(stallId);
  };

  window.addFavouriteStall = function (stallId) {
    const favs = loadFavSet();
    favs.add(stallId);
    saveFavSet(favs);
    return true;
  };

  window.removeFavouriteStall = function (stallId) {
    const favs = loadFavSet();
    favs.delete(stallId);
    saveFavSet(favs);
    return false;
  };

  window.toggleFavouriteStall = function (stallId) {
    const favs = loadFavSet();
    if (favs.has(stallId)) favs.delete(stallId);
    else favs.add(stallId);
    saveFavSet(favs);
    return favs.has(stallId); // new state
  };

  /***********************
   * 10) INIT
   ***********************/
  render();
});
