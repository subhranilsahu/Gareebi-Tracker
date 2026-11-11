document.addEventListener("DOMContentLoaded", () => {

    const profileForm = document.getElementById("profile-form");
    const nameInput = document.getElementById("prof-name");
    const emailInput = document.getElementById("prof-email");
    const profileEmail = document.getElementById("profile-email");
    const profileJoined = document.getElementById("profile-joined");
    const currencyLabel = document.getElementById("profile-currency-label");
    const currencyInput = document.getElementById("prof-currency");
    const personaInput = document.getElementById("prof-persona");
    const saveStatus = document.getElementById("save-status-msg");

    const displayName = document.getElementById("profile-display-name");
    const largeAvatar = document.getElementById("profile-large-avatar");
    const sidebarName = document.getElementById("sidebar-name");
    const sidebarAvatar = document.getElementById("sidebar-avatar");
    const tierBadge = document.getElementById("profile-tier-badge");

    const exportButton = document.getElementById("btn-export-json");
    const logoutButton = document.getElementById("btn-logout");

    function getInitials(name) {
        return name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map(part => part.charAt(0))
            .join("")
            .toUpperCase();
    }

    function updateVisualIdentity(name) {
        const cleanName = name.trim() || "User";
        const initials = getInitials(cleanName);

        if (displayName) displayName.textContent = cleanName;
        if (largeAvatar) largeAvatar.textContent = initials;
        if (sidebarName) sidebarName.textContent = cleanName;
        if (sidebarAvatar) sidebarAvatar.textContent = initials;
        if (tierBadge) tierBadge.textContent = personaInput.value;
    }

    function showStatus(message, isError = false) {
        if (!saveStatus) return;

        saveStatus.textContent = message;
        saveStatus.style.color = isError ? "#e07070" : "#70bd8b";
    }

    // Load saved preferences from the database.
    async function loadProfilePreferences() {
        try {
            const response = await fetch("/profile/data");
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Could not load preferences.");
            }

            const profile = result.profile;

            nameInput.value = profile.full_name || nameInput.value;
            if (emailInput) emailInput.value = profile.email || "";
            if (profileEmail) profileEmail.textContent = profile.email || "";
            if (profileJoined) profileJoined.textContent = profile.created_at || "";

            currencyInput.value = profile.currency || "INR";
            personaInput.value = profile.classification || "Student Account";

            if (currencyLabel) {
                const symbols = { INR: "₹", USD: "$", EUR: "€", GBP: "£" };
                currencyLabel.textContent = `${currencyInput.value} (${symbols[currencyInput.value] || ""})`;
            }

            updateVisualIdentity(nameInput.value);

        } catch (error) {
            showStatus(error.message, true);
        }
    }

    loadProfilePreferences();

    // Save profile name to the Flask database.
    profileForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const fullName = nameInput.value.trim();

        if (!fullName) {
            showStatus("Name cannot be empty.", true);
            return;
        }

        if (fullName.length > 80) {
            showStatus("Name must be 80 characters or less.", true);
            return;
        }

        const submitButton = profileForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        showStatus("Saving...");

        try {
            const response = await fetch("/profile/update", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    full_name: fullName,
                    currency: currencyInput.value,
                    classification: personaInput.value
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Could not update profile.");
            }

            updateVisualIdentity(fullName);
            showStatus("Profile saved successfully.");

        } catch (error) {
            showStatus(error.message || "Something went wrong.", true);
        } finally {
            submitButton.disabled = false;
        }
    });

    // Update the tier and currency previews when changed.
    personaInput.addEventListener("change", () => {
        updateVisualIdentity(nameInput.value);
    });

    currencyInput.addEventListener("change", () => {
        const symbols = { INR: "₹", USD: "$", EUR: "€", GBP: "£" };
        if (currencyLabel) {
            currencyLabel.textContent = `${currencyInput.value} (${symbols[currencyInput.value] || ""})`;
        }
    });

    // Export actual account and transaction data.
    exportButton.addEventListener("click", async () => {
        exportButton.disabled = true;
        exportButton.textContent = "Preparing...";

        try {
            const response = await fetch("/profile/data");

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Could not fetch account data.");
            }

            const exportData = {
                profile: result.profile,
                currency: currencyInput.value,
                classification: personaInput.value,
                exported_at: new Date().toISOString(),
                transactions: result.transactions
            };

            const blob = new Blob(
                [JSON.stringify(exportData, null, 4)],
                { type: "application/json" }
            );

            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = downloadUrl;
            link.download = "gareebi-tracker-backup.json";

            document.body.appendChild(link);
            link.click();
            link.remove();

            URL.revokeObjectURL(downloadUrl);

        } catch (error) {
            alert(error.message || "Export failed.");
        } finally {
            exportButton.disabled = false;
            exportButton.textContent = "Export JSON";
        }
    });

    // Sign out through Flask.
    logoutButton.addEventListener("click", async () => {
        logoutButton.disabled = true;

        try {
            const response = await fetch("/logout", {
                method: "POST"
            });

            if (!response.ok) {
                throw new Error("Could not sign out. Please try again.");
            }

            window.location.href = "/";

        } catch (error) {
            alert(error.message);
            logoutButton.disabled = false;
        }
    });

});
