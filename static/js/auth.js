
/* ==========================================================================
   GAREEBI TRACKER — AUTHENTICATION LOGIC
   Handles password visibility, form validation and backend connection.
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

        emailInput.addEventListener('input', () =>
            clearFieldError(emailInput, emailError)
        );

        passwordInput.addEventListener('input', () =>
            clearFieldError(passwordInput, passwordError)
        );

        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();

            let isValid = true;

            if (!emailInput.value.trim()) {
                setFieldError(emailInput, emailError, 'Email address is required.');
                isValid = false;
            } else if (!isValidEmail(emailInput.value)) {
                setFieldError(emailInput, emailError, 'Please enter a valid email address.');
                isValid = false;
            }

            if (!passwordInput.value) {
                setFieldError(passwordInput, passwordError, 'Password is required.');
                isValid = false;
            }

            if (isValid) {
                alert('Login backend connection is our next step.');
            }
        });
    }


    /* --------------------------------------------------------------------------
       4. SIGNUP FORM VALIDATION + BACKEND CONNECTION
       -------------------------------------------------------------------------- */

    const signupForm = document.getElementById('signup-form');

    if (signupForm) {
        const nameInput = document.getElementById('signup-name');
        const emailInput = document.getElementById('signup-email');
        const passwordInput = document.getElementById('signup-password');

        const nameError = document.getElementById('signup-name-error');
        const emailError = document.getElementById('signup-email-error');
        const passwordError = document.getElementById('signup-password-error');

        const submitButton = signupForm.querySelector('button[type="submit"]');

        // Clear errors as the user types
        nameInput.addEventListener('input', () =>
            clearFieldError(nameInput, nameError)
        );

        emailInput.addEventListener('input', () =>
            clearFieldError(emailInput, emailError)
        );

        passwordInput.addEventListener('input', () =>
            clearFieldError(passwordInput, passwordError)
        );

        signupForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            let isValid = true;

            // Full name validation
            if (!nameInput.value.trim()) {
                setFieldError(nameInput, nameError, 'Full name is required.');
                isValid = false;
            }

            // Email validation
            if (!emailInput.value.trim()) {
                setFieldError(emailInput, emailError, 'Email address is required.');
                isValid = false;
            } else if (!isValidEmail(emailInput.value)) {
                setFieldError(emailInput, emailError, 'Please enter a valid email address.');
                isValid = false;
            }

            // Password validation
            if (!passwordInput.value) {
                setFieldError(passwordInput, passwordError, 'Password is required.');
                isValid = false;
            } else if (passwordInput.value.length < 8) {
                setFieldError(passwordInput, passwordError, 'Password must be at least 8 characters long.');
                isValid = false;
            }

            // Stop if frontend validation fails
            if (!isValid) {
                return;
            }

            try {
                // Prevent multiple submissions
                submitButton.disabled = true;
                submitButton.textContent = 'Creating Account...';

                // Send signup details to Flask backend
                const response = await fetch('/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        full_name: nameInput.value.trim(),
                        email: emailInput.value.trim(),
                        password: passwordInput.value
                    })
                });

                const result = await response.json();

                // Handle backend errors
                if (!response.ok) {
                    alert(result.error || 'Registration failed.');
                    return;
                }

                // Registration successful
                alert('Account created successfully! Please login.');

                window.location.href = '/login';

            } catch (error) {
                // Handle network or server errors
                console.error('Signup error:', error);
                alert('Unable to connect to the server. Please try again.');

            } finally {
                // Restore button if still on signup page
                submitButton.disabled = false;
                submitButton.textContent = 'Create Account';
            }
        });
    }

});
