/* ==========================================================================
   GAREEBI TRACKER — AUTHENTICATION LOGIC (static/js/auth.js)
   Handles password visibility toggling and client-side form validation.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* --------------------------------------------------------------------------
       1. PASSWORD SHOW / HIDE TOGGLE
       -------------------------------------------------------------------------- */
    const togglePasswordButtons = document.querySelectorAll('.btn-toggle-password');

    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', () => {
            const inputWrapper = button.closest('.input-password-wrapper');
            const passwordInput = inputWrapper.querySelector('input');
            const iconSpan = button.querySelector('.toggle-icon');

            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                iconSpan.textContent = '🙈';
            } else {
                passwordInput.type = 'password';
                iconSpan.textContent = '👁️';
            }
        });
    });

    /* --------------------------------------------------------------------------
       2. VALIDATION HELPERS
       -------------------------------------------------------------------------- */
    function isValidEmail(email) {
        // Standard email regex pattern check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
    }

    function setFieldError(inputElement, errorElement, message) {
        inputElement.classList.add('is-invalid');
        errorElement.textContent = message;
    }

    function clearFieldError(inputElement, errorElement) {
        inputElement.classList.remove('is-invalid');
        errorElement.textContent = '';
    }

    /* --------------------------------------------------------------------------
       3. LOGIN FORM VALIDATION
       -------------------------------------------------------------------------- */
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        const emailInput = document.getElementById('login-email');
        const passwordInput = document.getElementById('login-password');
        const emailError = document.getElementById('login-email-error');
        const passwordError = document.getElementById('login-password-error');

        // Clear error as user types
        emailInput.addEventListener('input', () => clearFieldError(emailInput, emailError));
        passwordInput.addEventListener('input', () => clearFieldError(passwordInput, passwordError));

        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            let isValid = true;

            // Email check
            if (!emailInput.value.trim()) {
                setFieldError(emailInput, emailError, 'Email address is required.');
                isValid = false;
            } else if (!isValidEmail(emailInput.value)) {
                setFieldError(emailInput, emailError, 'Please enter a valid email address.');
                isValid = false;
            }

            // Password check
            if (!passwordInput.value) {
                setFieldError(passwordInput, passwordError, 'Password is required.');
                isValid = false;
            }

            if (isValid) {
                // Front-end interface check passed.
                // NOTE: When Subhranil hooks up Flask backend routes, we will dispatch
                // a POST fetch request to /api/auth/login with the form data.
                window.location.href = 'index.html';
            }
        });
    }

    /* --------------------------------------------------------------------------
       4. SIGNUP FORM VALIDATION
       -------------------------------------------------------------------------- */
    const signupForm = document.getElementById('signup-form');

    if (signupForm) {
        const nameInput = document.getElementById('signup-name');
        const emailInput = document.getElementById('signup-email');
        const passwordInput = document.getElementById('signup-password');
        const nameError = document.getElementById('signup-name-error');
        const emailError = document.getElementById('signup-email-error');
        const passwordError = document.getElementById('signup-password-error');

        // Clear errors on input
        nameInput.addEventListener('input', () => clearFieldError(nameInput, nameError));
        emailInput.addEventListener('input', () => clearFieldError(emailInput, emailError));
        passwordInput.addEventListener('input', () => clearFieldError(passwordInput, passwordError));

        signupForm.addEventListener('submit', (event) => {
            event.preventDefault();
            let isValid = true;

            // Full Name check
            if (!nameInput.value.trim()) {
                setFieldError(nameInput, nameError, 'Full name is required.');
                isValid = false;
            }

            // Email check
            if (!emailInput.value.trim()) {
                setFieldError(emailInput, emailError, 'Email address is required.');
                isValid = false;
            } else if (!isValidEmail(emailInput.value)) {
                setFieldError(emailInput, emailError, 'Please enter a valid email address.');
                isValid = false;
            }

            // Password strength check (minimum 8 characters)
            if (!passwordInput.value) {
                setFieldError(passwordInput, passwordError, 'Password is required.');
                isValid = false;
            } else if (passwordInput.value.length < 8) {
                setFieldError(passwordInput, passwordError, 'Password must be at least 8 characters long.');
                isValid = false;
            }

            if (isValid) {
                // Front-end registration check passed.
                // NOTE: When Subhranil hooks up Flask backend routes, we will dispatch
                // a POST fetch request to /api/auth/signup with the payload.
                window.location.href = 'index.html';
            }
        });
    }

});