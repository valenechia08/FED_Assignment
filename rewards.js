document.addEventListener("DOMContentLoaded", () => {
  // ====== TOP TOAST ======
  const topToast = document.getElementById("top-toast");
  const topToastText = document.getElementById("top-toast-text");
  const topToastClose = document.getElementById("top-toast-close");
  let toastTimer = null;

  function showTopToast(message, ms = 4500) {
    if (!topToast || !topToastText) return;
    topToastText.textContent = message;
    if (toastTimer) clearTimeout(toastTimer);
    topToast.classList.add("show");
    toastTimer = setTimeout(() => {
      topToast.classList.remove("show");
      toastTimer = null;
    }, ms);
  }

  if (topToastClose) {
    topToastClose.addEventListener("click", () => {
      if (toastTimer) clearTimeout(toastTimer);
      topToast.classList.remove("show");
      toastTimer = null;
    });
  }

  // ====== OS (Laptop) Notification ======
  function notifyLaptop(title, body) {
    if (!("Notification" in window)) return;

    if (Notification.permission === "granted") {
      new Notification(title, { body });
      return;
    }

    if (Notification.permission !== "denied") {
      Notification.requestPermission().then((perm) => {
        if (perm === "granted") new Notification(title, { body });
      });
    }
  }

  // ====== Voucher buttons ======
  const voucherButtons = document.querySelectorAll(".card:not(#card-spin) .btn");
  voucherButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.classList.contains("locked") || btn.closest(".card").classList.contains("used")) return;
      const card = btn.closest(".card");
      card.classList.add("used");
      btn.textContent = "Used";
      btn.disabled = true;
    });
  });

  // ====== Lucky Spin ======
  const wheel = document.getElementById("wheel");
  const spinBtn = document.getElementById("lucky-spin");
  const popup = document.getElementById("reward-popup");
  const popupText = document.getElementById("popup-text");
  const popupClose = document.getElementById("popup-close");
  const spinTimerDisplay = document.getElementById("spin-timer");

  // Important: if your page has a different id for the grid or spin card, adjust here
  const grid = document.getElementById("rewards-grid");
  const spinCard = document.getElementById("card-spin");

  const prizes = ["$5", "$10", "Try Again", "$15", "Bonus Points"];
  const ctx = wheel.getContext("2d");
  const radius = wheel.width / 2;

  // Draw wheel
  function drawWheel() {
    const colors = ["#FF9F1C","#FFD166","#06D6A0","#4CC9F0","#F72585"];
    ctx.clearRect(0, 0, wheel.width, wheel.height);

    prizes.forEach((prize, i) => {
      const startAngle = (i * 2 * Math.PI) / prizes.length;
      const endAngle = ((i + 1) * 2 * Math.PI) / prizes.length;

      ctx.beginPath();
      ctx.moveTo(radius, radius);
      ctx.arc(radius, radius, radius, startAngle, endAngle);
      ctx.fillStyle = colors[i];
      ctx.fill();

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.save();
      ctx.translate(radius, radius);
      ctx.rotate(((i + 0.5) * 2 * Math.PI) / prizes.length);
      ctx.textAlign = "right";
      ctx.fillStyle = "#222";
      ctx.font = "bold 16px Segoe UI";
      ctx.fillText(prize, radius - 15, 6);
      ctx.restore();
    });

    ctx.beginPath();
    ctx.arc(radius, radius, 35, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
  }
  drawWheel();

  // ====== 24-Hour Cooldown Logic ======
  let cooldownEnd = localStorage.getItem("spinCooldown")
    ? new Date(localStorage.getItem("spinCooldown"))
    : null;

  function updateSpinTimer() {
    if (!cooldownEnd || isNaN(cooldownEnd.getTime())) {
      cooldownEnd = null;
      localStorage.removeItem("spinCooldown");
      spinTimerDisplay.textContent = "";
      spinBtn.disabled = false;
      spinBtn.style.backgroundColor = "";
      spinBtn.style.cursor = "pointer";
      return;
    }

    const now = new Date();
    const diff = cooldownEnd - now;

    if (diff <= 0) {
      cooldownEnd = null;
      localStorage.removeItem("spinCooldown");
      spinTimerDisplay.textContent = "";
      spinBtn.disabled = false;
      spinBtn.style.backgroundColor = "";
      spinBtn.style.cursor = "pointer";
      return;
    }

    const hours = Math.floor(diff / (1000*60*60));
    const minutes = Math.floor((diff % (1000*60*60)) / (1000*60));
    const seconds = Math.floor((diff % (1000*60)) / 1000);

    spinTimerDisplay.textContent = `Next spin in: ${hours}h ${minutes}m ${seconds}s`;
    spinBtn.disabled = true;
    spinBtn.style.backgroundColor = "grey";
    spinBtn.style.cursor = "not-allowed";
  }

  setInterval(updateSpinTimer, 1000);
  updateSpinTimer();

  // ====== Confetti ======
  function launchConfetti() {
    const colors = ["#FF9F1C","#FFD166","#06D6A0","#4CC9F0","#F72585"];
    for (let i = 0; i < 120; i++) {
      const confetti = document.createElement("div");
      confetti.style.position = "fixed";
      confetti.style.width = "8px";
      confetti.style.height = "8px";
      confetti.style.backgroundColor = colors[Math.floor(Math.random()*colors.length)];
      confetti.style.left = Math.random()*100 + "vw";
      confetti.style.top = "-10px";
      confetti.style.borderRadius = "50%";
      confetti.style.zIndex = "9999";
      confetti.style.pointerEvents = "none";
      document.body.appendChild(confetti);

      requestAnimationFrame(() => {
        const rotate = Math.random() * 720;
        const fallDistance = window.innerHeight + 50;
        confetti.style.transition = `transform 3s ease-out, opacity 3s ease-out`;
        confetti.style.transform = `translateY(${fallDistance}px) rotate(${rotate}deg)`;
        confetti.style.opacity = 0;
      });

      setTimeout(() => confetti.remove(), 3100);
    }
  }

  // ====== Helper: Add a new reward card into the grid ======
  function addRewardCard(title, desc, icon, id) {
    if (!grid || !spinCard) return;
    if (id && document.querySelector(`[data-reward-id="${id}"]`)) return;

    const card = document.createElement("div");
    card.className = "card";
    if (id) card.setAttribute("data-reward-id", id);

    card.innerHTML = `
      <div class="icon">${icon}</div>
      <h2>${title}</h2>
      <p>${desc}</p>
      <button class="btn">Use now</button>
    `;

    // wire the new button like your existing ones
    const btn = card.querySelector(".btn");
    btn.addEventListener("click", () => {
      if (card.classList.contains("used")) return;
      card.classList.add("used");
      btn.textContent = "Used";
      btn.disabled = true;
    });

    grid.insertBefore(card, spinCard);
  }

  // ====== Spin Button ======
  let spinning = false;

  spinBtn.addEventListener("click", () => {
    if (spinning) return;
    if (spinBtn.disabled) return;

    spinning = true;

    const selectedIndex = Math.floor(Math.random() * prizes.length);
    const sliceAngle = 360 / prizes.length;

    // rotate so winning slice lands at top (your original math)
    const rotation = 360 * 5 - (selectedIndex * sliceAngle) - sliceAngle/2 + 270;
    wheel.style.transition = "transform 4s cubic-bezier(.17,.67,.12,.99)";
    wheel.style.transform = `rotate(${rotation}deg)`;

    wheel.addEventListener("transitionend", function handler() {
      wheel.style.transition = "";
      const reward = prizes[selectedIndex];

      if (reward !== "Try Again") {
        launchConfetti();

        cooldownEnd = new Date(Date.now() + 24*60*60*1000);
        localStorage.setItem("spinCooldown", cooldownEnd.toISOString());
        updateSpinTimer();

        // Add voucher to grid
        if (reward === "Bonus Points") {
          addRewardCard("Bonus Points", "Get extra points on your next purchase", "💰", "spin-points");
          showTopToast("✅ Added: Bonus Points", 5000);
          notifyLaptop("ShiokLah! Reward Unlocked 🎁", "You received: Bonus Points");
        } else {
          const id = `spin-${reward.replace("$","")}`;
          addRewardCard(`${reward} Voucher`, `Use ${reward} off your next order`, "💵", id);
          showTopToast(`✅ Added: ${reward} Voucher`, 5000);
          notifyLaptop("ShiokLah! Reward Unlocked 🎁", `You received: ${reward} Voucher`);
        }
      } else {
        showTopToast("🔁 Second chance unlocked — spin again now!", 4500);
      }

      // Popup
      popupText.textContent = reward === "Try Again"
        ? "You get a second chance to spin!"
        : `You won: ${reward}!`;
      popup.classList.add("show");

      wheel.removeEventListener("transitionend", handler);
      spinning = false;
    });
  });

  popupClose.addEventListener("click", () => popup.classList.remove("show"));
});
