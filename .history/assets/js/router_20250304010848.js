import { auth } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

class Router {
    constructor() {
        this.routes = {
            public: ['/login.html'],
            private: [
                '/',
                '/index.html',
                '/pages/colleges.html',
                '/pages/departements.html',
                '/pages/teachers.html',
                '/pages/students.html',
                '/pages/subjects.html',
                '/pages/grades.html'
            ]
        };
        
        this.initializeAuth();
        this.handleNavigation();
    }

    initializeAuth() {
        onAuthStateChanged(auth, (user) => {
            const currentPath = window.location.pathname;
            
            if (!user && !this.isPublicRoute(currentPath)) {
                this.redirectToLogin();
            }
            
            if (user && this.isPublicRoute(currentPath)) {
                this.redirectToDashboard();
            }
        });
    }

    handleNavigation() {
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                e.preventDefault();
                const path = e.target.getAttribute('href');
                this.navigate(path);
            }
        });

        // Gérer le bouton retour du navigateur
        window.addEventListener('popstate', () => {
            const currentPath = window.location.pathname;
            this.checkAuth(currentPath);
        });
    }

    isPublicRoute(path) {
        return this.routes.public.some(route => path.endsWith(route));
    }

    async checkAuth(path) {
        const user = await this.getCurrentUser();
        if (!user && !this.isPublicRoute(path)) {
            this.redirectToLogin();
            return false;
        }
        return true;
    }

    getCurrentUser() {
        return new Promise((resolve) => {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                unsubscribe();
                resolve(user);
            });
        });
    }

    redirectToLogin() {
        const currentPath = window.location.pathname;
        if (!this.isPublicRoute(currentPath)) {
            sessionStorage.setItem('redirectUrl', currentPath);
            window.location.href = '/login.html';
        }
    }

    redirectToDashboard() {
        const redirectUrl = sessionStorage.getItem('redirectUrl') || '/index.html';
        sessionStorage.removeItem('redirectUrl');
        window.location.href = redirectUrl;
    }

    async navigate(path) {
        if (await this.checkAuth(path)) {
            window.location.href = path;
        }
    }

    static logout() {
        auth.signOut()
            .then(() => {
                sessionStorage.clear();
                window.location.href = '/login.html';
            })
            .catch((error) => {
                console.error('Erreur lors de la déconnexion:', error);
            });
    }
}

// Créer et exporter l'instance du router
const router = new Router();
export default router;
