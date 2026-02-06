      function sum(arr) { return arr.reduce((a, b) => a + b, 0); }
      function maxIndex(arr) {
        let idx = 0;
        for (let i = 1; i < arr.length; i++) if (arr[i] > arr[idx]) idx = i;
        return idx;
      }
      function percentChange(current, previous) {
        if (previous === 0) return 0;
        return ((current - previous) / previous) * 100;
      }
      function fmtPct(n) { const sign = n >= 0 ? "+" : ""; return `${sign}${n.toFixed(1)}%`; }
      function setDelta(el, value) {
        el.textContent = fmtPct(value);
        el.classList.remove("up", "down");
        el.classList.add(value >= 0 ? "up" : "down");
      }

      /* ========= NAV JS (dropdown + hamburger) ========= */
      document.querySelectorAll(".menu-item > a").forEach((a) => {
        a.addEventListener("click", (e) => {
          const item = a.parentElement;
          const dropdown = item.querySelector(".dropdown");
          if (dropdown) {
            e.preventDefault();
            document.querySelectorAll(".menu-item").forEach((i) => {
              if (i !== item) i.classList.remove("active");
            });
            item.classList.toggle("active");
          }
        });
      });

      const hamburger = document.getElementById("hamburger");
      const menu = document.getElementById("menu");
      if (hamburger && menu) {
        hamburger.addEventListener("click", () => menu.classList.toggle("show"));
      }

      /* ========= Data by filter ========= */
      const salesDataByFilter = {
        month:  { labels: ["Set Meal A", "Set Meal B", "Set Meal C","Set Meal D","1 Pcs Spicy Fish Otah",,"5 Pcs Spicy Fish Otah"], data: [50, 40, 12] },
        "3months": { labels: ["Set Meal A", "Set Meal B", "Set Meal C","Set Meal D","1 Pcs Spicy Fish Otah","5 Pcs Spicy Fish Otah"], data: [150, 120, 40] },
        "6months": { labels: ["Set Meal A", "Set Meal B", "Set Meal C","Set Meal D","1 Pcs Spicy Fish Otah","5 Pcs Spicy Fish Otah"], data: [300, 250, 90] }
      };

      const feedbackDataByFilter = {
        month:    [3.4, 11.4, 22.7, 34.1, 28.4],
        "3months":[8.2, 5.1, 30.6, 35.7, 20.4],
        "6months":[2.3, 17.2, 23, 34.5, 23]
      };

      /* ========= HYGIENE DATA (by year) ========= */
      const salesDataByYear = {
      2026: {
        labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
        data: [120, 135, 110, 150, 180, 200, 170, 165, 190, 210, 230, 220]
      },
      2025: {
        labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
        data: [90, 100, 95, 120, 140, 160, 155, 150, 170, 185, 190, 200]
      },
      2024: {
        labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
        data: [60, 70, 65, 80, 95, 110, 105, 100, 120, 130, 140, 150]
      }
    };

      /* ========= Charts ========= */
      const salesChart = new Chart(document.getElementById("salesChart"), {
        type: "bar",
        data: {
          labels: salesDataByFilter.month.labels,
          datasets: [{
            label: "Orders",
            data: salesDataByFilter.month.data,
            backgroundColor: ["#FF8C3A", "#FFD400", "#66B2FF"]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false } },
            y: { grid: { color: "rgba(15,23,42,0.06)" }, ticks: { precision: 0 } }
          }
        }
      });

      const feedbackChart = new Chart(document.getElementById("feedbackChart"), {
        type: "doughnut",
        data: {
          labels: ["1★", "2★", "3★", "4★", "5★"],
          datasets: [{
            data: feedbackDataByFilter.month,
            backgroundColor: ["#ff4d4d", "#ff944d", "#ffd11a", "#99cc00", "#33cc33"],
            borderWidth: 2,
            borderColor: "#ffffff"
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "68%",
          plugins: {
            legend: {
              position: "top",
              labels: { boxWidth: 14, boxHeight: 10, padding: 16 }
            }
          }
        }
      });

      const defaultYear = "2026";

      const salesYearChart = new Chart(document.getElementById("hygieneChart"), {
      type: "line",
      data: {
        labels: salesDataByYear[defaultYear].labels,
        datasets: [{
          label: "Monthly Sales",
          data: salesDataByYear[defaultYear].data,
          borderColor: "#FF8C3A",
          backgroundColor: "rgba(255,140,58,0.12)",
          tension: 0,          // straight lines
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            beginAtZero: true,
            title: { display: true, text: "Number of Orders" },
            ticks: { precision: 0 },
            grid: { color: "rgba(15,23,42,0.06)" }
          }
        }
      }
    });


      /* ========= KPI + Insights updater ========= */
      function updateKPIsAndInsights() {
        const salesFilter = document.getElementById("salesFilter").value;
        const feedbackFilter = document.getElementById("feedbackFilter").value;
        const hygieneYear = document.getElementById("hygieneFilter").value;

        // --- Sales KPIs
        const salesNow = salesDataByFilter[salesFilter].data;
        const salesPrev =
          salesFilter === "month" ? salesDataByFilter["3months"].data
          : salesFilter === "3months" ? salesDataByFilter["6months"].data
          : salesDataByFilter["3months"].data;

        const totalOrdersNow = sum(salesNow);
        const totalOrdersPrev = sum(salesPrev);
        const ordersDelta = percentChange(totalOrdersNow, totalOrdersPrev);

        const idxTop = maxIndex(salesNow);
        const topName = salesDataByFilter[salesFilter].labels[idxTop];
        const topVal = salesNow[idxTop];
        const topShare = (topVal / totalOrdersNow) * 100;

        document.getElementById("kpiTotalOrders").textContent = totalOrdersNow.toLocaleString();
        document.getElementById("kpiOrdersSub").textContent =
          salesFilter === "month" ? "This Month"
          : salesFilter === "3months" ? "Last 3 Months"
          : "Last 6 Months";
        setDelta(document.getElementById("kpiOrdersDelta"), ordersDelta);

        document.getElementById("kpiTopItem").textContent = topName;
        document.getElementById("kpiTopItemSub").textContent = `Share: ${topShare.toFixed(1)}%`;
        document.getElementById("kpiTopItemBadge").textContent = topShare >= 45 ? "Hot" : "Steady";

        document.getElementById("salesInsightText").textContent = `Top seller is ${topName} with`;
        document.getElementById("salesInsightStrong").textContent = `${topVal} orders (${topShare.toFixed(1)}%)`;

        // --- Feedback KPIs
        const fb = feedbackDataByFilter[feedbackFilter];
        const totalFb = sum(fb);
        const avgRating = (1*fb[0] + 2*fb[1] + 3*fb[2] + 4*fb[3] + 5*fb[4]) / totalFb;
        const positiveShare = ((fb[3] + fb[4]) / totalFb) * 100;
        const avgLabel = `${avgRating.toFixed(2)}★`;

        document.getElementById("kpiAvgRating").textContent = avgLabel;
        document.getElementById("kpiRatingSub").textContent = `4★–5★ share: ${positiveShare.toFixed(1)}%`;
        document.getElementById("kpiRatingBadge").textContent =
          positiveShare >= 60 ? "Strong" : positiveShare >= 45 ? "Okay" : "Needs work";

        document.getElementById("feedbackInsightText").textContent = `Positive feedback (4★–5★) is`;
        document.getElementById("feedbackInsightStrong").textContent = `${positiveShare.toFixed(1)}%`;

        // --- Sales KPIs (year)
        const sales = salesDataByYear[hygieneYear].data;
        const totalSales = sum(sales);
        const avgMonthly = totalSales / sales.length;
        const bestMonth = Math.max(...sales);

        document.getElementById("kpiInspectScore").textContent =
          totalSales.toLocaleString();

        document.getElementById("kpiInspectSub").textContent =
          `Year ${hygieneYear}`;

        document.getElementById("hygieneInsightText").textContent =
          `Best month sales in ${hygieneYear} reached`;

        document.getElementById("hygieneInsightStrong").textContent =
          `${bestMonth} orders`;
        }

      /* ========= Filter handlers ========= */
      document.getElementById("salesFilter").addEventListener("change", function () {
        const pack = salesDataByFilter[this.value];
        salesChart.data.labels = pack.labels;
        salesChart.data.datasets[0].data = pack.data;
        salesChart.update();
        updateKPIsAndInsights();
      });

      document.getElementById("feedbackFilter").addEventListener("change", function () {
        feedbackChart.data.datasets[0].data = feedbackDataByFilter[this.value];
        feedbackChart.update();
        updateKPIsAndInsights();
      });

      document.getElementById("hygieneFilter").addEventListener("change", function () {
        const pack = salesDataByYear[year];
salesYearChart.data.labels = pack.labels;
salesYearChart.data.datasets[0].data = pack.data;
salesYearChart.update();

      });

      // Initial render
      document.getElementById("hygieneFilter").value = defaultYear;
      updateKPIsAndInsights();