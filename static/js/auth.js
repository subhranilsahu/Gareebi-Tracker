
/* ==========================================================================
   GAREEBI TRACKER — AUTHENTICATION LOGIC
   Handles password visibility, validation and Flask backend connection.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // 1. PASSWORD SHOW / HIDE TOGGLE

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


    // 2. VALIDATION HELPERS

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


    // 3. LOGIN FORM + BACKEND CONNECTION

    const loginForm = document.getElementById('login-form');

    if (loginForm) {

        const emailInput = document.getElementById('login-email');
        const passwordInput = document.getElementById('login-password');

        const emailError = document.getElementById('login-email-error');
        const passwordError = document.getElementById('login-password-error');

        const submitButton = loginForm.querySelector('button[type="submit"]');

        emailInput.addEventListener('input', () =>
            clearFieldError(emailInput, emailError)
        );

        passwordInput.addEventListener('input', () =>
            clearFieldError(passwordInput, passwordError)
        );

        loginForm.addEventListener('submit', async (event) => {

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

            if (!isValid) return;

            try {

                submitButton.disabled = true;
                submitButton.textContent = 'Logging in...';

                const response = await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: emailInput.value.trim(),
                        password: passwordInput.value
                    })
                });

                const result = await response.json();

                if (!response.ok) {
                    alert(result.error || 'Login failed. Please try again.');
                    return;
                }

                // Login successful: open dashboard
                window.location.href = result.redirect || '/dashboard';

            } catch (error) {

                console.error('Login error:', error);
                alert('Unable to connect to the server. Please try again.');

            } finally {

                submitButton.disabled = false;
                submitButton.textContent = 'Sign In to Dashboard';

            }
        });
    }


    // 4. SIGNUP FORM + BACKEND CONNECTION

    const signupForm = document.getElementById('signup-form');

    if (signupForm) {

        const nameInput = document.getElementById('signup-name');
        const emailInput = document.getElementById('signup-email');
        const passwordInput = document.getElementById('signup-password');

        const nameError = document.getElementById('signup-name-error');
        const emailError = document.getElementById('signup-email-error');
        const passwordError = document.getElementById('signup-password-error');

        const submitButton = signupForm.querySelector('button[type="submit"]');

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

            if (!nameInput.value.trim()) {
                setFieldError(nameInput, nameError, 'Full name is required.');
                isValid = false;
            }

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
            } else if (passwordInput.value.length < 8) {
                setFieldError(passwordInput, passwordError, 'Password must be at least 8 characters long.');
                isValid = false;
            }

            if (!isValid) return;

            try {

                submitButton.disabled = true;
                submitButton.textContent = 'Creating Account...';

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

                if (!response.ok) {
                    alert(result.error || 'Registration failed.');
                    return;
                }

                // Signup successful: backend has created the session
                alert('Account created successfully! Welcome to Gareebi Tracker.');

                window.location.href = result.redirect || '/dashboard';

            } catch (error) {

                console.error('Signup error:', error);
                alert('Unable to connect to the server. Please try again.');

            } finally {

                submitButton.disabled = false;
                submitButton.textContent = 'Create Account';

            }
        });
    }

});
