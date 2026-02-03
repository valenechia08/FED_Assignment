document.addEventListener("DOMContentLoaded", () => {
  // ====== Voucher buttons ======
  const voucherButtons = document.querySelectorAll(".card:not(#card-spin) .btn");
  voucherButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.classList.contains("locked") || btn.closest(".card").classList.contains("used")) return;
      const card = btn.closest(".card");
      card.classList.add("used"); // makes whole card grey
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

  const prizes = ["$5", "$10", "Try Again", "$15", "Bonus Points"];
  const ctx = wheel.getContext("2d");
  const radius = wheel.width / 2;

  // Draw wheel
  function drawWheel() {
    const colors = ["#FF9F1C","#FFD166","#06D6A0","#4CC9F0","#F72585"];
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

      // text
      ctx.save();
      ctx.translate(radius, radius);
      ctx.rotate(((i + 0.5) * 2 * Math.PI) / prizes.length);
      ctx.textAlign = "right";
      ctx.fillStyle = "#222";
      ctx.font = "bold 16px Segoe UI";
      ctx.fillText(prize, radius - 15, 6);
      ctx.restore();
    });

    // center circle
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
    if (!cooldownEnd) {
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

  // ====== Spin Button ======
  spinBtn.addEventListener("click", () => {
    if (spinBtn.disabled) return;
    const selectedIndex = Math.floor(Math.random() * prizes.length);
    const sliceAngle = 360 / prizes.length;

    // rotate so winning slice lands at top
    const rotation = 360 * 5 - (selectedIndex * sliceAngle) - sliceAngle/2 + 270;
    wheel.style.transition = "transform 4s cubic-bezier(.17,.67,.12,.99)";
    wheel.style.transform = `rotate(${rotation}deg)`;

    wheel.addEventListener("transitionend", function handler() {
      wheel.style.transition = "";
      const reward = prizes[selectedIndex];

      if (reward !== "Try Again") {
        launchConfetti();
        spinBtn.disabled = true;

        cooldownEnd = new Date(new Date().getTime() + 24*60*60*1000);
        localStorage.setItem("spinCooldown", cooldownEnd);
        updateSpinTimer();
      }

      popupText.textContent = reward === "Try Again" ? "Try again!" : `You won: ${reward}`;
      popup.classList.add("show");

      wheel.removeEventListener("transitionend", handler);
    });
  });

  popupClose.addEventListener("click", () => popup.classList.remove("show"));
});
