/* ==========================================================================
   GAREEBI TRACKER — DASHBOARD LOGIC (static/js/dashboard.js)
   Handles modal triggers, transaction logging, in-memory ledger rendering,
   and dynamic metric calculations.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* --------------------------------------------------------------------------
       1. DOM REFERENCES
       -------------------------------------------------------------------------- */
    // Modal & Buttons
    const modal = document.getElementById('transaction-modal');
    const btnQuickIncome = document.getElementById('btn-quick-income');
    const btnQuickExpense = document.getElementById('btn-quick-expense');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');

    // Modal Form Elements
    const txForm = document.getElementById('dashboard-tx-form');
    const txTypeInput = document.getElementById('tx-type');
    const tabExpense = document.getElementById('tab-expense');
    const tabIncome = document.getElementById('tab-income');
    const txAmount = document.getElementById('tx-amount');
    const txCategory = document.getElementById('tx-category');
    const txAccount = document.getElementById('tx-account');
    const txNote = document.getElementById('tx-note');

    // Metrics Containers
    const metricBalance = document.getElementById('metric-balance');
    const metricIncome = document.getElementById('metric-income');
    const metricExpense = document.getElementById('metric-expense');
    const metricSavings = document.getElementById('metric-savings');

    // Table Body
    const tableBody = document.getElementById('transactions-table-body');

    /* --------------------------------------------------------------------------
       2. IN-MEMORY TRANSACTIONS STATE
       Mirrors Subhranil's Python dictionary structure:
       { type, amount, category, note, account, date }
       -------------------------------------------------------------------------- */
    let transactions = [
        {
            type: 'income',
            amount: 15000.00,
            category: 'Stipend / Freelance',
            note: 'Monthly development milestone',
            account: 'HDFC Bank',
            date: 'Nov 05, 2026'
        },
        {
            type: 'expense',
            amount: 450.00,
            category: 'Food & Dining',
            note: 'Hostel mess night snack',
            account: 'UPI / Wallet',
            date: 'Nov 04, 2026'
        },
        {
            type: 'expense',
            amount: 300.00,
            category: 'Transit & Petrol',
            note: 'Metro card recharge',
            account: 'Physical Cash',
            date: 'Nov 03, 2026'
        }
    ];

    /* --------------------------------------------------------------------------
       3. MODAL CONTROLS
       -------------------------------------------------------------------------- */
    function openModal(type = 'expense') {
        setType(type);
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        txAmount.focus();
    }

    function closeModal() {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        txForm.reset();
    }

    function setType(type) {
        txTypeInput.value = type;
        if (type === 'income') {
            tabIncome.classList.add('active');
            tabExpense.classList.remove('active');
        } else {
            tabExpense.classList.add('active');
            tabIncome.classList.remove('active');
        }
    }

    btnQuickIncome.addEventListener('click', () => openModal('income'));
    btnQuickExpense.addEventListener('click', () => openModal('expense'));
    modalCloseBtn.addEventListener('click', closeModal);
    modalCancelBtn.addEventListener('click', closeModal);

    // Click outside modal box
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Escape key listener
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('open')) {
            closeModal();
        }
    });

    // Toggle choices inside modal
    tabExpense.addEventListener('click', () => setType('expense'));
    tabIncome.addEventListener('click', () => setType('income'));

    /* --------------------------------------------------------------------------
       4. CURRENCY FORMATTER (INR: ₹)
       -------------------------------------------------------------------------- */
    function formatINR(val) {
        return '₹' + val.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    /* --------------------------------------------------------------------------
       5. METRIC COMPUTATIONS
       -------------------------------------------------------------------------- */
    function updateMetrics() {
        let totalIncome = 0;
        let totalExpense = 0;

        transactions.forEach(t => {
            if (t.type === 'income') totalIncome += t.amount;
            else totalExpense += t.amount;
        });

        const netBalance = totalIncome - totalExpense;
        // Assume 15% auto-allocated to emergency reserve
        const savingsStash = netBalance > 0 ? netBalance * 0.15 : 0;

        metricIncome.textContent = '+' + formatINR(totalIncome);
        metricExpense.textContent = '-' + formatINR(totalExpense);
        metricBalance.textContent = (netBalance < 0 ? '-' : '') + formatINR(Math.abs(netBalance));
        metricSavings.textContent = formatINR(savingsStash);
    }

    /* --------------------------------------------------------------------------
       6. TABLE RENDERING
       -------------------------------------------------------------------------- */
    function renderTable() {
        tableBody.innerHTML = '';

        // Display newest transactions first
        const recent = [...transactions].reverse();

        recent.forEach(tx => {
            const tr = document.createElement('tr');
            const isIncome = tx.type === 'income';

            tr.innerHTML = `
                <td><span class="tx-badge ${isIncome ? 'income' : 'expense'}">${isIncome ? 'Income' : 'Expense'}</span></td>
                <td style="font-weight: 500; color: var(--text-primary);">${tx.category}</td>
                <td style="color: var(--text-muted);">${tx.note || '—'}</td>
                <td><span class="account-chip">${tx.account}</span></td>
                <td style="color: var(--text-muted);">${tx.date}</td>
                <td class="text-right font-tabular ${isIncome ? 'text-success' : 'text-danger'}" style="font-weight: 600;">
                    ${isIncome ? '+' : '-'}${formatINR(tx.amount)}
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    /* --------------------------------------------------------------------------
       7. FORM SUBMIT HANDLER
       -------------------------------------------------------------------------- */
    txForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const amount = parseFloat(txAmount.value);
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount.');
            return;
        }

        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

        const newTx = {
            type: txTypeInput.value,
            amount: amount,
            category: txCategory.value.trim(),
            note: txNote.value.trim(),
            account: txAccount.value,
            date: dateStr
        };

        // Add to local state
        transactions.push(newTx);

        // Update UI
        renderTable();
        updateMetrics();

        // Close and reset
        closeModal();
    });

    /* --------------------------------------------------------------------------
       8. INITIALIZATION
       -------------------------------------------------------------------------- */
    renderTable();
    updateMetrics();

});