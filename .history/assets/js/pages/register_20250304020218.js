import { auth, db } from '../firebase-config.js';
import { 
    createUserWithEmailAndPassword,
    sendEmailVerification 
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { 
    doc, 
    setDoc 
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

class RegisterManager {
    constructor() {
        this.form = document.getElementById('registerForm');
        this.errorMessage = document.getElementById('error-message');
        this.submitButton = this.form.querySelector('button[type="submit"]');
        this.initializeListeners();

        // Vérifier l'initialisation de Firebase
        console.log('Auth state:', auth.currentUser);
    }

    initializeListeners() {
        // Écouter la soumission du formulaire
        this.form.addEventListener('submit', this.handleRegister.bind(this));

        // Vérifier les mots de passe en temps réel
        this.form.addEventListener('input', () => {
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (password && confirmPassword) {
                if (password !== confirmPassword) {
                    this.showError('Les mots de passe ne correspondent pas');
                    this.submitButton.disabled = true;
                } else {
                    this.hideError();
                    this.submitButton.disabled = false;
                }
            }
        });
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validation
        if (!this.validateForm(email, password, confirmPassword)) return;

        try {
            this.submitButton.disabled = true;
            this.submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Création du compte...';

            // Debug log
            console.log('Attempting to create user with email:', email);

            // Créer l'utilisateur dans Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            console.log('User created successfully:', user.uid);

            // Envoyer un email de vérification
            await sendEmailVerification(user);

            // Créer le profil utilisateur dans Firestore
            await setDoc(doc(db, "users", user.uid), {
                email: email,
                role: 'user',
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                isEmailVerified: false
            });

            // Afficher le message de succès
            this.showSuccess('Compte créé avec succès! Vérifiez votre email.');
            
            // Rediriger vers la page de connexion après 2 secondes
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);

        } catch (error) {
            console.error('Detailed error:', error);
            this.showError(this.getErrorMessage(error.code));
        } finally {
            this.submitButton.disabled = false;
            this.submitButton.textContent = 'Créer le compte';
        }
    }

    validateForm(email, password, confirmPassword) {
        if (!email || !password || !confirmPassword) {
            this.showError('Veuillez remplir tous les champs');
            return false;
        }

        if (password !== confirmPassword) {
            this.showError('Les mots de passe ne correspondent pas');
            return false;
        }

        if (password.length < 6) {
            this.showError('Le mot de passe doit contenir au moins 6 caractères');
            return false;
        }

        return true;
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.className = 'error-message error show';
    }

    showSuccess(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.className = 'error-message success show';
    }

    hideError() {
        this.errorMessage.className = 'error-message';
        this.errorMessage.textContent = '';
    }

    getErrorMessage(code) {
        const messages = {
            'auth/email-already-in-use': 'Cette adresse email est déjà utilisée',
            'auth/invalid-email': 'Adresse email invalide',
            'auth/operation-not-allowed': 'L\'inscription n\'est pas activée',
            'auth/weak-password': 'Le mot de passe est trop faible',
            'auth/network-request-failed': 'Erreur de connexion réseau',
            'auth/configuration-not-found': 'Erreur de configuration Firebase. Veuillez réessayer.',
            'default': 'Une erreur est survenue lors de l\'inscription'
        };
        return messages[code] || messages['default'];
    }
}

// Initialiser le gestionnaire d'inscription quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    const register = new RegisterManager();
    console.log('Register manager initialized');
});
