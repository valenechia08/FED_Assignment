document.addEventListener("DOMContentLoaded", () => {

  /* ===== Rating Costs Donut Chart ===== */
  const costsCtx = document.getElementById("costsDonut");

  if (costsCtx) {
    new Chart(costsCtx, {
      type: "doughnut",
      data: {
        labels: [
          "Cost in time frame",
          "Cost per application",
          "Cost per sale"
        ],
        datasets: [{
          data: [41017.77, 57907.44, 21715.29],
          backgroundColor: [
            "#7C9CFF", // blue
            "#9FE870", // green
            "#FDBA74"  // orange
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        cutout: "70%",
        plugins: {
          legend: {
            position: "right"
          },
          tooltip: {
            callbacks: {
              label: (ctx) =>
                `${ctx.label}: $${ctx.raw.toLocaleString()}`
            }
          }
        }
      }
    });
  }

  /* ===== Order Bar Chart ===== */
  const leadsCtx = document.getElementById("leadsBar");

if (leadsCtx) {
  new Chart(leadsCtx, {
    type: "bar",
    data: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May","Jun", "Jul", "Aug", "Sep", "Oct","Nov", "Dec"],
      datasets: [
        {
          label: "Completed",
          data: [230, 130, 200, 190, 240],
          backgroundColor: "#9FE870"
        },
        {
          label: "Cancelled",
          data: [420, 350, 160, 590, 450],
          backgroundColor: "#ff7c7c"
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          stacked: true,
          grid: { display: false }
        },
        y: {
          stacked: true,
          beginAtZero: true,
          max: 1000,
          grid: { color: "#E5E7EB" }
        }
      },
      plugins: {
        legend: {
          position: "bottom"
        }
      }
    }
  });
}

  /* ===== Total Leads by Vendor ===== */
  const totalLeadsCtx = document.getElementById("totalLeadsBar");

  if (totalLeadsCtx) {
    new Chart(totalLeadsCtx, {
      type: "bar",
      data: {
        labels: [
          "Vendor A",
          "Vendor B",
          "Vendor C",
          "Vendor D",
          "Vendor E",
          "Vendor F"
        ],
        datasets: [
          {
            label: "Total Leads",
            data: [220, 160, 120, 260, 230, 180],
            backgroundColor: "#7C9CFF"
          },
          {
            label: "Qualified Leads",
            data: [140, 120, 90, 190, 150, 130],
            backgroundColor: "#9FE870"
          },
          {
            label: "Converted Leads",
            data: [80, 60, 30, 130, 90, 70],
            backgroundColor: "#FDBA74"
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 300
          }
        },
        plugins: {
          legend: {
            position: "bottom"
          }
        }
      }
    });
  }

});
