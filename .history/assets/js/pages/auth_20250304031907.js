import { 
    signInWithEmailAndPassword,
    browserLocalPersistence,
    setPersistence
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { auth } from '../firebase-config.js';
import router from '../router.js';

class AuthManager {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.errorMessage = document.getElementById('error-message');
        this.submitButton = this.form.querySelector('button[type="submit"]');
        this.initializeListeners();
    }

    initializeListeners() {
        this.form.addEventListener('submit', this.handleLogin.bind(this));
        document.getElementById('forgotPassword')?.addEventListener('click', this.handleForgotPassword.bind(this));
        document.getElementById('registerLink')?.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'register.html';
        });
    }

    async handleLogin(e) {
        e.preventDefault();
        this.submitButton.disabled = true;
        this.submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connexion...';

        try {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // Set persistence before sign in
            await setPersistence(auth, browserLocalPersistence);
            
            // Sign in
            await signInWithEmailAndPassword(auth, email, password);
            
            // Redirect after successful login
            const redirectUrl = sessionStorage.getItem('redirectUrl') || 'index.html';
            window.location.href = redirectUrl;

        } catch (error) {
            console.error('Login error:', error);
            this.showError(this.getErrorMessage(error.code));
            this.submitButton.disabled = false;
            this.submitButton.textContent = 'Se connecter';
        }
    }

    async handleForgotPassword(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        if (!email) {
            this.showError('Veuillez entrer votre email');
            return;
        }

        try {
            await sendPasswordResetEmail(this.auth, email);
            this.showError('Email de réinitialisation envoyé!', 'success');
        } catch (error) {
            this.showError(this.getErrorMessage(error.code));
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            await createUserWithEmailAndPassword(this.auth, email, password);
            window.location.href = 'index.html';
        } catch (error) {
            this.showError(this.getErrorMessage(error.code));
        }
    }

    showError(message, type = 'error') {
        this.errorMessage.textContent = message;
        this.errorMessage.className = `error-message ${type}`;
    }

    getErrorMessage(code) {
        const messages = {
            'auth/wrong-password': 'Mot de passe incorrect',
            'auth/user-not-found': 'Utilisateur non trouvé',
            'auth/invalid-email': 'Email invalide',
            'auth/email-already-in-use': 'Email déjà utilisé',
            'auth/weak-password': 'Mot de passe trop faible'
        };
        return messages[code] || 'Une erreur est survenue';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
});
