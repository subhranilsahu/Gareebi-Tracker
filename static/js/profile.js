/* ==========================================================================
   GAREEBI TRACKER — PROFILE & SETTINGS SCRIPT (static/js/profile.js)
   Handles persistent profile preferences, JSON export, and ledger cache controls.
   ========================================================================== */

window.onbeforeunload = null;

document.addEventListener('DOMContentLoaded', () => {

    /* --------------------------------------------------------------------------
       1. DOM REFERENCES
       -------------------------------------------------------------------------- */
    const profileForm = document.getElementById('profile-form');
    const profName = document.getElementById('prof-name');
    const profEmail = document.getElementById('prof-email');
    const profCurrency = document.getElementById('prof-currency');
    const profPersona = document.getElementById('prof-persona');
    const saveStatusMsg = document.getElementById('save-status-msg');

    // UI Header & Avatar elements
    const profileDisplayName = document.getElementById('profile-display-name');
    const profileLargeAvatar = document.getElementById('profile-large-avatar');
    const profileTierBadge = document.getElementById('profile-tier-badge');
    const sidebarName = document.getElementById('sidebar-name');
    const sidebarAvatar = document.getElementById('sidebar-avatar');
    const sidebarRole = document.getElementById('sidebar-role');

    // Data Management Buttons
    const btnExportJson = document.getElementById('btn-export-json');
    const btnResetDemo = document.getElementById('btn-reset-demo');
    const btnClearData = document.getElementById('btn-clear-data');

    /* --------------------------------------------------------------------------
       2. INITIAL STATE & LOCALSTORAGE SYNC
       -------------------------------------------------------------------------- */
    function loadSavedProfile() {
        const savedName = localStorage.getItem('gt_profile_name') || 'Abhigyan Das';
        const savedCurrency = localStorage.getItem('gt_profile_currency') || 'INR';
        const savedPersona = localStorage.getItem('gt_profile_persona') || 'Student Account';

        if (profName) profName.value = savedName;
        if (profCurrency) profCurrency.value = savedCurrency;
        if (profPersona) profPersona.value = savedPersona;

        updateVisualIdentity(savedName, savedPersona);
    }

    function updateVisualIdentity(name, persona) {
        // Derive clean 2-letter monogram
        const initials = name
            .split(' ')
            .map(n => n.charAt(0))
            .slice(0, 2)
            .join('')
            .toUpperCase() || 'AD';

        if (profileDisplayName) profileDisplayName.textContent = name;
        if (profileLargeAvatar) profileLargeAvatar.textContent = initials;
        if (profileTierBadge) profileTierBadge.textContent = `Tier: ${persona}`;

        if (sidebarName) sidebarName.textContent = name;
        if (sidebarAvatar) sidebarAvatar.textContent = initials;
        if (sidebarRole) sidebarRole.textContent = persona;
    }

    /* --------------------------------------------------------------------------
       3. PREFERENCES FORM SUBMISSION
       -------------------------------------------------------------------------- */
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = profName.value.trim() || 'Abhigyan Das';
            const currency = profCurrency.value;
            const persona = profPersona.value;

            localStorage.setItem('gt_profile_name', name);
            localStorage.setItem('gt_profile_currency', currency);
            localStorage.setItem('gt_profile_persona', persona);

            updateVisualIdentity(name, persona);

            if (saveStatusMsg) {
                saveStatusMsg.textContent = 'Saved successfully';
                setTimeout(() => {
                    saveStatusMsg.textContent = '';
                }, 2500);
            }
        });
    }

    /* --------------------------------------------------------------------------
       4. DATA MANAGEMENT ACTIONS (Export, Reset, Purge)
       -------------------------------------------------------------------------- */
    // Export Ledger to JSON
    if (btnExportJson) {
        btnExportJson.addEventListener('click', () => {
            const sampleData = {
                user: localStorage.getItem('gt_profile_name') || 'Abhigyan Das',
                currency: localStorage.getItem('gt_profile_currency') || 'INR',
                exportedAt: new Date().toISOString(),
                transactions: [
                    { id: 1, type: 'income', amount: 15000.00, category: 'Stipend / Freelance', note: 'Monthly milestone payout', date: 'Nov 05, 2026' },
                    { id: 2, type: 'expense', amount: 450.00, category: 'Food & Mess', note: 'Hostel mess night snack', date: 'Nov 04, 2026' },
                    { id: 3, type: 'expense', amount: 300.00, category: 'Transit & Fuel', note: 'Metro card recharge', date: 'Nov 03, 2026' },
                    { id: 4, type: 'income', amount: 2500.00, category: 'Consulting', note: 'Bug fix bounty reward', date: 'Nov 02, 2026' },
                    { id: 5, type: 'expense', amount: 899.00, category: 'Tech & Gear', note: 'Cloud server hosting invoice', date: 'Nov 01, 2026' }
                ]
            };

            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sampleData, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `gareebi_tracker_ledger_${Date.now()}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
        });
    }

    // Reset Demo Records
    if (btnResetDemo) {
        btnResetDemo.addEventListener('click', () => {
            if (confirm('Reset transactions to default demo entries?')) {
                localStorage.removeItem('gt_transactions');
                alert('Default transactions restored.');
            }
        });
    }

    // Purge Ledger Records
    if (btnClearData) {
        btnClearData.addEventListener('click', () => {
            if (confirm('Are you sure you want to purge all stored transactions? This action cannot be undone.')) {
                localStorage.setItem('gt_transactions', JSON.stringify([]));
                alert('All ledger records have been purged.');
            }
        });
    }

    // Initialize state
    loadSavedProfile();
});