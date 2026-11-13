
/* ==========================================================================
   GAREEBI TRACKER — UNIFIED DASHBOARD + TRANSACTIONS
   Single-page navigation, shared modal, transaction CRUD and live metrics.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* 1. DOM ELEMENTS */

    const dashboardView = document.getElementById("dashboard-view");
    const transactionsView = document.getElementById("transactions-view");
    const navItems = document.querySelectorAll("[data-view]");

    const modal = document.getElementById("transaction-modal");
    const form = document.getElementById("dashboard-tx-form");

    const quickIncomeBtn = document.getElementById("btn-quick-income");
    const quickExpenseBtn = document.getElementById("btn-quick-expense");
    const ledgerAddBtn = document.getElementById("btn-ledger-add");

    const closeModalBtn = document.getElementById("modal-close-btn");
    const cancelModalBtn = document.getElementById("modal-cancel-btn");

    const expenseTab = document.getElementById("tab-expense");
    const incomeTab = document.getElementById("tab-income");

    const typeInput = document.getElementById("tx-type");
    const amountInput = document.getElementById("tx-amount");
    const categoryInput = document.getElementById("tx-category");
    const noteInput = document.getElementById("tx-note");
    const dateInput = document.getElementById("tx-date");
    const timeInput = document.getElementById("tx-time");

    const dashboardTableBody = document.getElementById("transactions-table-body");
    const ledgerBody = document.getElementById("ledger-body");

    const monthFilter = document.getElementById("month-filter");
    const currentMonthLabel = document.getElementById("current-month");
    const searchInput = document.getElementById("tx-search-input");

    const filterButtons = document.querySelectorAll(
        ".transactions-view [data-filter]"
    );

    const emptyState = document.getElementById("empty-state");

    /* 2. STATE */

    let transactions = [];
    let editingTransactionId = null;
    let selectedMonth = "all";
    let selectedType = "all";
    let searchQuery = "";
    let modalOpener = null;

    /* 3. HELPERS */

    const formatINR = (amount) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2
        }).format(Number(amount) || 0);
    };

    /* SMOOTH NUMBER COUNT + SLIDE ANIMATION */

    function animateNumeric(element, targetValue, formatter) {
        if (!element) return;

        const target = Number(targetValue) || 0;
        const previous = Number(element.dataset.animatedValue ?? 0);

        if (element._numberFrame) {
            cancelAnimationFrame(element._numberFrame);
        }

        if (element._numberAnimation) {
            element._numberAnimation.cancel();
        }

        const animation = element.animate(
            [
                { opacity: 0.35, transform: "translateY(12px)" },
                { opacity: 1, transform: "translateY(0)" }
            ],
            {
                duration: 850,
                easing: "cubic-bezier(0.22, 1, 0.36, 1)"
            }
        );

        element._numberAnimation = animation;

        const startTime = performance.now();
        const duration = 850;

        function updateNumber(currentTime) {
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            const currentValue = previous + (target - previous) * eased;

            element.textContent = formatter(currentValue);

            if (progress < 1) {
                element._numberFrame = requestAnimationFrame(updateNumber);
            } else {
                element.textContent = formatter(target);
                element.dataset.animatedValue = String(target);
                element._numberFrame = null;
            }
        }

        element._numberFrame = requestAnimationFrame(updateNumber);
    }

    const escapeHTML = (value) => {
        return String(value ?? "").replace(/[&<>"']/g, (character) => {
            const entities = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            };

            return entities[character];
        });
    };

    const getLocalDateValue = (date = new Date()) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const getLocalTimeValue = (date = new Date()) => {
        return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    };

    const getTransactionDate = (transaction) => {
        if (!transaction.date) return new Date();
        const [year, month, day] = transaction.date.split("-").map(Number);
        const date = new Date(year, month - 1, day);
        return Number.isNaN(date.getTime()) ? new Date() : date;
    };

    const formatDate = (dateValue) => {
        return getTransactionDate({ date: dateValue }).toLocaleDateString(
            "en-IN",
            { day: "2-digit", month: "short", year: "numeric" }
        );
    };

    const getTransactionCreatedAt = (transaction) => {
        if (!transaction.created_at) return null;
        const raw = String(transaction.created_at);
        const normalized = raw.includes("T") ? raw : raw.replace(" ", "T") + "Z";
        const date = new Date(normalized);
        return Number.isNaN(date.getTime()) ? null : date;
    };

    const getTransactionTimeValue = (transaction) => {
        if (transaction.transaction_time) {
            return transaction.transaction_time.slice(0, 5);
        }
        const createdAt = getTransactionCreatedAt(transaction);
        return createdAt ? getLocalTimeValue(createdAt) : "00:00";
    };

    const getTransactionTimestamp = (transaction) => {
        const date = getTransactionDate(transaction);
        const [hours, minutes] = getTransactionTimeValue(transaction).split(":").map(Number);
        date.setHours(hours || 0, minutes || 0, 0, 0);
        return date.getTime();
    };

    const formatTransactionDateTime = (transaction) => {
        const date = formatDate(transaction.date);
        const [hours, minutes] = getTransactionTimeValue(transaction).split(":").map(Number);
        const time = new Date(2000, 0, 1, hours, minutes).toLocaleTimeString(
            "en-IN",
            { hour: "2-digit", minute: "2-digit", hour12: true }
        );
        return `${date} · ${time}`;
    };

    const getMonthKey = (transaction) => {
        const date = getTransactionDate(transaction);

        return `${date.getFullYear()}-${String(
            date.getMonth() + 1
        ).padStart(2, "0")}`;
    };

    const getTransactionId = (transaction) => transaction.id;

    /* 4. SINGLE-PAGE NAVIGATION */

    let transitionRun = 0;

    function switchView(viewName) {
        const views = {
            dashboard: dashboardView,
            transactions: transactionsView,
            profile: document.getElementById("profile-view")
        };

        const nextView = views[viewName];
        const stage = document.getElementById("content-stage");

        if (!nextView || !stage) return;

        const run = ++transitionRun;

        stage.getAnimations().forEach((animation) => animation.cancel());
        stage.style.height = "";
        stage.style.overflow = "";

        const currentView = Object.values(views).find(
            (element) => element && !element.hidden
        );

        sessionStorage.setItem("gareebiActiveView", viewName);

        function activateView() {
            if (run !== transitionRun) return;

            const startHeight = stage.getBoundingClientRect().height;
            const shouldMorph = currentView && currentView !== nextView;

            if (shouldMorph) {
                stage.style.height = `${startHeight}px`;
                stage.style.overflow = "hidden";
            }

            Object.entries(views).forEach(([name, element]) => {
                if (element) element.hidden = name !== viewName;
            });

            navItems.forEach((item) => {
                const isActive = item.dataset.view === viewName;
                item.classList.toggle("active", isActive);
                item.setAttribute("aria-current", isActive ? "page" : "false");
            });

            if (viewName === "transactions") {
                renderLedger();
            }

            if (shouldMorph) {
                stage.offsetHeight;

                const minHeight = parseFloat(
                    getComputedStyle(stage).minHeight
                ) || 0;

                const targetHeight = Math.max(
                    stage.scrollHeight,
                    nextView.scrollHeight,
                    minHeight
                );

                const morphAnimation = stage.animate(
                    [
                        { height: `${startHeight}px` },
                        { height: `${targetHeight}px` }
                    ],
                    {
                        duration: 1100,
                        easing: "cubic-bezier(0.65, 0, 0.35, 1)",
                        fill: "forwards"
                    }
                );

                morphAnimation.onfinish = () => {
                    if (run !== transitionRun) return;
                    stage.style.height = "";
                    stage.style.overflow = "";
                };
            }

            nextView.getAnimations().forEach((animation) => animation.cancel());

            nextView.animate(
                [
                    { opacity: 0, transform: "translateY(14px) scale(0.99)", filter: "blur(7px)" },
                    { opacity: 1, transform: "translateY(0) scale(1)", filter: "blur(0)" }
                ],
                {
                    duration: 650,
                    easing: "cubic-bezier(0.22, 1, 0.36, 1)",
                    fill: "both"
                }
            );

            const items = nextView.querySelectorAll(
                ".metric-card, .card, .chart-card, .analytics-card, .transactions-table-wrapper, .profile-card"
            );

            items.forEach((item, index) => {
                item.getAnimations().forEach((animation) => animation.cancel());

                item.animate(
                    [
                        { opacity: 0, transform: "translateY(18px)", filter: "blur(5px)" },
                        { opacity: 1, transform: "translateY(0)", filter: "blur(0)" }
                    ],
                    {
                        duration: 550,
                        delay: Math.min(index * 65, 520),
                        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
                        fill: "both"
                    }
                );
            });
        }

        if (currentView && currentView !== nextView) {
            currentView.getAnimations().forEach((animation) => animation.cancel());

            const exitAnimation = currentView.animate(
                [
                    { opacity: 1, transform: "translateY(0)", filter: "blur(0)" },
                    { opacity: 0, transform: "translateY(-8px)", filter: "blur(5px)" }
                ],
                {
                    duration: 180,
                    easing: "ease-in",
                    fill: "forwards"
                }
            );

            exitAnimation.onfinish = activateView;
        } else {
            activateView();
        }
    }

    navItems.forEach((item) => {
        item.addEventListener("click", (event) => {
            event.preventDefault();

            const viewName = item.dataset.view;

            if (viewName === "dashboard" || viewName === "transactions" || viewName === "profile") {
                switchView(viewName);
            }
        });
    });


    /* 5. SHARED TRANSACTION MODAL */

    function setType(type) {
        if (!typeInput) return;

        typeInput.value = type;

        expenseTab?.classList.toggle("active", type === "expense");
        incomeTab?.classList.toggle("active", type === "income");
    }

    function openModal(type = "expense") {
        if (!modal) return;

        modalOpener = document.activeElement;

        editingTransactionId = null;

        form?.reset();
        setType(type);

        if (dateInput) dateInput.value = getLocalDateValue();
        if (timeInput) timeInput.value = getLocalTimeValue();

        const submitButton = document.getElementById("modal-submit-btn");

        if (submitButton) {
            submitButton.textContent = "Save Entry";
        }

        modal.classList.add("open");
        modal.setAttribute("aria-hidden", "false");

        document.body.classList.add("modal-open");

        requestAnimationFrame(() => {
            amountInput?.focus();
        });
    }

    function closeModal() {
        if (!modal) return;

        if (modal.contains(document.activeElement)) {
            document.activeElement.blur();
        }

        modal.classList.remove("open");
        modal.setAttribute("aria-hidden", "true");

        document.body.classList.remove("modal-open");

        editingTransactionId = null;

        if (modalOpener && document.contains(modalOpener)) {
            modalOpener.focus();
        }

        modalOpener = null;
    }

    function openEditModal(transaction) {
        openModal(transaction.type);

        editingTransactionId = getTransactionId(transaction);

        if (dateInput) dateInput.value = transaction.date || getLocalDateValue();
        if (timeInput) timeInput.value = getTransactionTimeValue(transaction);

        if (amountInput) {
            amountInput.value = transaction.amount;
        }

        if (categoryInput) {
            categoryInput.value = transaction.category || "";
        }

        if (noteInput) {
            noteInput.value = transaction.note || "";
        }

        const submitButton = document.getElementById("modal-submit-btn");

        if (submitButton) {
            submitButton.textContent = "Update Entry";
        }
    }

    quickIncomeBtn?.addEventListener("click", () => openModal("income"));
    quickExpenseBtn?.addEventListener("click", () => openModal("expense"));
    ledgerAddBtn?.addEventListener("click", () => openModal("expense"));

    closeModalBtn?.addEventListener("click", closeModal);
    cancelModalBtn?.addEventListener("click", closeModal);

    expenseTab?.addEventListener("click", () => setType("expense"));
    incomeTab?.addEventListener("click", () => setType("income"));

    modal?.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && modal?.classList.contains("open")) {
            closeModal();
        }
    });

    /* 6. DASHBOARD MONTH FILTER */

    function populateMonthFilter() {
        if (!monthFilter) return;

        const previousValue = selectedMonth;

        const months = [
            ...new Set(transactions.map(getMonthKey))
        ].sort().reverse();

        monthFilter.innerHTML = '<option value="all">All Time</option>';

        months.forEach((month) => {
            const [year, monthNumber] = month.split("-");
            const date = new Date(Number(year), Number(monthNumber) - 1);

            const option = document.createElement("option");

            option.value = month;
            option.textContent = date.toLocaleDateString("en-IN", {
                month: "long",
                year: "numeric"
            });

            monthFilter.appendChild(option);
        });

        monthFilter.value = months.includes(previousValue)
            ? previousValue
            : "all";

        selectedMonth = monthFilter.value;
        updateCurrentMonthLabel();
    }

    function updateCurrentMonthLabel() {
        if (!currentMonthLabel) return;

        let date = new Date();

        if (selectedMonth !== "all") {
            const [year, month] = selectedMonth.split("-").map(Number);
            date = new Date(year, month - 1, 1);
        }

        currentMonthLabel.textContent = date.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric"
        });
    }

    monthFilter?.addEventListener("change", () => {
        selectedMonth = monthFilter.value;
        updateCurrentMonthLabel();

        renderDashboardTable();
        updateMetrics();
        updateTopOutflows();
        updateCashFlowChart();
    });

    /* 7. DASHBOARD METRICS */

    function getMonthTransactions() {
        if (selectedMonth === "all") {
            return transactions;
        }

        return transactions.filter(
            (transaction) => getMonthKey(transaction) === selectedMonth
        );
    }

    function updateMetrics() {
        const list = getMonthTransactions();

        const income = list
            .filter((transaction) => transaction.type === "income")
            .reduce((total, transaction) =>
                total + Number(transaction.amount || 0), 0);

        const expense = list
            .filter((transaction) => transaction.type === "expense")
            .reduce((total, transaction) =>
                total + Number(transaction.amount || 0), 0);

        const balance = income - expense;
        const savings = income > 0 ? Math.max(0, balance * 0.15) : 0;

        const balanceElement = document.getElementById("metric-balance");
        const incomeElement = document.getElementById("metric-income");
        const expenseElement = document.getElementById("metric-expense");
        const savingsElement = document.getElementById("metric-savings");

        animateNumeric(balanceElement, balance, formatINR);
        animateNumeric(incomeElement, income, formatINR);
        animateNumeric(expenseElement, expense, formatINR);
        animateNumeric(savingsElement, savings, formatINR);
    }

    /* 8. CASH FLOW TRAJECTORY GRAPH */

    function updateCashFlowChart() {
        const chart = document.getElementById("cash-flow-svg");

        if (!chart) return;

        const list = getMonthTransactions();
        const buckets = [];

        if (selectedMonth === "all") {

            // Show the latest 6 months containing transaction history.

            const latestDate = list.length
                ? list.map(getTransactionDate).sort((a, b) => b - a)[0]
                : new Date();

            const anchor = new Date(
                latestDate.getFullYear(),
                latestDate.getMonth(),
                1
            );

            for (let i = 5; i >= 0; i--) {
                const date = new Date(
                    anchor.getFullYear(),
                    anchor.getMonth() - i,
                    1
                );

                const key = `${date.getFullYear()}-${String(
                    date.getMonth() + 1
                ).padStart(2, "0")}`;

                buckets.push({
                    key,
                    label: date.toLocaleDateString("en-IN", {
                        month: "short"
                    }),
                    income: 0,
                    expense: 0
                });
            }

            list.forEach((tx) => {
                const bucket = buckets.find(
                    (item) => item.key === getMonthKey(tx)
                );

                if (!bucket) return;

                if (tx.type === "income") {
                    bucket.income += Number(tx.amount || 0);
                } else if (tx.type === "expense") {
                    bucket.expense += Number(tx.amount || 0);
                }
            });

        } else {

            // Show four weekly periods for the selected month.

            for (let i = 0; i < 4; i++) {
                buckets.push({
                    label: `Week ${i + 1}`,
                    income: 0,
                    expense: 0
                });
            }

            list.forEach((tx) => {
                const date = getTransactionDate(tx);

                const weekIndex = Math.min(
                    3,
                    Math.floor((date.getDate() - 1) / 7)
                );

                const bucket = buckets[weekIndex];

                if (!bucket) return;

                if (tx.type === "income") {
                    bucket.income += Number(tx.amount || 0);
                } else if (tx.type === "expense") {
                    bucket.expense += Number(tx.amount || 0);
                }
            });
        }

        const left = 58;
        const right = 675;
        const top = 22;
        const bottom = 185;

        const maxValue = Math.max(
            0,
            ...buckets.map((b) => Math.max(b.income, b.expense))
        );

        if (maxValue === 0) {
            chart.innerHTML = `
                <text x="350" y="115"
                    text-anchor="middle"
                    fill="#85827A"
                    font-size="14">
                    Add transactions to see your cash flow
                </text>
            `;
            return;
        }

        const scaleMax = maxValue * 1.2;
        const xStep = (right - left) / (buckets.length - 1);

        const getX = (index) => left + index * xStep;

        const getY = (value) =>
            bottom - (value / scaleMax) * (bottom - top);

        const incomePoints = buckets.map((b, i) => [
            getX(i),
            getY(b.income)
        ]);

        const expensePoints = buckets.map((b, i) => [
            getX(i),
            getY(b.expense)
        ]);

        function makeSmoothPath(points) {
            if (points.length < 2) return "";

            return points.reduce((path, point, index) => {
                if (index === 0) {
                    return `M ${point[0]} ${point[1]}`;
                }

                const previous = points[index - 1];
                const midX = (previous[0] + point[0]) / 2;

                return `${path} C ${midX} ${previous[1]}, ${midX} ${point[1]}, ${point[0]} ${point[1]}`;
            }, "");
        }

        const incomePath = makeSmoothPath(incomePoints);
        const expensePath = makeSmoothPath(expensePoints);

        const formatAxis = (value) => {
            if (value >= 100000) {
                return `₹${(value / 100000).toFixed(1)}L`;
            }

            if (value >= 1000) {
                return `₹${(value / 1000).toFixed(1)}k`;
            }

            return `₹${Math.round(value)}`;
        };

        const grid = Array.from({ length: 4 }, (_, i) => {
            const value = (scaleMax / 3) * (3 - i);
            const y = getY(value);

            return `
                <line class="grid-line"
                    x1="${left}" y1="${y}"
                    x2="${right}" y2="${y}" />

                <text class="axis-label"
                    x="${left - 10}" y="${y + 4}"
                    text-anchor="end">
                    ${formatAxis(value)}
                </text>
            `;
        }).join("");

        const labels = buckets.map((b, i) => `
            <text class="axis-label"
                x="${getX(i)}" y="218"
                text-anchor="middle">
                ${escapeHTML(b.label)}
            </text>
        `).join("");

        const incomeNodes = incomePoints.map((p, i) => `
            <circle class="node-circle income-node"
                cx="${p[0]}" cy="${p[1]}" r="4">
                <title>
                    ${escapeHTML(buckets[i].label)} — Income:
                    ${escapeHTML(formatINR(buckets[i].income))}
                </title>
            </circle>
        `).join("");

        const expenseNodes = expensePoints.map((p, i) => `
            <circle class="node-circle expense-node"
                cx="${p[0]}" cy="${p[1]}" r="4">
                <title>
                    ${escapeHTML(buckets[i].label)} — Expense:
                    ${escapeHTML(formatINR(buckets[i].expense))}
                </title>
            </circle>
        `).join("");

        chart.innerHTML = `
            <defs>
                <linearGradient id="incomeGlow"
                    x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"
                        stop-color="#D6B56D"
                        stop-opacity=".25"/>
                    <stop offset="100%"
                        stop-color="#D6B56D"
                        stop-opacity="0"/>
                </linearGradient>

                <linearGradient id="expenseGlow"
                    x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"
                        stop-color="#F87171"
                        stop-opacity=".18"/>
                    <stop offset="100%"
                        stop-color="#F87171"
                        stop-opacity="0"/>
                </linearGradient>
            </defs>

            ${grid}

            <path
                d="${incomePath} L ${right} ${bottom} L ${left} ${bottom} Z"
                fill="url(#incomeGlow)"/>

            <path
                d="${expensePath} L ${right} ${bottom} L ${left} ${bottom} Z"
                fill="url(#expenseGlow)"/>

            <path class="chart-line-income" d="${incomePath}"/>

            <path class="chart-line-expense" d="${expensePath}"/>

            ${incomeNodes}
            ${expenseNodes}
            ${labels}
        `;
    }

    /* 9. DASHBOARD RECENT TRANSACTIONS */

    function renderDashboardTable() {
        if (!dashboardTableBody) return;

        const list = getMonthTransactions()
            .slice()
            .sort((a, b) =>
                getTransactionTimestamp(b) - getTransactionTimestamp(a)
            )
            .slice(0, 5);

        if (list.length === 0) {
            dashboardTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-table-message">
                        No transactions found.
                    </td>
                </tr>
            `;
            return;
        }

        dashboardTableBody.innerHTML = list.map((transaction) => {
            const isIncome = transaction.type === "income";
            const amountClass = isIncome ? "text-success" : "text-danger";
            const sign = isIncome ? "+" : "-";

            return `
                <tr>
                    <td>${escapeHTML(formatTransactionDateTime(transaction))}</td>

                    <td>${escapeHTML(
                        transaction.note || transaction.category || "Transaction"
                    )}</td>

                    <td>${escapeHTML(transaction.category || "Other")}</td>

                    <td class="text-right ${amountClass}">
                        ${sign}${escapeHTML(formatINR(transaction.amount))}
                    </td>

                    <td class="transaction-actions text-center">
                        <button type="button" class="btn-icon"
                            data-action="edit"
                            data-id="${escapeHTML(getTransactionId(transaction))}"
                            aria-label="Edit transaction"
                            title="Edit">✎</button>

                        <button type="button" class="btn-icon delete"
                            data-action="delete"
                            data-id="${escapeHTML(getTransactionId(transaction))}"
                            aria-label="Delete transaction"
                            title="Delete">×</button>
                    </td>
                </tr>
            `;
        }).join("");
    }

    /* 10. TOP OUTFLOW CATEGORIES */

    function updateTopOutflows() {
        const categoryList = document.getElementById("category-list");

        if (!categoryList) return;

        const categoryTotals = {};

        getMonthTransactions().forEach((tx) => {
            if (tx.type !== "expense") return;

            const category = tx.category || "Other";

            categoryTotals[category] =
                (categoryTotals[category] || 0) + Number(tx.amount || 0);
        });

        const sortedCategories = Object.entries(categoryTotals)
            .sort((a, b) => b[1] - a[1]);

        const totalExpense = sortedCategories.reduce(
            (sum, item) => sum + item[1], 0
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
                    <span class="cat-pct font-tabular">
                        ${percentage.toFixed(1)}%
                    </span>
                </div>

                <div class="progress-track">
                    <div class="progress-fill fill-amber"
                        style="width: ${percentage}%"></div>
                </div>
            `;

            item.querySelector(".cat-name").textContent = category;
            categoryList.appendChild(item);
        });
    }

    /* 11. TRANSACTIONS LEDGER */

    function getFilteredTransactions() {
        return transactions
            .filter((transaction) => {
                const matchesType =
                    selectedType === "all" ||
                    transaction.type === selectedType;

                const searchableText = [
                    transaction.note,
                    transaction.category,
                    transaction.type,
                    transaction.amount
                ].join(" ").toLowerCase();

                return matchesType &&
                    searchableText.includes(searchQuery);
            })
            .sort((a, b) =>
                getTransactionTimestamp(b) - getTransactionTimestamp(a)
            );
    }

    function updateLedgerSummary(list) {
        const income = list
            .filter((transaction) => transaction.type === "income")
            .reduce((total, transaction) =>
                total + Number(transaction.amount || 0), 0);

        const expense = list
            .filter((transaction) => transaction.type === "expense")
            .reduce((total, transaction) =>
                total + Number(transaction.amount || 0), 0);

        const incomeElement = document.getElementById("summary-total-income");
        const expenseElement = document.getElementById("summary-total-expense");
        const countElement = document.getElementById("summary-total-count");

        animateNumeric(incomeElement, income, formatINR);
        animateNumeric(expenseElement, expense, formatINR);
        animateNumeric(countElement, list.length, value => Math.round(value).toLocaleString("en-IN"));
    }

    function renderLedger() {
        if (!ledgerBody) return;

        const list = getFilteredTransactions();

        updateLedgerSummary(list);

        if (emptyState) {
            emptyState.hidden = list.length !== 0;
        }

        ledgerBody.innerHTML = list.map((transaction) => {
            const isIncome = transaction.type === "income";
            const amountClass = isIncome ? "text-success" : "text-danger";
            const sign = isIncome ? "+" : "-";

            return `
                <tr>
                    <td>${escapeHTML(formatTransactionDateTime(transaction))}</td>

                    <td>${escapeHTML(transaction.note || "—")}</td>

                    <td>${escapeHTML(transaction.category || "Other")}</td>

                    <td>
                        <span class="tx-badge ${isIncome ? "income" : "expense"}">
                            ${escapeHTML(transaction.type)}
                        </span>
                    </td>

                    <td class="text-right ${amountClass}">
                        ${sign}${escapeHTML(formatINR(transaction.amount))}
                    </td>

                    <td class="text-right transaction-actions">
                        <button type="button" class="btn-icon"
                            data-action="edit"
                            data-id="${escapeHTML(getTransactionId(transaction))}"
                            aria-label="Edit transaction"
                            title="Edit">✎</button>

                        <button type="button" class="btn-icon delete"
                            data-action="delete"
                            data-id="${escapeHTML(getTransactionId(transaction))}"
                            aria-label="Delete transaction"
                            title="Delete">×</button>
                    </td>
                </tr>
            `;
        }).join("");
    }

    searchInput?.addEventListener("input", () => {
        searchQuery = searchInput.value.trim().toLowerCase();
        renderLedger();
    });

    filterButtons.forEach((button) => {
        button.addEventListener("click", () => {
            selectedType = button.dataset.filter;

            filterButtons.forEach((filterButton) => {
                filterButton.classList.toggle(
                    "active",
                    filterButton === button
                );
            });

            renderLedger();
        });
    });

    /* 12. EDIT AND DELETE */

    async function deleteTransaction(id) {
        if (!confirm("Are you sure you want to delete this transaction?")) {
            return;
        }

        try {
            const response = await fetch(`/transactions/${id}`, {
                method: "DELETE"
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.error || "Could not delete transaction."
                );
            }

            await loadTransactions();

        } catch (error) {
            alert(error.message || "Something went wrong.");
        }
    }

    async function handleTransactionAction(event) {
        const button = event.target.closest("[data-action]");

        if (!button) return;

        const action = button.dataset.action;
        const id = button.dataset.id;

        const transaction = transactions.find(
            (item) => String(getTransactionId(item)) === String(id)
        );

        if (!transaction) return;

        if (action === "edit") {
            openEditModal(transaction);
        }

        if (action === "delete") {
            await deleteTransaction(id);
        }
    }

    dashboardTableBody?.addEventListener(
        "click",
        handleTransactionAction
    );

    ledgerBody?.addEventListener(
        "click",
        handleTransactionAction
    );

    /* 13. LOAD TRANSACTIONS */

    async function loadTransactions() {
        try {
            const response = await fetch("/transactions");
            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.error || "Could not load transactions."
                );
            }

            transactions = Array.isArray(result.transactions)
                ? result.transactions
                : [];

            populateMonthFilter();
            renderDashboardTable();
            updateMetrics();
            updateTopOutflows();
            updateCashFlowChart();
            renderLedger();

        } catch (error) {
            console.error("Transaction loading error:", error);
        }
    }

    /* 14. ADD / UPDATE TRANSACTION */

    form?.addEventListener("submit", async (event) => {
        event.preventDefault();

        const amount = Number(amountInput?.value);

        if (!Number.isFinite(amount) || amount <= 0) {
            alert("Please enter a valid amount.");
            return;
        }

        const payload = {
            type: typeInput?.value || "expense",
            amount,
            category: categoryInput?.value.trim() || "Other",
            note: noteInput?.value.trim() || "",
            date: dateInput?.value || getLocalDateValue(),
            time: timeInput?.value || getLocalTimeValue()
        };

        const isEditing = editingTransactionId !== null;

        const url = isEditing
            ? `/transactions/${editingTransactionId}`
            : "/transactions";

        const submitButton = document.getElementById("modal-submit-btn");

        try {
            if (submitButton) submitButton.disabled = true;

            const response = await fetch(url, {
                method: isEditing ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.error || "Could not save transaction."
                );
            }

            closeModal();
            await loadTransactions();

        } catch (error) {
            alert(error.message || "Something went wrong.");

        } finally {
            if (submitButton) submitButton.disabled = false;
        }
    });

    /* 15. LOGOUT */

    const logoutButton = document.getElementById("btn-logout");

    logoutButton?.addEventListener("click", async (event) => {
        event.preventDefault();

        try {
            const response = await fetch("/logout", {
                method: "POST"
            });

            const result = await response.json();

            window.location.href = result.redirect || "/";

        } catch (error) {
            console.error("Logout error:", error);
            window.location.href = "/";
        }
    });

    /* 16. INITIALIZE */

    const savedView = sessionStorage.getItem("gareebiActiveView") || "dashboard";
    switchView(savedView);
    loadTransactions();

});
