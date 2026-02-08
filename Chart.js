import { getApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

/* ========= CONFIG ========= */
const STALL_NAME = "Banana Leaf Nasi Lemak";

/* ========= Firebase ========= */
const app = getApp();
const db = getDatabase(app);

/* ========= HTML IDs (MATCH YOUR HTML) ========= */
const el = {
  // filter + chart
  orderFilter: document.getElementById("orderFilter"),
  salesCanvas: document.getElementById("salesChart"),

  // KPI
  kpiTotalOrders: document.getElementById("kpiTotalOrders"),
  kpiOrdersSub: document.getElementById("kpiOrdersSub"),
  kpiTopItem: document.getElementById("kpiTopItem"),
  kpiTopItemSub: document.getElementById("kpiTopItemSub"),
  kpiTopItemBadge: document.getElementById("kpiTopItemBadge"),

  // insight row
  orderInsightText: document.getElementById("orderInsightText"),
  orderInsightStrong: document.getElementById("orderInsightStrong"),
};

function getWindowMs() {
  const v = el.orderFilter?.value || "month";
  if (v === "month") return 30 * 24 * 60 * 60 * 1000;
  if (v === "3months") return 90 * 24 * 60 * 60 * 1000;
  if (v === "6months") return 180 * 24 * 60 * 60 * 1000;
  return 30 * 24 * 60 * 60 * 1000;
}

function filterLabel() {
  const v = el.orderFilter?.value || "month";
  return v === "month" ? "This Month" : v === "3months" ? "Last 3 Months" : "Last 6 Months";
}

/* ========= Stall name detection (robust) ========= */
function getOrderStall(order) {
  return (
    order?.stallName ||
    order?.stall ||
    order?.stall_name ||
    order?.stallTitle ||
    order?.stalltitle ||
    ""
  );
}
function getItemStall(it) {
  return (
    it?.stallName ||
    it?.stall ||
    it?.stall_name ||
    it?.stallTitle ||
    ""
  );
}
function matchesStall(order, it) {
  const s1 = String(getOrderStall(order) || "").trim();
  const s2 = String(getItemStall(it) || "").trim();

  // if either exists, allow match
  if (s1) return s1 === STALL_NAME;
  if (s2) return s2 === STALL_NAME;

  // If your schema doesn’t store stall name at all, nothing can be filtered.
  return false;
}

function getCreatedAtMs(order) {
  // your sample uses createdAt as a number
  const n = Number(order?.createdAt);
  if (Number.isFinite(n) && n > 0) return n;

  // fallbacks
  const n2 = Number(order?.createdAtMs);
  if (Number.isFinite(n2) && n2 > 0) return n2;

  if (typeof order?.createdAt === "string") {
    const t = Date.parse(order.createdAt);
    return Number.isFinite(t) ? t : 0;
  }
  return 0;
}

function getItemName(it) {
  return String(it?.item || it?.name || "").trim();
}
function getQty(it) {
  const q = Number(it?.qty ?? it?.quantity ?? 1);
  return Number.isFinite(q) && q > 0 ? q : 1;
}

/* ========= Compute Top N ========= */
function computeTopItemsFromOrders(ordersObj, windowMs, topN = 3) {
  const cutoff = Date.now() - windowMs;
  const totals = new Map(); // itemName -> qty
  let totalQtyAllItems = 0;

  if (!ordersObj) return { top: [], totalQtyAllItems: 0 };

  Object.values(ordersObj).forEach((order) => {
    const created = getCreatedAtMs(order);
    if (created > 0 && created < cutoff) return;

    const items = order?.items;
    if (!Array.isArray(items)) return;

    items.forEach((it) => {
      // only include this stall
      if (!matchesStall(order, it)) return;

      const name = getItemName(it);
      if (!name) return;

      const qty = getQty(it);
      totalQtyAllItems += qty;

      totals.set(name, (totals.get(name) || 0) + qty);
    });
  });

  const sorted = [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([name, qty]) => ({ name, qty }));

  return { top: sorted, totalQtyAllItems };
}

/* ========= Chart (Top 3 Picks) ========= */
const salesChart = new Chart(el.salesCanvas, {
  type: "bar",
  data: {
    labels: [],
    datasets: [{
      label: "Orders",
      data: [],
      backgroundColor: ["#FF8C3A", "#FFD400", "#66B2FF"],
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, grid: { color: "rgba(15,23,42,0.06)" }, ticks: { precision: 0 } }
    }
  }
});

/* ========= Render UI ========= */
function renderTop3UI({ top, totalQtyAllItems }) {
  // Total Orders KPI (for this stall + period)
  if (el.kpiTotalOrders) el.kpiTotalOrders.textContent = totalQtyAllItems.toLocaleString();
  if (el.kpiOrdersSub) el.kpiOrdersSub.textContent = filterLabel();

  // Chart
  const labels = top.map(x => x.name);
  const data = top.map(x => x.qty);

  salesChart.data.labels = labels.length ? labels : ["—"];
  salesChart.data.datasets[0].data = data.length ? data : [0];
  salesChart.update();

  // Top item KPI + insight
  if (!top.length || totalQtyAllItems === 0) {
    if (el.kpiTopItem) el.kpiTopItem.textContent = "—";
    if (el.kpiTopItemSub) el.kpiTopItemSub.textContent = "Share: —";
    if (el.kpiTopItemBadge) el.kpiTopItemBadge.textContent = "—";
    if (el.orderInsightText) el.orderInsightText.textContent = "No orders found for this period";
    if (el.orderInsightStrong) el.orderInsightStrong.textContent = "";
    return;
  }

  const best = top[0];
  const share = (best.qty / totalQtyAllItems) * 100;

  if (el.kpiTopItem) el.kpiTopItem.textContent = best.name;
  if (el.kpiTopItemSub) el.kpiTopItemSub.textContent = `Share: ${share.toFixed(1)}%`;
  if (el.kpiTopItemBadge) el.kpiTopItemBadge.textContent = share >= 45 ? "Hot" : "Steady";

  if (el.orderInsightText) el.orderInsightText.textContent = `Top seller is ${best.name} with`;
  if (el.orderInsightStrong) el.orderInsightStrong.textContent = `${best.qty} orders (${share.toFixed(1)}%)`;
}

/* ========= Live listener + filter updates ========= */
let latestOrders = null;

function refreshTop3() {
  const { top, totalQtyAllItems } = computeTopItemsFromOrders(latestOrders, getWindowMs(), 3);
  renderTop3UI({ top, totalQtyAllItems });
}

onValue(ref(db, "orders"), (snap) => {
  latestOrders = snap.val();
  refreshTop3();
});

el.orderFilter?.addEventListener("change", refreshTop3);



// /* ========= HTML IDs (from your HTML) ========= */
// const ids = {
//   // charts
//   salesCanvas: "salesChart",
//   feedbackCanvas: "feedbackChart",
//   yearCanvas: "SalesChart",

//   // filters
//   salesFilter: "orderFilter",
//   feedbackFilter: "feedbackFilter",
//   yearFilter: "SalesFilter",

//   // insights (sales + feedback + year)
//   salesInsightText: "orderInsightText",
//   salesInsightStrong: "orderInsightStrong",
//   feedbackInsightText: "feedbackInsightText",
//   feedbackInsightStrong: "feedbackInsightStrong",
//   yearInsightText: "SalesInsightText",
//   yearInsightStrong: "SalesInsightStrong",

//   // KPIs
//   kpiTotalOrders: "kpiTotalOrders",
//   kpiOrdersSub: "kpiOrdersSub",
//   kpiOrdersDelta: "kpiOrdersDelta",
//   kpiTopItem: "kpiTopItem",
//   kpiTopItemSub: "kpiTopItemSub",
//   kpiTopItemBadge: "kpiTopItemBadge",
//   kpiAvgRating: "kpiAvgRating",
//   kpiRatingSub: "kpiRatingSub",
//   kpiRatingBadge: "kpiRatingBadge",
//   kpiInspectScore: "kpiInspectScore",
//   kpiInspectSub: "kpiInspectSub"
//   // NOTE: your HTML has kpiInspectDelta but your previous logic never uses it
// };

// function $(id) { return document.getElementById(id); }

// /* ========= Build charts ========= */
// const salesChart = new Chart($(ids.salesCanvas), {
//   type: "bar",
//   data: {
//     labels: salesDataByFilter.month.labels,
//     datasets: [{
//       label: "Orders",
//       data: salesDataByFilter.month.data,
//       backgroundColor: ["#FF8C3A", "#FFD400", "#66B2FF", "#A78BFA", "#34D399", "#FB7185"]
//     }]
//   },
//   options: {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: { legend: { display: false } },
//     scales: {
//       x: { grid: { display: false } },
//       y: { grid: { color: "rgba(15,23,42,0.06)" }, ticks: { precision: 0 } }
//     }
//   }
// });

// const feedbackChart = new Chart($(ids.feedbackCanvas), {
//   type: "doughnut",
//   data: {
//     labels: ["1★", "2★", "3★", "4★", "5★"],
//     datasets: [{
//       data: feedbackDataByFilter.month,
//       backgroundColor: ["#ff4d4d", "#ff944d", "#ffd11a", "#99cc00", "#33cc33"],
//       borderWidth: 2,
//       borderColor: "#ffffff"
//     }]
//   },
//   options: {
//     responsive: true,
//     maintainAspectRatio: false,
//     cutout: "68%",
//     plugins: {
//       legend: {
//         position: "top",
//         labels: { boxWidth: 14, boxHeight: 10, padding: 16 }
//       }
//     }
//   }
// });

// const defaultYear = "2026";

// const salesYearChart = new Chart($(ids.yearCanvas), {
//   type: "line",
//   data: {
//     labels: salesDataByYear[defaultYear].labels,
//     datasets: [{
//       label: "Monthly Sales",
//       data: salesDataByYear[defaultYear].data,
//       borderColor: "#FF8C3A",
//       backgroundColor: "rgba(255,140,58,0.12)",
//       tension: 0,
//       fill: true,
//       pointRadius: 4,
//       pointHoverRadius: 6
//     }]
//   },
//   options: {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: { legend: { display: true } },
//     scales: {
//       x: { grid: { display: false } },
//       y: {
//         beginAtZero: true,
//         title: { display: true, text: "Number of Orders" },
//         ticks: { precision: 0 },
//         grid: { color: "rgba(15,23,42,0.06)" }
//       }
//     }
//   }
// });

// attachMostOrderedListenerCached(db);

// /* ========= KPI + Insights updater (aligned to your HTML ids) ========= */
// function updateKPIsAndInsights() {
//   const salesFilter = $(ids.salesFilter).value;      // orderFilter in HTML
//   const feedbackFilter = $(ids.feedbackFilter).value;
//   const year = $(ids.yearFilter).value;              // SalesFilter in HTML

//   // --- Sales KPIs (Top 3 Picks card)
//   const salesNow = salesDataByFilter[salesFilter].data;
//   const salesPrev =
//     salesFilter === "month" ? salesDataByFilter["3months"].data
//     : salesFilter === "3months" ? salesDataByFilter["6months"].data
//     : salesDataByFilter["3months"].data;

//   const totalOrdersNow = sum(salesNow);
//   const totalOrdersPrev = sum(salesPrev);
//   const ordersDelta = percentChange(totalOrdersNow, totalOrdersPrev);

//   const idxTop = maxIndex(salesNow);
//   const topName = salesDataByFilter[salesFilter].labels[idxTop];
//   const topVal = salesNow[idxTop];
//   const topShare = totalOrdersNow ? (topVal / totalOrdersNow) * 100 : 0;

//   $(ids.kpiTotalOrders).textContent = totalOrdersNow.toLocaleString();
//   $(ids.kpiOrdersSub).textContent =
//     salesFilter === "month" ? "This Month"
//     : salesFilter === "3months" ? "Last 3 Months"
//     : "Last 6 Months";
//   setDelta($(ids.kpiOrdersDelta), ordersDelta);

//   $(ids.kpiTopItem).textContent = topName;
//   $(ids.kpiTopItemSub).textContent = `Share: ${topShare.toFixed(1)}%`;
//   $(ids.kpiTopItemBadge).textContent = topShare >= 45 ? "Hot" : "Steady";

//   $(ids.salesInsightText).textContent = `Top seller is ${topName} with`;
//   $(ids.salesInsightStrong).textContent = `${topVal} orders (${topShare.toFixed(1)}%)`;

//   // --- Feedback KPIs
//   const fb = feedbackDataByFilter[feedbackFilter];
//   const totalFb = sum(fb);
//   const avgRating = totalFb
//     ? (1*fb[0] + 2*fb[1] + 3*fb[2] + 4*fb[3] + 5*fb[4]) / totalFb
//     : 0;
//   const positiveShare = totalFb ? ((fb[3] + fb[4]) / totalFb) * 100 : 0;

//   $(ids.kpiAvgRating).textContent = `${avgRating.toFixed(2)}★`;
//   $(ids.kpiRatingSub).textContent = `4★–5★ share: ${positiveShare.toFixed(1)}%`;
//   $(ids.kpiRatingBadge).textContent =
//     positiveShare >= 60 ? "Strong" : positiveShare >= 45 ? "Okay" : "Needs work";

//   $(ids.feedbackInsightText).textContent = `Positive feedback (4★–5★) is`;
//   $(ids.feedbackInsightStrong).textContent = `${positiveShare.toFixed(1)}%`;

//   // --- Yearly Sales KPIs (your "Total Sales" section)
//   const yearData = salesDataByYear[year].data;
//   const totalSales = sum(yearData);
//   const bestMonth = yearData.length ? Math.max(...yearData) : 0;

//   $(ids.kpiInspectScore).textContent = totalSales.toLocaleString();
//   $(ids.kpiInspectSub).textContent = `Year ${year}`;

//   $(ids.yearInsightText).textContent = `Best month sales in ${year} reached`;
//   $(ids.yearInsightStrong).textContent = `${bestMonth} orders`;
// }

// /* ========= Filter handlers (aligned to your HTML ids) ========= */
// $(ids.salesFilter).addEventListener("change", function () {
//   const pack = salesDataByFilter[this.value];
//   salesChart.data.labels = pack.labels;
//   salesChart.data.datasets[0].data = pack.data;
//   salesChart.update();
//   updateKPIsAndInsights();
// });

// $(ids.feedbackFilter).addEventListener("change", function () {
//   feedbackChart.data.datasets[0].data = feedbackDataByFilter[this.value];
//   feedbackChart.update();
//   updateKPIsAndInsights();
// });

// $(ids.yearFilter).addEventListener("change", function () {
//   const year = this.value;
//   const pack = salesDataByYear[year];

//   salesYearChart.data.labels = pack.labels;
//   salesYearChart.data.datasets[0].data = pack.data;
//   salesYearChart.update();

//   updateKPIsAndInsights();
// });

// /* ========= Initial render ========= */
// $(ids.yearFilter).value = defaultYear;
// updateKPIsAndInsights();
