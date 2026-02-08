
export function createSalesChart(canvasId) {
const ctx = document.getElementById(canvasId);
if (!ctx) return null;

return new Chart(ctx, {
    type: "bar",
    data: {
    labels: [],
    datasets: [
        {
        label: "Top Items (Qty)",
        data: [],
        backgroundColor: ["#FF8C3A", "#FFD400", "#66B2FF"], // ✅ your colours here
        borderRadius: 8,
        },
    ],
    },
    options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
        x: { grid: { display: false } },
        y: { grid: { color: "rgba(15,23,42,0.06)" }, ticks: { precision: 0 } },
    },
    },
});
}

export function updateSalesChart(chart, labels, data) {
if (!chart) return;
chart.data.labels = labels;
chart.data.datasets[0].data = data;
// keep colours matching number of bars (optional)
chart.data.datasets[0].backgroundColor = ["#FF8C3A", "#FFD400", "#66B2FF"].slice(0, labels.length);
chart.update();
}

export function createFeedbackChart(canvasId) {
const ctx = document.getElementById(canvasId);
if (!ctx) return null;

return new Chart(ctx, {
    type: "doughnut",
    data: {
    labels: ["Positive (4-5)", "Neutral (3)", "Negative (1-2)"],
    datasets: [
        {
        data: [0, 0, 0],
        backgroundColor: ["#22C55E", "#FFD400", "#EF4444"],
        },
    ],
    },
    options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "bottom" } },
    },
});
}

export function updateFeedbackChart(chart, pos, neu, neg) {
if (!chart) return;
chart.data.datasets[0].data = [pos, neu, neg];
chart.update();
}

export function createHygieneChart(canvasId) {
const ctx = document.getElementById(canvasId);
if (!ctx) return null;

return new Chart(ctx, {
    type: "line",
    data: {
    labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    datasets: [
        {
        label: "Hygiene Grade",
        data: new Array(12).fill(null), // use null for missing months
        borderColor: "#FF8C3A",         // soft blue
        backgroundColor: "rgba(255,140,58,0.15)",
        tension: 0,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: "#FF8C3A",
        fill: true,
        },
    ],
    },
    options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
        callbacks: {
            label: (ctx) => {
            const v = ctx.raw;
            if (v === 4) return "Grade A";
            if (v === 3) return "Grade B";
            if (v === 2) return "Grade C";
            if (v === 1) return "Grade D";
            return "No data";
            },
        },
        },
    },
    scales: {
        y: {
        min: 0,
        max: 4,
        ticks: {
            stepSize: 1,
            callback: (value) => {
            if (value === 4) return "A";
            if (value === 3) return "B";
            if (value === 2) return "C";
            if (value === 1) return "D";
            return "";
            },
        },
        },
        x: { grid: { display: false } },
    },
    },
});
}


export function updateHygieneChart(chart, scores12) {
if (!chart) return;
chart.data.datasets[0].data = scores12;
chart.update();
}
