/* ==========================================================================
   GAREEBI TRACKER — PROFILE LOGIC (static/js/profile.js)
   Handles meme quote randomizer, persona updates, and local settings storage.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* --------------------------------------------------------------------------
       1. GEN-Z FINANCIAL MEME QUOTES
       -------------------------------------------------------------------------- */
    const memeQuotes = [
        "Salary aayi, responsibilities le gayi.",
        "Bank balance: It's complicated.",
        "Spending money like an NPC.",
        "Broke but financially aware.",
        "Ek cutting chai aur existential dread, please.",
        "UPI balance checked: emotional damage delivered.",
        "Zindagi mein peace chahiye, par Swiggy cart full hai.",
        "Frugal living shuru kal se, pakka."
    ];

    const quoteDisplay = document.getElementById('quote-display');
    const btnRollQuote = document.getElementById('btn-roll-quote');
    const quoteContainer = document.getElementById('quote-container');

    let currentQuoteIndex = 0;

    function rollNewQuote() {
        // Pick an index different from the current one
        let nextIndex;
        do {
            nextIndex = Math.floor(Math.random() * memeQuotes.length);
        } while (nextIndex === currentQuoteIndex && memeQuotes.length > 1);

        currentQuoteIndex = nextIndex;

        // Smooth text transition
        quoteDisplay.style.opacity = '0';
        setTimeout(() => {
            quoteDisplay.textContent = memeQuotes[currentQuoteIndex];
            quoteDisplay.style.opacity = '1';
        }, 160);
    }

    btnRollQuote.addEventListener('click', rollNewQuote);

    /* --------------------------------------------------------------------------
       2. SETTINGS PREFERENCES FORM
       -------------------------------------------------------------------------- */
    const profileForm = document.getElementById('profile-form');
    const profNameInput = document.getElementById('prof-name');
    const profPersonaSelect = document.getElementById('prof-persona');
    const saveStatusMsg = document.getElementById('save-status-msg');
    const personaTagDisplay = document.querySelector('.persona-tag');
    const sidebarUserName = document.querySelector('.sidebar .user-name');
    const profileFullname = document.querySelector('.user-fullname');

    // Load saved preferences if available in localStorage
    const savedName = localStorage.getItem('gareebi_user_name');
    const savedPersona = localStorage.getItem('gareebi_user_persona');

    if (savedName) {
        profNameInput.value = savedName;
        if (sidebarUserName) sidebarUserName.textContent = savedName;
        if (profileFullname) profileFullname.textContent = savedName;
    }

    if (savedPersona) {
        profPersonaSelect.value = savedPersona;
        updatePersonaTag(savedPersona);
    }

    function updatePersonaTag(val) {
        const labels = {
            'broke-aware': 'Tier: Broke but Aware',
            'npc-spender': 'Tier: NPC Spender',
            'chai-investor': 'Tier: Chai Investor',
            'frugal-god': 'Tier: Frugal Ascetic'
        };
        if (personaTagDisplay && labels[val]) {
            personaTagDisplay.textContent = labels[val];
        }
    }

    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const updatedName = profNameInput.value.trim();
        const selectedPersona = profPersonaSelect.value;

        if (!updatedName) {
            alert('Name cannot be empty.');
            return;
        }

        // Save locally
        localStorage.setItem('gareebi_user_name', updatedName);
        localStorage.setItem('gareebi_user_persona', selectedPersona);

        // Update UI
        if (sidebarUserName) sidebarUserName.textContent = updatedName;
        if (profileFullname) profileFullname.textContent = updatedName;
        updatePersonaTag(selectedPersona);

        // Feedback
        saveStatusMsg.textContent = '✓ Saved preferences!';
        setTimeout(() => {
            saveStatusMsg.textContent = '';
        }, 2500);

        // NOTE FOR FLASK INTEGRATION:
        // Later, we will send this update via fetch('/api/user/profile', { method: 'PUT', ... })
    });

});