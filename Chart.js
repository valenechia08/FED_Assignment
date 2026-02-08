/* ==============================
   Chart.js (FULL WORKING CODE)
   - Top 3 Picks (bar) from /orders
   - Customer Feedback (doughnut) from /demo_feedback
   - Total Sales (STRAIGHT line) from /orders by year
   - Safe if feedback table doesn't exist
   - Prevents crashes + ensures charts render
================================ */

import { getApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

/* ========= CONFIG ========= */
const STALL_NAME = "Banana Leaf Nasi Lemak";

/* ========= Firebase ========= */
const app = getApp();
const db = getDatabase(app);

/* ========= Helpers ========= */
function $(id) {
  return document.getElementById(id);
}

function safeText(el, text) {
  if (el) el.textContent = text;
}

function assertChartReady() {
  if (!window.Chart) {
    console.error(
      "[Chart.js] Chart.js CDN not loaded. Make sure this is above your module:\n<script src='https://cdn.jsdelivr.net/npm/chart.js'></script>"
    );
    return false;
  }
  return true;
}

function getWindowMsFromFilter(v) {
  if (v === "month") return 30 * 24 * 60 * 60 * 1000;
  if (v === "3months") return 90 * 24 * 60 * 60 * 1000;
  if (v === "6months") return 180 * 24 * 60 * 60 * 1000;
  return 30 * 24 * 60 * 60 * 1000;
}

function filterLabelFromFilter(v) {
  return v === "month" ? "This Month" : v === "3months" ? "Last 3 Months" : "Last 6 Months";
}

/* ========= HTML IDs (MATCH YOUR HTML) ========= */
const el = {
  // filters
  orderFilter: $("orderFilter"),
  feedbackFilter: $("feedbackFilter"),
  yearFilter: $("SalesFilter"),

  // canvases
  salesCanvas: $("salesChart"),
  feedbackCanvas: $("feedbackChart"),
  yearCanvas: $("SalesChart"),

  // KPI
  kpiTotalOrders: $("kpiTotalOrders"),
  kpiOrdersSub: $("kpiOrdersSub"),
  kpiTopItem: $("kpiTopItem"),
  kpiTopItemSub: $("kpiTopItemSub"),
  kpiTopItemBadge: $("kpiTopItemBadge"),

  kpiAvgRating: $("kpiAvgRating"),
  kpiRatingSub: $("kpiRatingSub"),
  kpiRatingBadge: $("kpiRatingBadge"),

  kpiInspectScore: $("kpiInspectScore"),
  kpiInspectSub: $("kpiInspectSub"),

  // insight rows
  orderInsightText: $("orderInsightText"),
  orderInsightStrong: $("orderInsightStrong"),

  feedbackInsightText: $("feedbackInsightText"),
  feedbackInsightStrong: $("feedbackInsightStrong"),

  salesInsightText: $("SalesInsightText"),
  salesInsightStrong: $("SalesInsightStrong"),
};

/* ========= Stall name detection ========= */
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
  return it?.stallName || it?.stall || it?.stall_name || it?.stallTitle || "";
}

function matchesStall(order, it) {
  const s1 = String(getOrderStall(order) || "").trim();
  const s2 = String(getItemStall(it) || "").trim();
  if (s1) return s1 === STALL_NAME;
  if (s2) return s2 === STALL_NAME;
  return false;
}

function getCreatedAtMs(order) {
  const n = Number(order?.createdAt);
  if (Number.isFinite(n) && n > 0) return n;

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
  const totals = new Map();
  let totalQtyAllItems = 0;

  if (!ordersObj) return { top: [], totalQtyAllItems: 0 };

  Object.values(ordersObj).forEach((order) => {
    const created = getCreatedAtMs(order);
    if (created > 0 && created < cutoff) return;

    const items = order?.items;
    if (!Array.isArray(items)) return;

    items.forEach((it) => {
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

/* ========= Feedback aggregation (demo_feedback) ========= */
function getFeedbackCreatedAtMs(fb) {
  const n = Number(fb?.createdAt);
  if (Number.isFinite(n) && n > 0) return n;

  if (typeof fb?.createdAt === "string") {
    const t = Date.parse(fb.createdAt);
    return Number.isFinite(t) ? t : 0;
  }
  return 0;
}

function computeFeedbackBins(feedbackObj, windowMs) {
  const cutoff = Date.now() - windowMs;
  const bins = [0, 0, 0, 0, 0];

  if (!feedbackObj) return bins;

  Object.values(feedbackObj).forEach((fb) => {
    const created = getFeedbackCreatedAtMs(fb);
    if (created > 0 && created < cutoff) return;

    const stall = String(fb?.stallName || fb?.stall || "").trim();
    if (stall && stall !== STALL_NAME) return;

    const r = Number(fb?.rating);
    if (!Number.isFinite(r)) return;

    const star = Math.max(1, Math.min(5, Math.round(r)));
    bins[star - 1] += 1;
  });

  return bins;
}

function avgRatingFromBins(bins) {
  const total = bins.reduce((a, b) => a + b, 0);
  if (!total) return 0;
  const sum = 1 * bins[0] + 2 * bins[1] + 3 * bins[2] + 4 * bins[3] + 5 * bins[4];
  return sum / total;
}

/* ========= Yearly sales aggregation ========= */
function computeYearlyMonthlyOrders(ordersObj, year) {
  const labels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const data = new Array(12).fill(0);

  if (!ordersObj) return { labels, data };

  Object.values(ordersObj).forEach((order) => {
    const created = getCreatedAtMs(order);
    if (!created) return;

    const d = new Date(created);
    if (d.getFullYear() !== Number(year)) return;

    const items = order?.items;
    if (!Array.isArray(items)) return;

    let qtyForThisStall = 0;
    items.forEach((it) => {
      if (!matchesStall(order, it)) return;
      qtyForThisStall += getQty(it);
    });

    if (qtyForThisStall <= 0) return;
    data[d.getMonth()] += qtyForThisStall;
  });

  return { labels, data };
}

/* ========= Charts ========= */
let top3Chart = null;
let feedbackChart = null;
let yearlyChart = null;

function initChartsIfPossible() {
  if (!assertChartReady()) return;

  // Top 3 Picks (bar)
  if (el.salesCanvas && !top3Chart) {
    top3Chart = new window.Chart(el.salesCanvas, {
      type: "bar",
      data: {
        labels: ["—"],
        datasets: [{
          label: "Orders",
          data: [0],
          backgroundColor: ["#FF8C3A", "#FFD400", "#66B2FF"],
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, ticks: { precision: 0 } }
        }
      }
    });
  }

  // Customer Feedback (doughnut) — visible placeholder first
  if (el.feedbackCanvas && !feedbackChart) {
    feedbackChart = new window.Chart(el.feedbackCanvas, {
      type: "doughnut",
      data: {
        labels: ["1★", "2★", "3★", "4★", "5★"],
        datasets: [{
          data: [1, 1, 1, 1, 1],
          backgroundColor: ["#ff4d4d", "#ff944d", "#ffd11a", "#99cc00", "#33cc33"],
          borderWidth: 2,
          borderColor: "#ffffff"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "68%",
        plugins: { legend: { position: "top" } }
      }
    });
  }

  // Total Sales (line) — straight line
  if (el.yearCanvas && !yearlyChart) {
    yearlyChart = new window.Chart(el.yearCanvas, {
      type: "line",
      data: {
        labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
        datasets: [{
          label: "Monthly Sales",
          data: new Array(12).fill(0),
          borderColor: "#FF8C3A",
          tension: 0,
          fill: false,
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: true } },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, ticks: { precision: 0 } }
        }
      }
    });
  }
}

/* ========= Renderers ========= */
function renderTop3UI({ top, totalQtyAllItems }, filterValue) {
  safeText(el.kpiTotalOrders, totalQtyAllItems.toLocaleString());
  safeText(el.kpiOrdersSub, filterLabelFromFilter(filterValue));

  if (top3Chart) {
    const labels = top.map(x => x.name);
    const data = top.map(x => x.qty);
    top3Chart.data.labels = labels.length ? labels : ["—"];
    top3Chart.data.datasets[0].data = data.length ? data : [0];
    top3Chart.update();
  }

  if (!top.length || totalQtyAllItems === 0) {
    safeText(el.kpiTopItem, "—");
    safeText(el.kpiTopItemSub, "Share: —");
    safeText(el.kpiTopItemBadge, "—");
    safeText(el.orderInsightText, "No orders found for this period");
    safeText(el.orderInsightStrong, "");
    return;
  }

  const best = top[0];
  const share = (best.qty / totalQtyAllItems) * 100;

  safeText(el.kpiTopItem, best.name);
  safeText(el.kpiTopItemSub, `Share: ${share.toFixed(1)}%`);
  safeText(el.kpiTopItemBadge, share >= 45 ? "Hot" : "Steady");

  safeText(el.orderInsightText, `Top seller is ${best.name} with`);
  safeText(el.orderInsightStrong, `${best.qty} orders (${share.toFixed(1)}%)`);
}

function renderFeedbackUI(bins) {
  const total = bins.reduce((a, b) => a + b, 0);
  const plotBins = total ? bins : [1, 1, 1, 1, 1];

  if (feedbackChart) {
    feedbackChart.data.datasets[0].data = plotBins;
    feedbackChart.update();
  }

  const avg = avgRatingFromBins(bins);
  const positiveShare = total ? ((bins[3] + bins[4]) / total) * 100 : 0;

  safeText(el.kpiAvgRating, total ? `${avg.toFixed(2)}★` : "—");
  safeText(el.kpiRatingSub, total ? `4★–5★ share: ${positiveShare.toFixed(1)}%` : "No feedback");
  safeText(
    el.kpiRatingBadge,
    !total ? "—" : positiveShare >= 60 ? "Strong" : positiveShare >= 45 ? "Okay" : "Needs work"
  );

  safeText(el.feedbackInsightText, "Positive feedback (4★–5★) is");
  safeText(el.feedbackInsightStrong, total ? `${positiveShare.toFixed(1)}%` : "—");
}

function renderYearlyUI({ labels, data }, year) {
  if (yearlyChart) {
    yearlyChart.data.labels = labels;
    yearlyChart.data.datasets[0].data = data;
    yearlyChart.update();
  }

  const totalSales = data.reduce((a, b) => a + b, 0);
  const bestMonth = data.length ? Math.max(...data) : 0;

  safeText(el.kpiInspectScore, totalSales.toLocaleString());
  safeText(el.kpiInspectSub, `Year ${year}`);

  safeText(el.salesInsightText, `Best month sales in ${year} reached`);
  safeText(el.salesInsightStrong, `${bestMonth} orders`);
}

/* ========= Live listeners ========= */
let latestOrders = null;
let latestFeedback = null;

function refreshTop3() {
  const filterValue = el.orderFilter?.value || "month";
  const windowMs = getWindowMsFromFilter(filterValue);
  const { top, totalQtyAllItems } = computeTopItemsFromOrders(latestOrders, windowMs, 3);
  renderTop3UI({ top, totalQtyAllItems }, filterValue);
}

function refreshFeedback() {
  const filterValue = el.feedbackFilter?.value || "month";
  const windowMs = getWindowMsFromFilter(filterValue);
  const bins = computeFeedbackBins(latestFeedback, windowMs);
  renderFeedbackUI(bins);
}

function refreshYearly() {
  const year = el.yearFilter?.value || "2026";
  const pack = computeYearlyMonthlyOrders(latestOrders, year);
  renderYearlyUI(pack, year);
}

/* ========= Wire filters ========= */
el.orderFilter?.addEventListener("change", refreshTop3);
el.feedbackFilter?.addEventListener("change", refreshFeedback);
el.yearFilter?.addEventListener("change", refreshYearly);

/* ========= Init ========= */
window.addEventListener("DOMContentLoaded", () => {
  initChartsIfPossible();

  onValue(ref(db, "orders"), (snap) => {
    latestOrders = snap.val() || {};
    refreshTop3();
    refreshYearly();
  });

  onValue(ref(db, "demo_feedback"), (snap) => {
    latestFeedback = snap.exists() ? snap.val() : {};
    refreshFeedback();
  });

  refreshTop3();
  refreshFeedback();
  refreshYearly();
});
