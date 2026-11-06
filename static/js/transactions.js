/* ==========================================================================
   GAREEBI TRACKER — TRANSACTIONS SCRIPT
   Database connected, search, filters, add and delete.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* --------------------------------------------------------------------------
       1. LEDGER STATE
       -------------------------------------------------------------------------- */

    let transactions = [];
    let activeType = 'all';
    let searchQuery = '';


    /* --------------------------------------------------------------------------
       2. DOM REFERENCES
       -------------------------------------------------------------------------- */

    const ledgerBody = document.getElementById('ledger-body');
    const emptyState = document.getElementById('empty-state');
    const searchInput = document.getElementById('tx-search-input');
    const typeFilterBtns = document.querySelectorAll('.type-filter-btn');

    // Summary
    const summaryTotalExpense = document.getElementById('summary-total-expense');
    const summaryTotalIncome = document.getElementById('summary-total-income');
    const summaryTotalCount = document.getElementById('summary-total-count');

    // Modal
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


    /* --------------------------------------------------------------------------
       3. FORMATTING HELPER
       -------------------------------------------------------------------------- */

    function formatINR(value) {

        return '₹' + Number(value).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

    }


    /* --------------------------------------------------------------------------
       4. LOAD TRANSACTIONS FROM DATABASE
       -------------------------------------------------------------------------- */

    async function loadTransactions() {

        try {

            const response = await fetch('/transactions');

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Unable to load transactions.');
            }

            transactions = data.transactions.map(tx => ({
                ...tx,
                amount: Number(tx.amount),
                note: tx.note || ''
            }));

            renderLedger();

        } catch (error) {

            console.error('Load transactions error:', error);

            if (ledgerBody) {
                ledgerBody.innerHTML = '';
            }

            if (emptyState) {
                emptyState.style.display = 'block';
                emptyState.querySelector('.empty-title').textContent =
                    'Unable to load transactions';

                emptyState.querySelector('.empty-desc').textContent =
                    error.message;
            }

        }

    }


    /* --------------------------------------------------------------------------
       5. RENDER LEDGER
       -------------------------------------------------------------------------- */

    function renderLedger() {

        if (!ledgerBody) return;

        ledgerBody.innerHTML = '';

        const query = searchQuery.toLowerCase();

        const filtered = transactions.filter(item => {

            const matchesType =
                activeType === 'all' || item.type === activeType;

            const matchesSearch =
                String(item.category || '').toLowerCase().includes(query) ||
                String(item.note || '').toLowerCase().includes(query) ||
                String(item.date || '').toLowerCase().includes(query);

            return matchesType && matchesSearch;

        });


        // Empty state

        if (emptyState) {

            emptyState.style.display =
                filtered.length === 0 ? 'block' : 'none';

            emptyState.querySelector('.empty-title').textContent =
                'No transactions found';

            emptyState.querySelector('.empty-desc').textContent =
                'Try clearing your search query or switching your active filters.';

        }


        let totalIncome = 0;
        let totalExpense = 0;


        // Create transaction rows

        filtered.forEach(tx => {

            if (tx.type === 'income') {
                totalIncome += tx.amount;
            } else {
                totalExpense += tx.amount;
            }

            const tr = document.createElement('tr');

            const isIncome = tx.type === 'income';

            tr.innerHTML = `
                <td>
                    <span class="tx-badge ${isIncome ? 'income' : 'expense'}">
                        ${isIncome ? 'Credit' : 'Debit'}
                    </span>
                </td>

                <td style="font-weight: 500; color: var(--text-primary);">
                    ${escapeHTML(tx.category)}
                </td>

                <td style="color: var(--text-muted);">
                    ${escapeHTML(tx.note || '—')}
                </td>

                <td style="color: var(--text-muted);">
                    ${escapeHTML(tx.date)}
                </td>

                <td class="text-right font-tabular ${isIncome ? 'text-success' : 'text-danger'}"
                    style="font-weight: 600;">
                    ${isIncome ? '+' : '-'}${formatINR(tx.amount)}
                </td>

                <td class="text-center">
                    <button
                        type="button"
                        class="btn-delete-row"
                        data-id="${tx.id}"
                        title="Remove entry"
                        aria-label="Delete entry">
                        &times;
                    </button>
                </td>
            `;

            ledgerBody.appendChild(tr);

        });


        // Update summary

        if (summaryTotalExpense) {
            summaryTotalExpense.textContent = '-' + formatINR(totalExpense);
        }

        if (summaryTotalIncome) {
            summaryTotalIncome.textContent = '+' + formatINR(totalIncome);
        }

        if (summaryTotalCount) {
            summaryTotalCount.textContent = filtered.length;
        }

    }


    /* --------------------------------------------------------------------------
       6. HTML ESCAPE HELPER
       -------------------------------------------------------------------------- */

    function escapeHTML(value) {

        return String(value).replace(/[&<>"']/g, char => {

            const entities = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            };

            return entities[char];

        });

    }


    /* --------------------------------------------------------------------------
       7. DELETE TRANSACTION
       -------------------------------------------------------------------------- */

    if (ledgerBody) {

        ledgerBody.addEventListener('click', async (e) => {

            const deleteButton = e.target.closest('.btn-delete-row');

            if (!deleteButton) return;

            const id = deleteButton.dataset.id;

            if (!confirm('Are you sure you want to delete this transaction?')) {
                return;
            }

            deleteButton.disabled = true;

            try {

                const response = await fetch(`/transactions/${id}`, {
                    method: 'DELETE'
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Unable to delete transaction.');
                }

                transactions = transactions.filter(tx => tx.id != id);

                renderLedger();

            } catch (error) {

                console.error('Delete transaction error:', error);

                alert(error.message);

                deleteButton.disabled = false;

            }

        });

    }


    /* --------------------------------------------------------------------------
       8. SEARCH
       -------------------------------------------------------------------------- */

    if (searchInput) {

        searchInput.addEventListener('input', (e) => {

            searchQuery = e.target.value.trim();

            renderLedger();

        });

    }


    /* --------------------------------------------------------------------------
       9. TYPE FILTERS
       -------------------------------------------------------------------------- */

    typeFilterBtns.forEach(btn => {

        btn.addEventListener('click', () => {

            typeFilterBtns.forEach(button => {
                button.classList.remove('active');
            });

            btn.classList.add('active');

            activeType = btn.dataset.filter;

            renderLedger();

        });

    });


    /* --------------------------------------------------------------------------
       10. MODAL CONTROLS
       -------------------------------------------------------------------------- */

    function openModal(type = 'expense') {

        if (!txModal) return;

        setModalType(type);

        txModal.classList.add('open');

        txModal.setAttribute('aria-hidden', 'false');

        if (entryAmount) {
            entryAmount.focus();
        }

    }


    function closeModal() {

        if (!txModal) return;

        txModal.classList.remove('open');

        txModal.setAttribute('aria-hidden', 'true');

        if (ledgerForm) {
            ledgerForm.reset();
        }

        setModalType('expense');

    }


    function setModalType(type) {

        if (!entryTypeInput) return;

        entryTypeInput.value = type;

        if (type === 'income') {

            modalTabIncome?.classList.add('active');
            modalTabExpense?.classList.remove('active');

        } else {

            modalTabExpense?.classList.add('active');
            modalTabIncome?.classList.remove('active');

        }

    }


    if (btnOpenModal) {
        btnOpenModal.addEventListener('click', () => openModal('expense'));
    }

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModal);
    }

    if (modalCancelBtn) {
        modalCancelBtn.addEventListener('click', closeModal);
    }


    if (txModal) {

        txModal.addEventListener('click', (e) => {

            if (e.target === txModal) {
                closeModal();
            }

        });

    }


    document.addEventListener('keydown', (e) => {

        if (
            e.key === 'Escape' &&
            txModal &&
            txModal.classList.contains('open')
        ) {
            closeModal();
        }

    });


    if (modalTabExpense) {
        modalTabExpense.addEventListener('click', () => setModalType('expense'));
    }

    if (modalTabIncome) {
        modalTabIncome.addEventListener('click', () => setModalType('income'));
    }


    /* --------------------------------------------------------------------------
       11. CATEGORY QUICK TAGS
       -------------------------------------------------------------------------- */

    tagPills.forEach(pill => {

        pill.addEventListener('click', () => {

            if (entryCategory) {

                entryCategory.value = pill.dataset.tag;

                if (entryNote) {
                    entryNote.focus();
                }

            }

        });

    });


    /* --------------------------------------------------------------------------
       12. SAVE NEW TRANSACTION TO DATABASE
       -------------------------------------------------------------------------- */

    if (ledgerForm) {

        ledgerForm.addEventListener('submit', async (e) => {

            e.preventDefault();

            const amount = Number(entryAmount.value);

            const category = entryCategory.value.trim();

            const note = entryNote ? entryNote.value.trim() : '';

            const type = entryTypeInput.value;

            if (!Number.isFinite(amount) || amount <= 0) {
                alert('Please enter a valid amount.');
                return;
            }

            if (!category) {
                alert('Please enter a category.');
                return;
            }

            const now = new Date();

            const date = now.toISOString().slice(0, 10);

            const transactionData = {
                type: type,
                amount: amount,
                category: category,
                note: note,
                date: date
            };


            const submitButton = ledgerForm.querySelector(
                'button[type="submit"]'
            );

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Saving...';
            }


            try {

                const response = await fetch('/transactions', {

                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify(transactionData)

                });


                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Unable to save transaction.');
                }


                closeModal();

                await loadTransactions();


            } catch (error) {

                console.error('Save transaction error:', error);

                alert(error.message);

            } finally {

                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Save to ledger';
                }

            }

        });

    }


    /* --------------------------------------------------------------------------
       13. INITIAL LOAD
       -------------------------------------------------------------------------- */

    loadTransactions();

});