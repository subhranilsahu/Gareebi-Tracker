
/* ==========================================================================
   GAREEBI TRACKER — DASHBOARD SCRIPT (static/js/dashboard.js)
   Accounts removed, SVG interactive chart support, zero window refresh blocks.
   ========================================================================== */

<<<<<<< HEAD
window.onbeforeunload = null;

document.addEventListener('DOMContentLoaded', () => {

    /* --------------------------------------------------------------------------
       DOM REFERENCES
=======
document.addEventListener("DOMContentLoaded", () => {

  /* --------------------------------------------------------------------------
       1. DOM REFERENCES
>>>>>>> f881c6294dbdb41e84642037bc399938fddcad0c
       -------------------------------------------------------------------------- */
    const modal = document.getElementById('transaction-modal');
    const btnQuickIncome = document.getElementById('btn-quick-income');
    const btnQuickExpense = document.getElementById('btn-quick-expense');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');

    const txForm = document.getElementById('dashboard-tx-form');
    const txTypeInput = document.getElementById('tx-type');
    const tabExpense = document.getElementById('tab-expense');
    const tabIncome = document.getElementById('tab-income');
    const txAmount = document.getElementById('tx-amount');
    const txCategory = document.getElementById('tx-category');
    const txNote = document.getElementById('tx-note');

    const metricBalance = document.getElementById('metric-balance');
    const metricIncome = document.getElementById('metric-income');
    const metricExpense = document.getElementById('metric-expense');
    const metricSavings = document.getElementById('metric-savings');

    const tableBody = document.getElementById('transactions-table-body');

<<<<<<< HEAD
    // Chart HUD Elements
    const chartTooltip = document.getElementById('chart-tooltip');
    const tooltipTime = document.getElementById('tooltip-time');
    const tooltipVal = document.getElementById('tooltip-val');
    const chartNodes = document.querySelectorAll('.node-circle');
    const chartGuide = document.getElementById('chart-guide');
    const rangeButtons = document.querySelectorAll('.range-btn');
=======
  const tableBody = document.getElementById("transactions-table-body");
  const categoryList = document.getElementById("category-list");
  const monthFilter = document.getElementById("month-filter");
>>>>>>> f881c6294dbdb41e84642037bc399938fddcad0c

    /* --------------------------------------------------------------------------
       TRANSACTION STATE (Accounts removed)
       -------------------------------------------------------------------------- */
<<<<<<< HEAD
    let transactions = [
        {
            type: 'income',
            amount: 15000.00,
            category: 'Stipend / Freelance',
            note: 'Monthly development milestone',
            date: 'Nov 05, 2026'
=======

  let transactions = [];
  let editingTransactionId = null;
  let editingTransactionDate = null;
  let selectedMonth = "all";

  /* --------------------------------------------------------------------------
       3. MODAL CONTROLS
       -------------------------------------------------------------------------- */

  function openModal(type = "expense") {
    editingTransactionId = null;
    editingTransactionDate = null;

    txForm.reset();
    setType(type);

    modalTitle.textContent = "Log Transaction";
    submitBtn.textContent = "Save Entry";

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");

    txAmount.focus();
  }

  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");

    txForm.reset();

    editingTransactionId = null;
    editingTransactionDate = null;

    modalTitle.textContent = "Log Transaction";
    submitBtn.textContent = "Save Entry";

    setType("expense");
  }

  function setType(type) {
    txTypeInput.value = type;

    if (type === "income") {
      tabIncome.classList.add("active");
      tabExpense.classList.remove("active");
    } else {
      tabExpense.classList.add("active");
      tabIncome.classList.remove("active");
    }
  }

  function openEditModal(tx) {
    editingTransactionId = tx.id;
    editingTransactionDate = tx.date;

    setType(tx.type);

    txAmount.value = tx.amount;
    txCategory.value = tx.category;
    txAccount.value = tx.account;
    txNote.value = tx.note || "";

    modalTitle.textContent = "Edit Transaction";
    submitBtn.textContent = "Update Entry";

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");

    txAmount.focus();
  }

  btnQuickIncome.addEventListener("click", () => openModal("income"));
  btnQuickExpense.addEventListener("click", () => openModal("expense"));

  modalCloseBtn.addEventListener("click", closeModal);
  modalCancelBtn.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) {
      closeModal();
    }
  });

  tabExpense.addEventListener("click", () => setType("expense"));
  tabIncome.addEventListener("click", () => setType("income"));

  /* --------------------------------------------------------------------------
       4. CURRENCY FORMATTER
       -------------------------------------------------------------------------- */

  function formatINR(val) {
    return (
      "₹" +
      Number(val).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }

  /* --------------------------------------------------------------------------
       5. DATE PARSER
       Supports both old and new date formats.
       -------------------------------------------------------------------------- */

  function parseTransactionDate(date) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const [year, month, day] = date.split("-").map(Number);
      return new Date(year, month - 1, day);
    }

    return new Date(date);
  }

  function getMonthKey(date) {
    const txDate = parseTransactionDate(date);

    if (isNaN(txDate.getTime())) return null;

    return `${txDate.getFullYear()}-${String(
      txDate.getMonth() + 1
    ).padStart(2, "0")}`;
  }

  /* --------------------------------------------------------------------------
       6. MONTH FILTER
       -------------------------------------------------------------------------- */

  function getFilteredTransactions() {
    if (selectedMonth === "all") {
      return transactions;
    }

    return transactions.filter(
      (tx) => getMonthKey(tx.date) === selectedMonth
    );
  }

  function populateMonthFilter() {
    const previousSelection = selectedMonth;

    const months = [
      ...new Set(
        transactions
          .map((tx) => getMonthKey(tx.date))
          .filter(Boolean)
      ),
    ].sort().reverse();

    monthFilter.innerHTML = "";

    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = "All Months";
    monthFilter.appendChild(allOption);

    months.forEach((month) => {
      const [year, monthNumber] = month.split("-");

      const label = new Date(
        Number(year),
        Number(monthNumber) - 1
      ).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      });

      const option = document.createElement("option");
      option.value = month;
      option.textContent = label;

      monthFilter.appendChild(option);
    });

    selectedMonth = months.includes(previousSelection)
      ? previousSelection
      : "all";

    monthFilter.value = selectedMonth;
  }

  monthFilter.addEventListener("change", () => {
    selectedMonth = monthFilter.value;

    renderTable();
    updateMetrics();
    updateTopOutflows();
  });

  /* --------------------------------------------------------------------------
       7. METRIC COMPUTATIONS
       -------------------------------------------------------------------------- */

  function updateMetrics() {
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((t) => {
      const amount = Number(t.amount);

      if (t.type === "income") {
        totalIncome += amount;
      } else {
        totalExpense += amount;
      }
    });

    let monthlyIncome = 0;
    let monthlyExpense = 0;

    getFilteredTransactions().forEach((t) => {
      const amount = Number(t.amount);

      if (t.type === "income") {
        monthlyIncome += amount;
      } else {
        monthlyExpense += amount;
      }
    });

    const netBalance = totalIncome - totalExpense;
    const savingsStash = netBalance > 0 ? netBalance * 0.15 : 0;

    metricIncome.textContent = "+" + formatINR(monthlyIncome);
    metricExpense.textContent = "-" + formatINR(monthlyExpense);

    metricBalance.textContent =
      (netBalance < 0 ? "-" : "") + formatINR(Math.abs(netBalance));

    metricSavings.textContent = formatINR(savingsStash);
  }

  /* --------------------------------------------------------------------------
       8. TOP OUTFLOWS — DYNAMIC CATEGORY BREAKDOWN
       -------------------------------------------------------------------------- */

  function updateTopOutflows() {
    const categoryTotals = {};

    getFilteredTransactions().forEach((tx) => {
      if (tx.type !== "expense") return;

      categoryTotals[tx.category] =
        (categoryTotals[tx.category] || 0) + Number(tx.amount);
    });

    const sortedCategories = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1]);

    const totalExpense = sortedCategories.reduce(
      (sum, item) => sum + item[1],
      0
    );

    const topCategories = sortedCategories.slice(0, 4);

    categoryList.innerHTML = "";

    if (topCategories.length === 0) {
      categoryList.textContent = "No expenses for this period yet.";
      return;
    }

    topCategories.forEach(([category, amount]) => {
      const percentage = totalExpense
        ? (amount / totalExpense) * 100
        : 0;

      const item = document.createElement("div");
      item.className = "category-item";

      item.innerHTML = `
        <div class="cat-info">
          <span class="cat-name"></span>
          <span class="cat-pct font-tabular">${percentage.toFixed(1)}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill fill-amber" style="width: ${percentage}%"></div>
        </div>
      `;

      item.querySelector(".cat-name").textContent = category;
      categoryList.appendChild(item);
    });
  }

  /* --------------------------------------------------------------------------
       9. TABLE RENDERING
       -------------------------------------------------------------------------- */

  function renderTable() {
    tableBody.innerHTML = "";

    getFilteredTransactions().forEach((tx) => {
      const tr = document.createElement("tr");
      const isIncome = tx.type === "income";

      const typeCell = document.createElement("td");
      const badge = document.createElement("span");

      badge.className = `tx-badge ${isIncome ? "income" : "expense"}`;
      badge.textContent = isIncome ? "Income" : "Expense";
      typeCell.appendChild(badge);

      const categoryCell = document.createElement("td");
      categoryCell.style.cssText =
        "font-weight: 500; color: var(--text-primary);";
      categoryCell.textContent = tx.category;

      const noteCell = document.createElement("td");
      noteCell.style.color = "var(--text-muted)";
      noteCell.textContent = tx.note || "—";

      const accountCell = document.createElement("td");
      const accountChip = document.createElement("span");
      accountChip.className = "account-chip";
      accountChip.textContent = tx.account;
      accountCell.appendChild(accountChip);

      const dateCell = document.createElement("td");
      dateCell.style.color = "var(--text-muted)";
      dateCell.textContent = tx.date;

      const amountCell = document.createElement("td");
      amountCell.className =
        `text-right font-tabular ${isIncome ? "text-success" : "text-danger"}`;
      amountCell.style.fontWeight = "600";
      amountCell.textContent =
        `${isIncome ? "+" : "-"}${formatINR(tx.amount)}`;

      // Actions column
      const actionsCell = document.createElement("td");

      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.textContent = "Edit";
      editBtn.dataset.action = "edit";
      editBtn.dataset.id = tx.id;

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.textContent = "Delete";
      deleteBtn.dataset.action = "delete";
      deleteBtn.dataset.id = tx.id;

      [editBtn, deleteBtn].forEach((btn) => {
        btn.style.cssText = `
          padding: 7px 12px;
          margin: 2px;
          border-radius: 7px;
          border: 1px solid var(--border-color);
          background: var(--bg-secondary);
          cursor: pointer;
          font-family: inherit;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.2s ease;
        `;
      });

      // Edit button — premium blue
      editBtn.style.color = "#3B82F6";
      editBtn.style.borderColor = "rgba(59, 130, 246, 0.25)";

      // Delete button — subtle red
      deleteBtn.style.color = "var(--text-danger, #dc2626)";
      deleteBtn.style.borderColor = "rgba(239, 68, 68, 0.25)";

      actionsCell.append(editBtn, deleteBtn);

      tr.append(
        typeCell,
        categoryCell,
        noteCell,
        accountCell,
        dateCell,
        amountCell,
        actionsCell
      );

      tableBody.appendChild(tr);
    });
  }

  /* --------------------------------------------------------------------------
       10. EDIT AND DELETE ACTIONS
       -------------------------------------------------------------------------- */

  tableBody.addEventListener("click", async (e) => {
    const button = e.target.closest("button[data-action]");

    if (!button) return;

    const transactionId = Number(button.dataset.id);
    const action = button.dataset.action;

    const tx = transactions.find(
      (item) => Number(item.id) === transactionId
    );

    if (!tx) return;

    if (action === "edit") {
      openEditModal(tx);
    }

    if (action === "delete") {
      const confirmed = confirm(
        `Are you sure you want to delete "${tx.category}" transaction of ${formatINR(tx.amount)}?`
      );

      if (!confirmed) return;

      button.disabled = true;

      try {
        const response = await fetch(`/transactions/${transactionId}`, {
          method: "DELETE",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || "Transaction could not be deleted."
          );
        }

        await loadTransactions();

      } catch (error) {
        console.error("Transaction deletion error:", error);
        alert(error.message);
        button.disabled = false;
      }
    }
  });

  /* --------------------------------------------------------------------------
       11. FETCH TRANSACTIONS FROM DATABASE
       -------------------------------------------------------------------------- */

  async function loadTransactions() {
    try {
      const response = await fetch("/transactions");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Could not load transactions."
        );
      }

      transactions = result.transactions;

      populateMonthFilter();

      renderTable();
      updateMetrics();
      updateTopOutflows();

    } catch (error) {
      console.error("Transaction loading error:", error);
      alert("Could not load transactions. Please refresh the page.");
    }
  }

  /* --------------------------------------------------------------------------
       12. SAVE OR UPDATE TRANSACTION
       -------------------------------------------------------------------------- */

  txForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const amount = parseFloat(txAmount.value);

    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    const now = new Date();

    const todayDate = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
    ].join("-");

    const txData = {
      type: txTypeInput.value,
      amount: amount,
      category: txCategory.value.trim(),
      note: txNote.value.trim(),
      account: txAccount.value,
      date: editingTransactionDate || todayDate,
    };

    const isEditing = editingTransactionId !== null;

    try {
      submitBtn.disabled = true;

      const url = isEditing
        ? `/transactions/${editingTransactionId}`
        : "/transactions";

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
>>>>>>> f881c6294dbdb41e84642037bc399938fddcad0c
        },
        {
            type: 'expense',
            amount: 450.00,
            category: 'Food & Mess',
            note: 'Night mess snack',
            date: 'Nov 04, 2026'
        },
        {
            type: 'expense',
            amount: 300.00,
            category: 'Transit & Fuel',
            note: 'Metro card recharge',
            date: 'Nov 03, 2026'
        }
    ];

<<<<<<< HEAD
    /* --------------------------------------------------------------------------
       INTERACTIVE SVG CHART LOGIC
=======
      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Transaction could not be saved."
        );
      }

      closeModal();
      await loadTransactions();

    } catch (error) {
      console.error("Transaction saving error:", error);
      alert(error.message);

    } finally {
      submitBtn.disabled = false;
    }
  });

  /* --------------------------------------------------------------------------
       13. LOGOUT
>>>>>>> f881c6294dbdb41e84642037bc399938fddcad0c
       -------------------------------------------------------------------------- */
    if (chartNodes && chartTooltip) {
        chartNodes.forEach(node => {
            node.addEventListener('mouseenter', (e) => {
                const cx = e.target.getAttribute('cx');
                const val = e.target.getAttribute('data-val');
                const label = e.target.getAttribute('data-label');

                tooltipTime.textContent = label;
                tooltipVal.textContent = val;
                
                // Position tooltip relative to hovered node percentage
                const pct = (cx / 760) * 100;
                chartTooltip.style.left = `${pct}%`;
                chartTooltip.style.display = 'flex';

                if (chartGuide) {
                    chartGuide.setAttribute('x1', cx);
                    chartGuide.setAttribute('x2', cx);
                    chartGuide.style.display = 'block';
                }
            });

            node.addEventListener('mouseleave', () => {
                chartTooltip.style.display = 'none';
                if (chartGuide) chartGuide.style.display = 'none';
            });
        });
    }

    if (rangeButtons) {
        rangeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                rangeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    /* --------------------------------------------------------------------------
       MODAL CONTROLS
       -------------------------------------------------------------------------- */
    function openModal(type = 'expense') {
        if (!modal) return;
        setType(type);
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        if (txAmount) txAmount.focus();
    }

    function closeModal() {
        if (!modal) return;
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        if (txForm) txForm.reset();
    }

    function setType(type) {
        if (!txTypeInput) return;
        txTypeInput.value = type;
        if (type === 'income') {
            if (tabIncome) tabIncome.classList.add('active');
            if (tabExpense) tabExpense.classList.remove('active');
        } else {
            if (tabExpense) tabExpense.classList.add('active');
            if (tabIncome) tabIncome.classList.remove('active');
        }
    }

    if (btnQuickIncome) btnQuickIncome.addEventListener('click', () => openModal('income'));
    if (btnQuickExpense) btnQuickExpense.addEventListener('click', () => openModal('expense'));
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (modalCancelBtn) modalCancelBtn.addEventListener('click', closeModal);

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
            closeModal();
        }
    });

    if (tabExpense) tabExpense.addEventListener('click', () => setType('expense'));
    if (tabIncome) tabIncome.addEventListener('click', () => setType('income'));

    /* --------------------------------------------------------------------------
       METRICS & TABLE RENDERING
       -------------------------------------------------------------------------- */
    function formatINR(val) {
        return '₹' + Number(val).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function updateMetrics() {
        let totalIncome = 0;
        let totalExpense = 0;

        transactions.forEach(t => {
            if (t.type === 'income') totalIncome += Number(t.amount);
            else totalExpense += Number(t.amount);
        });

        const netBalance = totalIncome - totalExpense;
        const savingsStash = netBalance > 0 ? netBalance * 0.15 : 0;

<<<<<<< HEAD
        if (metricIncome) metricIncome.textContent = '+' + formatINR(totalIncome);
        if (metricExpense) metricExpense.textContent = '-' + formatINR(totalExpense);
        if (metricBalance) metricBalance.textContent = (netBalance < 0 ? '-' : '') + formatINR(Math.abs(netBalance));
        if (metricSavings) metricSavings.textContent = formatINR(savingsStash);
    }

    function renderTable() {
        if (!tableBody) return;
        tableBody.innerHTML = '';

        const recent = [...transactions].reverse();

        recent.forEach(tx => {
            const tr = document.createElement('tr');
            const isIncome = tx.type === 'income';

            tr.innerHTML = `
                <td><span class="tx-badge ${isIncome ? 'income' : 'expense'}">${isIncome ? 'Credit' : 'Debit'}</span></td>
                <td style="font-weight: 500; color: var(--text-primary);">${tx.category}</td>
                <td style="color: var(--text-muted);">${tx.note || '—'}</td>
                <td style="color: var(--text-muted);">${tx.date}</td>
                <td class="text-right font-tabular ${isIncome ? 'text-success' : 'text-danger'}" style="font-weight: 600;">
                    ${isIncome ? '+' : '-'}${formatINR(tx.amount)}
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    /* --------------------------------------------------------------------------
       FORM SUBMISSION HANDLER
=======
        if (response.ok) {
          window.location.href = result.redirect || "/";
        } else {
          alert("Logout failed. Please try again.");
        }

      } catch (error) {
        console.error("Logout error:", error);
        alert("Something went wrong. Please try again.");
      }
    });
  }

  /* --------------------------------------------------------------------------
       14. INITIALIZATION
>>>>>>> f881c6294dbdb41e84642037bc399938fddcad0c
       -------------------------------------------------------------------------- */
    if (txForm) {
        txForm.addEventListener('submit', (e) => {
            e.preventDefault();

<<<<<<< HEAD
            const amount = parseFloat(txAmount.value);
            if (isNaN(amount) || amount <= 0) return;

            const now = new Date();
            const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

            const newTx = {
                type: txTypeInput.value,
                amount: amount,
                category: txCategory.value.trim() || 'General',
                note: txNote ? txNote.value.trim() : '',
                date: dateStr
            };

            transactions.push(newTx);
            renderTable();
            updateMetrics();
            closeModal();
        });
    }

    renderTable();
    updateMetrics();
});
=======
  loadTransactions();

});
>>>>>>> f881c6294dbdb41e84642037bc399938fddcad0c
