/* ==========================================================================
   GAREEBI TRACKER — TRANSACTIONS SCRIPT (static/js/transactions.js)
   Accounts removed, clean real-time search, category tagging, zero refresh bugs.
   ========================================================================== */

window.onbeforeunload = null;

document.addEventListener('DOMContentLoaded', () => {

    /* --------------------------------------------------------------------------
       1. IN-MEMORY LEDGER STATE (Accounts removed)
       -------------------------------------------------------------------------- */
    let transactions = [
        {
            id: 1,
            type: 'income',
            amount: 15000.00,
            category: 'Stipend / Freelance',
            note: 'Monthly development milestone payout',
            date: 'Nov 05, 2026'
        },
        {
            id: 2,
            type: 'expense',
            amount: 450.00,
            category: 'Food & Mess',
            note: 'Hostel mess night snack',
            date: 'Nov 04, 2026'
        },
        {
            id: 3,
            type: 'expense',
            amount: 300.00,
            category: 'Transit & Fuel',
            note: 'Metro card recharge',
            date: 'Nov 03, 2026'
        },
        {
            id: 4,
            type: 'income',
            amount: 2500.00,
            category: 'Consulting',
            note: 'Bug fix bounty reward',
            date: 'Nov 02, 2026'
        },
        {
            id: 5,
            type: 'expense',
            amount: 899.00,
            category: 'Tech & Gear',
            note: 'Cloud server hosting invoice',
            date: 'Nov 01, 2026'
        }
    ];

    /* --------------------------------------------------------------------------
       2. DOM REFERENCES
       -------------------------------------------------------------------------- */
    const ledgerBody = document.getElementById('ledger-body');
    const emptyState = document.getElementById('empty-state');
    const searchInput = document.getElementById('tx-search-input');
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
    const entryNote = document.getElementById('entry-note');
    const tagPills = document.querySelectorAll('.tag-pill');

    let activeType = 'all';
    let searchQuery = '';

    /* --------------------------------------------------------------------------
       3. FORMATTING HELPER
       -------------------------------------------------------------------------- */
    function formatINR(val) {
        return '₹' + Number(val).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    /* --------------------------------------------------------------------------
       4. LEDGER RENDER & SUMMARY AGGREGATION
       -------------------------------------------------------------------------- */
    function renderLedger() {
        if (!ledgerBody) return;
        ledgerBody.innerHTML = '';

        // Filter transactions based on active toolbar state
        const query = searchQuery.toLowerCase();
        const filtered = transactions.filter(item => {
            const matchesType = activeType === 'all' || item.type === activeType;
            const matchesSearch = 
                item.category.toLowerCase().includes(query) ||
                item.note.toLowerCase().includes(query) ||
                item.date.toLowerCase().includes(query);

            return matchesType && matchesSearch;
        });

        // Toggle Empty State Visibility
        if (emptyState) {
            emptyState.style.display = filtered.length === 0 ? 'block' : 'none';
        }

        let totalIncome = 0;
        let totalExpense = 0;

        filtered.forEach(tx => {
            if (tx.type === 'income') totalIncome += tx.amount;
            else totalExpense += tx.amount;

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
                <td class="text-center">
                    <button type="button" class="btn-delete-row" data-id="${tx.id}" title="Remove entry" aria-label="Delete entry">&times;</button>
                </td>
            `;

            ledgerBody.appendChild(tr);
        });

        // Update Summary Badges
        if (summaryTotalExpense) summaryTotalExpense.textContent = '-' + formatINR(totalExpense);
        if (summaryTotalIncome) summaryTotalIncome.textContent = '+' + formatINR(totalIncome);
        if (summaryTotalCount) summaryTotalCount.textContent = filtered.length;

        // Attach Delete Listeners
        document.querySelectorAll('.btn-delete-row').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idToDelete = parseInt(e.currentTarget.getAttribute('data-id'), 10);
                transactions = transactions.filter(t => t.id !== idToDelete);
                renderLedger();
            });
        });
    }

    /* --------------------------------------------------------------------------
       5. FILTER & SEARCH EVENT HANDLERS
       -------------------------------------------------------------------------- */
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.trim();
            renderLedger();
        });
    }

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
        if (!txModal) return;
        setModalType(type);
        txModal.classList.add('open');
        txModal.setAttribute('aria-hidden', 'false');
        if (entryAmount) entryAmount.focus();
    }

    function closeModal() {
        if (!txModal) return;
        txModal.classList.remove('open');
        txModal.setAttribute('aria-hidden', 'true');
        if (ledgerForm) ledgerForm.reset();
    }

    function setModalType(type) {
        if (!entryTypeInput) return;
        entryTypeInput.value = type;
        if (type === 'income') {
            if (modalTabIncome) modalTabIncome.classList.add('active');
            if (modalTabExpense) modalTabExpense.classList.remove('active');
        } else {
            if (modalTabExpense) modalTabExpense.classList.add('active');
            if (modalTabIncome) modalTabIncome.classList.remove('active');
        }
    }

    if (btnOpenModal) btnOpenModal.addEventListener('click', () => openModal('expense'));
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (modalCancelBtn) modalCancelBtn.addEventListener('click', closeModal);

    if (txModal) {
        txModal.addEventListener('click', (e) => {
            if (e.target === txModal) closeModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && txModal && txModal.classList.contains('open')) {
            closeModal();
        }
    });

    if (modalTabExpense) modalTabExpense.addEventListener('click', () => setModalType('expense'));
    if (modalTabIncome) modalTabIncome.addEventListener('click', () => setModalType('income'));

    // Category Quick-Tag Fillers
    tagPills.forEach(pill => {
        pill.addEventListener('click', () => {
            if (entryCategory) {
                entryCategory.value = pill.getAttribute('data-tag');
                if (entryNote) entryNote.focus();
            }
        });
    });

    /* --------------------------------------------------------------------------
       7. ENTRY CREATION HANDLER
       -------------------------------------------------------------------------- */
    if (ledgerForm) {
        ledgerForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const amount = parseFloat(entryAmount.value);
            if (isNaN(amount) || amount <= 0) return;

            const now = new Date();
            const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

            const newEntry = {
                id: Date.now(),
                type: entryTypeInput.value,
                amount: amount,
                category: entryCategory.value.trim() || 'General',
                note: entryNote ? entryNote.value.trim() : '',
                date: dateStr
            };

            transactions.unshift(newEntry);
            renderLedger();
            closeModal();
        });
    }

    renderLedger();
});