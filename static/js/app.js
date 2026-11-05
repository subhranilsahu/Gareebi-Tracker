/* ==========================================================================
   GAREEBI TRACKER — FRONTEND LOGIC (static/js/app.js)
   ========================================================================== */

// We wrap everything in 'DOMContentLoaded' so JavaScript only runs
// after the HTML document is completely loaded and ready in the browser.
document.addEventListener('DOMContentLoaded', () => {

    /* --------------------------------------------------------------------------
       1. DOM ELEMENT REFERENCES
       We use document.getElementById() to select HTML elements we need to
       listen to (clicks) or manipulate (update text, show modals).
       -------------------------------------------------------------------------- */
    
    // Modal & Buttons
    const modal = document.getElementById('transaction-modal');
    const btnQuickIncome = document.getElementById('btn-quick-income');
    const btnQuickExpense = document.getElementById('btn-quick-expense');
    const modalCloseBtn = document.getElementById('modal-close');
    const modalCancelBtn = document.getElementById('modal-cancel');

    // Form & Form Controls
    const transactionForm = document.getElementById('transaction-form');
    const tabExpense = document.getElementById('tab-expense');
    const tabIncome = document.getElementById('tab-income');
    const entryTypeInput = document.getElementById('entry-type');
    const entryAmount = document.getElementById('entry-amount');
    const entryCategory = document.getElementById('entry-category');
    const entryAccount = document.getElementById('entry-account');
    const entryNote = document.getElementById('entry-note');

    // Dashboard Metric Displays
    const statTotalBalance = document.getElementById('stat-total-balance');
    const statTotalIncome = document.getElementById('stat-total-income');
    const statTotalExpense = document.getElementById('stat-total-expense');

    // Table Body where transaction rows will be inserted
    const transactionsTableBody = document.getElementById('recent-transactions-body');

    /* --------------------------------------------------------------------------
       2. LOCAL STATE (In-Memory Transactions)
       Pre-populated with 2 initial demo transactions matching the HTML rows.
       This structure directly mirrors Subhranil's Python dictionary model:
       { type, amount, category, note, account, date }
       -------------------------------------------------------------------------- */
    let transactions = [
        {
            type: 'income',
            amount: 5000.00,
            category: 'Freelance / Project',
            note: 'Web dev milestone payout',
            account: 'HDFC Bank',
            date: 'Nov 05, 2026'
        },
        {
            type: 'expense',
            amount: 420.00,
            category: 'Groceries & Food',
            note: 'Mess bill & snacks',
            account: 'UPI / Wallet',
            date: 'Nov 04, 2026'
        }
    ];

    /* --------------------------------------------------------------------------
       3. MODAL CONTROLS (Open / Close Functions)
       -------------------------------------------------------------------------- */
    
    // Function to open modal in a specific mode ('income' or 'expense')
    function openModal(defaultType = 'expense') {
        setTransactionType(defaultType);
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        entryAmount.focus(); // Places cursor directly into the amount input
    }

    // Function to hide modal and reset inputs
    function closeModal() {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        transactionForm.reset();
    }

    // Function to switch between 'income' and 'expense' tabs inside the modal
    function setTransactionType(type) {
        entryTypeInput.value = type;

        if (type === 'income') {
            tabIncome.classList.add('active');
            tabExpense.classList.remove('active');
        } else {
            tabExpense.classList.add('active');
            tabIncome.classList.remove('active');
        }
    }

    /* --------------------------------------------------------------------------
       4. EVENT LISTENERS FOR MODAL
       -------------------------------------------------------------------------- */
    
    // Click "+ Add Income" button
    btnQuickIncome.addEventListener('click', () => {
        openModal('income');
    });

    // Click "− Add Expense" button
    btnQuickExpense.addEventListener('click', () => {
        openModal('expense');
    });

    // Close on 'X' or 'Cancel' button
    modalCloseBtn.addEventListener('click', closeModal);
    modalCancelBtn.addEventListener('click', closeModal);

    // Close when clicking outside the modal card (on the dark blurred overlay)
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    // Close if user presses the 'Escape' key on keyboard
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.classList.contains('open')) {
            closeModal();
        }
    });

    // Tab buttons inside the modal
    tabExpense.addEventListener('click', () => setTransactionType('expense'));
    tabIncome.addEventListener('click', () => setTransactionType('income'));

    /* --------------------------------------------------------------------------
       5. FORMATTING HELPERS
       Currency formatter (Indian Rupee: ₹)
       -------------------------------------------------------------------------- */
    function formatCurrency(amount) {
        return '₹' + amount.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    /* --------------------------------------------------------------------------
       6. RECALCULATE & UPDATE METRICS
       Computes totals and reflects them on the dashboard cards.
       -------------------------------------------------------------------------- */
    function updateDashboardMetrics() {
        let totalIncome = 0;
        let totalExpense = 0;

        // Loop through our transactions list and sum up values
        transactions.forEach(item => {
            if (item.type === 'income') {
                totalIncome += item.amount;
            } else if (item.type === 'expense') {
                totalExpense += item.amount;
            }
        });

        // Balance = Income - Expenses
        const balance = totalIncome - totalExpense;

        // Update HTML cards with formatted strings
        statTotalIncome.textContent = '+' + formatCurrency(totalIncome);
        statTotalExpense.textContent = '-' + formatCurrency(totalExpense);
        statTotalBalance.textContent = (balance < 0 ? '-' : '') + formatCurrency(Math.abs(balance));
    }

    /* --------------------------------------------------------------------------
       7. RENDER TRANSACTION ROW IN LEDGER TABLE
       Creates HTML table rows dynamically from an object.
       -------------------------------------------------------------------------- */
    function renderTransactionRow(tx) {
        const tr = document.createElement('tr');

        // Check if transaction is income or expense to style accordingly
        const isIncome = tx.type === 'income';
        const badgeClass = isIncome ? 'income' : 'expense';
        const badgeText = isIncome ? 'Income' : 'Expense';
        const amountClass = isIncome ? 'amount-income' : 'amount-expense';
        const amountSign = isIncome ? '+' : '-';

        tr.innerHTML = `
            <td><span class="tx-badge ${badgeClass}">${badgeText}</span></td>
            <td class="font-medium">${tx.category}</td>
            <td class="text-muted">${tx.note || '—'}</td>
            <td><span class="account-pill">${tx.account}</span></td>
            <td class="text-muted">${tx.date}</td>
            <td class="text-right font-tabular ${amountClass}">
                ${amountSign}${formatCurrency(tx.amount)}
            </td>
        `;

        // Prepend so newest transactions appear at the top
        transactionsTableBody.prepend(tr);
    }

    /* --------------------------------------------------------------------------
       8. FORM SUBMIT HANDLER
       Triggered when the user clicks "Save Transaction" in the modal.
       -------------------------------------------------------------------------- */
    transactionForm.addEventListener('submit', (event) => {
        // Prevent default browser form submission (which reloads the whole page)
        event.preventDefault();

        const amountValue = parseFloat(entryAmount.value);

        // Basic validation
        if (isNaN(amountValue) || amountValue <= 0) {
            alert('Please enter a valid amount greater than 0.');
            return;
        }

        // Format current date (e.g. "Nov 06, 2026")
        const now = new Date();
        const dateOptions = { month: 'short', day: '2-digit', year: 'numeric' };
        const formattedDate = now.toLocaleDateString('en-US', dateOptions);

        // Construct new transaction object matching backend schema
        const newTransaction = {
            type: entryTypeInput.value,
            amount: amountValue,
            category: entryCategory.value.trim(),
            note: entryNote.value.trim(),
            account: entryAccount.value,
            date: formattedDate
        };

        // 1. Add to local memory array
        transactions.push(newTransaction);

        // 2. Render immediately in table UI
        renderTransactionRow(newTransaction);

        // 3. Recalculate metrics
        updateDashboardMetrics();

        // 4. Close the modal
        closeModal();

        // NOTE FOR PHASE 7 (Flask Integration):
        // Later, we will send this exact 'newTransaction' object to Subhranil's 
        // Flask backend using fetch('/api/transactions', { method: 'POST', ... })
    });

    /* --------------------------------------------------------------------------
       9. INITIAL RUN
       Run metrics calculation on initial load to match the default rows.
       -------------------------------------------------------------------------- */
    updateDashboardMetrics();
});