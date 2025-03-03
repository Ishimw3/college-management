import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { app } from '../firebase-config.js';

class AuthManager {
    constructor() {
        this.auth = getAuth(app);
        this.form = document.getElementById('loginForm');
        this.errorMessage = document.getElementById('error-message');
        this.initializeListeners();
        this.checkAuthState();
    }

    initializeListeners() {
        this.form.addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('forgotPassword').addEventListener('click', (e) => this.handleForgotPassword(e));
        document.getElementById('registerLink').addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'register.html';
        });
    }

    checkAuthState() {
        this.auth.onAuthStateChanged(user => {
            if (user) {
                window.location.href = 'index.html';
            }
        });
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            await signInWithEmailAndPassword(this.auth, email, password);
            window.location.href = 'index.html';
        } catch (error) {
            this.showError(this.getErrorMessage(error.code));
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
