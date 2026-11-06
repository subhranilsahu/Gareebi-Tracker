/* ==========================================================================
   GAREEBI TRACKER — DASHBOARD SCRIPT (static/js/dashboard.js)
   Accounts removed, SVG interactive chart support, zero window refresh blocks.
   ========================================================================== */

window.onbeforeunload = null;

document.addEventListener('DOMContentLoaded', () => {

    /* --------------------------------------------------------------------------
       DOM REFERENCES
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

    // Chart HUD Elements
    const chartTooltip = document.getElementById('chart-tooltip');
    const tooltipTime = document.getElementById('tooltip-time');
    const tooltipVal = document.getElementById('tooltip-val');
    const chartNodes = document.querySelectorAll('.node-circle');
    const chartGuide = document.getElementById('chart-guide');
    const rangeButtons = document.querySelectorAll('.range-btn');

    /* --------------------------------------------------------------------------
       TRANSACTION STATE (Accounts removed)
       -------------------------------------------------------------------------- */
    let transactions = [
        {
            type: 'income',
            amount: 15000.00,
            category: 'Stipend / Freelance',
            note: 'Monthly development milestone',
            date: 'Nov 05, 2026'
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

    /* --------------------------------------------------------------------------
       INTERACTIVE SVG CHART LOGIC
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
       -------------------------------------------------------------------------- */
    if (txForm) {
        txForm.addEventListener('submit', (e) => {
            e.preventDefault();

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