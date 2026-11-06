
/* ==========================================================================
   GAREEBI TRACKER — DASHBOARD LOGIC
   Handles transactions, database connection, metrics and logout.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* --------------------------------------------------------------------------
       1. DOM REFERENCES
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
    const txAccount = document.getElementById('tx-account');
    const txNote = document.getElementById('tx-note');

    const metricBalance = document.getElementById('metric-balance');
    const metricIncome = document.getElementById('metric-income');
    const metricExpense = document.getElementById('metric-expense');
    const metricSavings = document.getElementById('metric-savings');

    const tableBody = document.getElementById('transactions-table-body');

    /* --------------------------------------------------------------------------
       2. TRANSACTIONS STATE
       -------------------------------------------------------------------------- */

    let transactions = [];


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

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('open')) {
            closeModal();
        }
    });

    tabExpense.addEventListener('click', () => setType('expense'));
    tabIncome.addEventListener('click', () => setType('income'));


    /* --------------------------------------------------------------------------
       4. CURRENCY FORMATTER
       -------------------------------------------------------------------------- */

    function formatINR(val) {
        return '₹' + Number(val).toLocaleString('en-IN', {
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
            if (t.type === 'income') {
                totalIncome += Number(t.amount);
            } else {
                totalExpense += Number(t.amount);
            }
        });

        const netBalance = totalIncome - totalExpense;
        const savingsStash = netBalance > 0 ? netBalance * 0.15 : 0;

        metricIncome.textContent = '+' + formatINR(totalIncome);
        metricExpense.textContent = '-' + formatINR(totalExpense);

        metricBalance.textContent =
            (netBalance < 0 ? '-' : '') + formatINR(Math.abs(netBalance));

        metricSavings.textContent = formatINR(savingsStash);
    }


    /* --------------------------------------------------------------------------
       6. TABLE RENDERING
       -------------------------------------------------------------------------- */

    function renderTable() {

        tableBody.innerHTML = '';

        transactions.forEach(tx => {

            const tr = document.createElement('tr');
            const isIncome = tx.type === 'income';

            const typeCell = document.createElement('td');
            const badge = document.createElement('span');

            badge.className = `tx-badge ${isIncome ? 'income' : 'expense'}`;
            badge.textContent = isIncome ? 'Income' : 'Expense';
            typeCell.appendChild(badge);

            const categoryCell = document.createElement('td');
            categoryCell.style.cssText =
                'font-weight: 500; color: var(--text-primary);';
            categoryCell.textContent = tx.category;

            const noteCell = document.createElement('td');
            noteCell.style.color = 'var(--text-muted)';
            noteCell.textContent = tx.note || '—';

            const accountCell = document.createElement('td');
            const accountChip = document.createElement('span');
            accountChip.className = 'account-chip';
            accountChip.textContent = tx.account;
            accountCell.appendChild(accountChip);

            const dateCell = document.createElement('td');
            dateCell.style.color = 'var(--text-muted)';
            dateCell.textContent = tx.date;

            const amountCell = document.createElement('td');
            amountCell.className =
                `text-right font-tabular ${isIncome ? 'text-success' : 'text-danger'}`;
            amountCell.style.fontWeight = '600';
            amountCell.textContent =
                `${isIncome ? '+' : '-'}${formatINR(tx.amount)}`;

            tr.append(
                typeCell,
                categoryCell,
                noteCell,
                accountCell,
                dateCell,
                amountCell
            );

            tableBody.appendChild(tr);
        });
    }


    /* --------------------------------------------------------------------------
       7. FETCH TRANSACTIONS FROM DATABASE
       -------------------------------------------------------------------------- */

    async function loadTransactions() {

        try {

            const response = await fetch('/transactions');
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Could not load transactions.');
            }

            transactions = result.transactions;

            renderTable();
            updateMetrics();

        } catch (error) {

            console.error('Transaction loading error:', error);
            alert('Could not load transactions. Please refresh the page.');

        }
    }


    /* --------------------------------------------------------------------------
       8. SAVE TRANSACTION TO DATABASE
       -------------------------------------------------------------------------- */

    txForm.addEventListener('submit', async (e) => {

        e.preventDefault();

        const amount = parseFloat(txAmount.value);

        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount.');
            return;
        }

        const now = new Date();

        const dateStr = now.toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
        });

        const newTx = {
            type: txTypeInput.value,
            amount: amount,
            category: txCategory.value.trim(),
            note: txNote.value.trim(),
            account: txAccount.value,
            date: dateStr
        };

        const submitBtn = txForm.querySelector('[type="submit"]');

        try {

            if (submitBtn) submitBtn.disabled = true;

            const response = await fetch('/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newTx)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Transaction could not be saved.');
            }

            newTx.id = result.transaction_id;

            // Update UI only after successful database save
            transactions.unshift(newTx);

            renderTable();
            updateMetrics();

            closeModal();

        } catch (error) {

            console.error('Transaction saving error:', error);
            alert(error.message);

        } finally {

            if (submitBtn) submitBtn.disabled = false;

        }
    });


    /* --------------------------------------------------------------------------
       9. LOGOUT
       -------------------------------------------------------------------------- */

    const logoutBtn = document.getElementById('btn-logout');

    if (logoutBtn) {

        logoutBtn.addEventListener('click', async () => {

            try {

                const response = await fetch('/logout', {
                    method: 'POST'
                });

                const result = await response.json();

                if (response.ok) {
                    window.location.href = result.redirect || '/';
                } else {
                    alert('Logout failed. Please try again.');
                }

            } catch (error) {

                console.error('Logout error:', error);
                alert('Something went wrong. Please try again.');

            }

        });
    }


    /* --------------------------------------------------------------------------
       10. INITIALIZATION
       -------------------------------------------------------------------------- */

    loadTransactions();

});
