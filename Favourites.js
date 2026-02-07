document.addEventListener("DOMContentLoaded", () => {
  const KEY = "shioklah_fav_items_v1";

  const grid = document.getElementById("itemsGrid");
  const empty = document.getElementById("itemsEmpty");
  const count = document.getElementById("itemsCountText");

  function load() {
    try {
      return Object.values(JSON.parse(localStorage.getItem(KEY)) || {});
    } catch {
      return [];
    }
  }

  function render() {
    const items = load();
    count.textContent = `(${items.length} items)`;
    grid.innerHTML = "";

    if (!items.length) {
      empty.style.display = "block";
      return;
    }

    empty.style.display = "none";

    items.forEach((it) => {
      const card = document.createElement("article");
      card.className = "stall-card";

      card.innerHTML = `
        <div class="thumb">
          ${it.image ? `<img src="${it.image}">` : ""}
        </div>
        <div class="stall-body">
          <div class="title">${it.itemName}</div>
          <div class="sub">${it.stallName} • $${it.price.toFixed(2)}</div>
        </div>
      `;

      grid.appendChild(card);
    });
  }

  render();
});
