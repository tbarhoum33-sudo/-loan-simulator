const $ = id => document.getElementById(id);
    let simulation = null;

    function calculateLoan(amount, rate, type, months) {
      const monthlyRate = type === "EA"
        ? Math.pow(1 + rate / 100, 1 / 12) - 1
        : rate / 100;

      const payment = monthlyRate === 0
        ? amount / months
        : amount * monthlyRate /
          (1 - Math.pow(1 + monthlyRate, -months));

      let balance = amount;
      let totalPaid = 0;
      const rows = [];

      for (let month = 1; month <= months; month++) {
        const interest = balance * monthlyRate;
        const principal = month === months
          ? balance
          : Math.min(balance, payment - interest);

        const actualPayment = principal + interest;
        balance = Math.max(0, balance - principal);
        totalPaid += actualPayment;

        rows.push({
          month,
          payment: actualPayment,
          principal,
          interest,
          balance
        });
      }

      return {
        amount, rate, type, months,
        payment,
        totalPaid,
        totalInterest: totalPaid - amount,
        rows
      };
    }

    function formatMoney(value) {
      return new Intl.NumberFormat("es-CO", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    }

    function renderResults() {
      if (!simulation) return;

      $("payment").textContent = formatMoney(simulation.payment);
      $("interest").textContent = formatMoney(simulation.totalInterest);
      $("total").textContent = formatMoney(simulation.totalPaid);

      const tbody = $("schedule");
      tbody.replaceChildren();

      simulation.rows.forEach(row => {
        const tr = document.createElement("tr");
        const values = [
          row.month,
          formatMoney(row.payment),
          formatMoney(row.principal),
          formatMoney(row.interest),
          formatMoney(row.balance)
        ];

        values.forEach(value => {
          const td = document.createElement("td");
          td.textContent = value;
          tr.appendChild(td);
        });

        tbody.appendChild(tr);
      });

      $("results").hidden = false;
    }

    $("loanForm").addEventListener("submit", event => {
      event.preventDefault();

      const amount = Number($("amount").value);
      const rate = Number($("rate").value);
      const months = Number($("months").value);
      const type = $("rateType").value;

      if (
        !$("amount").value ||
        !$("rate").value ||
        !$("months").value ||
        !Number.isFinite(amount) ||
        !Number.isFinite(rate) ||
        amount <= 0 ||
        rate < 0 ||
        !Number.isSafeInteger(months) ||
        months < 1 ||
        months > 1200
      ) {
        $("error").textContent = "Ingresa datos válidos.";
        $("results").hidden = true;
        simulation = null;
        return;
      }

      simulation = calculateLoan(amount, rate, type, months);

      if (!Number.isFinite(simulation.totalPaid)) {
        $("error").textContent = "No se pudo calcular el préstamo.";
        $("results").hidden = true;
        simulation = null;
        return;
      }

      $("error").textContent = "";
      renderResults();
    });
