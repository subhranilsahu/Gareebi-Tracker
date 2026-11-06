/* ==========================================================================
   GAREEBI TRACKER — TRANSACTIONS LEDGER LOGIC (static/js/transactions.js)
   Handles real-time search, category/account filtering, dynamic metric 
   aggregation, and entry deletion/creation.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* --------------------------------------------------------------------------
       1. INITIAL IN-MEMORY DATA
       -------------------------------------------------------------------------- */
    let transactions = [
        {
            id: 1,
            type: 'income',
            amount: 15000.00,
            category: 'Stipend / Freelance',
            note: 'Monthly development milestone payout',
            account: 'HDFC Bank',
            date: 'Nov 05, 2026'
        },
        {
            id: 2,
            type: 'expense',
            amount: 450.00,
            category: 'Food & Dining',
            note: 'Hostel mess night snack with friends',
            account: 'UPI / Wallet',
            date: 'Nov 04, 2026'
        },
        {
            id: 3,
            type: 'expense',
            amount: 300.00,
            category: 'Transit & Petrol',
            note: 'Metro card top-up',
            account: 'Physical Cash',
            date: 'Nov 03, 2026'
        },
        {
            id: 4,
            type: 'income',
            amount: 2500.00,
            category: 'Consulting',
            note: 'Bug fix bounty reward',
            account: 'UPI / Wallet',
            date: 'Nov 02, 2026'
        },
        {
            id: 5,
            type: 'expense',
            amount: 899.00,
            category: 'Subscriptions',
            note: 'Cloud server hosting invoice',
            account: 'HDFC Bank',
            date: 'Nov 01, 2026'
        }
    ];

    /* --------------------------------------------------------------------------
       2. DOM REFERENCES
       -------------------------------------------------------------------------- */
    const ledgerBody = document.getElementById('ledger-body');
    const emptyState = document.getElementById('empty-state');
    const searchInput = document.getElementById('tx-search-input');
    const accountFilter = document.getElementById('tx-account-filter');
    const typeFilterBtns = document.querySelectorAll('.type-filter-btn');

    // Summary Elements
    const summaryTotalExpense = document.getElementById('summary-total-expense');
    const summaryTotalIncome = document.getElementById('summary-total-income');
    const summaryTotalCount = document.getElementById('summary-total-count');

    // Modal References
    const txModal = document.getElementById('tx-modal');
    const btnOpenModal = document.getElementById('btn-open-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');
    const ledgerForm = document.getElementById('ledger-form');
    const entryTypeInput = document.getElementById('entry-type');
    const modalTabExpense = document.getElementById('modal-tab-expense');
    const modalTabIncome = document.getElementById('modal-tab-income');
    const entryAmount = document.getElementById('entry-amount');
    const entryCategory = document.getElementById('entry-category');
    const entryAccount = document.getElementById('entry-account');
    const entryNote = document.getElementById('entry-note');

    // Active Filters
    let activeType = 'all'; // 'all' | 'expense' | 'income'
    let activeAccount = 'all';
    let searchQuery = '';

    /* --------------------------------------------------------------------------
       3. FORMATTING HELPERS
       -------------------------------------------------------------------------- */
    function formatINR(val) {
        return '₹' + val.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    /* --------------------------------------------------------------------------
       4. RENDER LEDGER TABLE & SUMMARY
       -------------------------------------------------------------------------- */
    function renderLedger() {
        ledgerBody.innerHTML = '';

        // Filter transactions based on active toolbar states
        const filtered = transactions.filter(item => {
            const matchesType = activeType === 'all' || item.type === activeType;
            const matchesAccount = activeAccount === 'all' || item.account === activeAccount;
            const matchesSearch = 
                item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.account.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesType && matchesAccount && matchesSearch;
        });

        // Toggle Empty State
        if (filtered.length === 0) {
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
        }

        // Compute filtered summary stats
        let totalIncome = 0;
        let totalExpense = 0;

        filtered.forEach(tx => {
            if (tx.type === 'income') totalIncome += tx.amount;
            else totalExpense += tx.amount;

            const tr = document.createElement('tr');
            const isIncome = tx.type === 'income';

            tr.innerHTML = `
                <td><span class="tx-badge ${isIncome ? 'income' : 'expense'}">${isIncome ? 'Income' : 'Expense'}</span></td>
                <td style="font-weight: 600; color: var(--text-primary);">${tx.category}</td>
                <td>${tx.note || '—'}</td>
                <td><span class="account-chip">${tx.account}</span></td>
                <td style="color: var(--text-muted);">${tx.date}</td>
                <td class="text-right font-tabular ${isIncome ? 'text-success' : 'text-danger'}" style="font-weight: 700;">
                    ${isIncome ? '+' : '-'}${formatINR(tx.amount)}
                </td>
                <td class="text-center">
                    <button type="button" class="btn-delete-row" data-id="${tx.id}" title="Remove entry">✕</button>
                </td>
            `;

            ledgerBody.appendChild(tr);
        });

        // Update Summary Cards
        summaryTotalExpense.textContent = '-' + formatINR(totalExpense);
        summaryTotalIncome.textContent = '+' + formatINR(totalIncome);
        summaryTotalCount.textContent = filtered.length;

        // Attach delete handlers to newly rendered rows
        document.querySelectorAll('.btn-delete-row').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idToDelete = parseInt(e.target.getAttribute('data-id'), 10);
                transactions = transactions.filter(t => t.id !== idToDelete);
                renderLedger();
            });
        });
    }

    /* --------------------------------------------------------------------------
       5. FILTER & SEARCH EVENT LISTENERS
       -------------------------------------------------------------------------- */
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim();
        renderLedger();
    });

    accountFilter.addEventListener('change', (e) => {
        activeAccount = e.target.value;
        renderLedger();
    });

    typeFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            typeFilterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeType = btn.getAttribute('data-filter');
            renderLedger();
        });
    });

    /* --------------------------------------------------------------------------
       6. MODAL INTERACTION LOGIC
       -------------------------------------------------------------------------- */
    function openModal(type = 'expense') {
        setModalType(type);
        txModal.classList.add('open');
        txModal.setAttribute('aria-hidden', 'false');
        entryAmount.focus();
    }

    function closeModal() {
        txModal.classList.remove('open');
        txModal.setAttribute('aria-hidden', 'true');
        ledgerForm.reset();
    }

    function setModalType(type) {
        entryTypeInput.value = type;
        if (type === 'income') {
            modalTabIncome.classList.add('active');
            modalTabExpense.classList.remove('active');
        } else {
            modalTabExpense.classList.add('active');
            modalTabIncome.classList.remove('active');
        }
    }

    btnOpenModal.addEventListener('click', () => openModal('expense'));
    modalCloseBtn.addEventListener('click', closeModal);
    modalCancelBtn.addEventListener('click', closeModal);

    txModal.addEventListener('click', (e) => {
        if (e.target === txModal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && txModal.classList.contains('open')) {
            closeModal();
        }
    });

    modalTabExpense.addEventListener('click', () => setModalType('expense'));
    modalTabIncome.addEventListener('click', () => setModalType('income'));

    /* --------------------------------------------------------------------------
       7. LOG ENTRY SUBMISSION
       -------------------------------------------------------------------------- */
    ledgerForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const amount = parseFloat(entryAmount.value);
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount.');
            return;
        }

        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

        const newEntry = {
            id: Date.now(),
            type: entryTypeInput.value,
            amount: amount,
            category: entryCategory.value.trim(),
            note: entryNote.value.trim(),
            account: entryAccount.value,
            date: dateStr
        };

        // Add to front of array
        transactions.unshift(newEntry);

        renderLedger();
        closeModal();
    });

    /* --------------------------------------------------------------------------
       8. INITIALIZATION
       -------------------------------------------------------------------------- */
    renderLedger();

});