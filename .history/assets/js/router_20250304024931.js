import { auth } from './firebase-config.js';
import { signOut } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

class Router {
    constructor() {
        // Chemins absolus basés sur le dossier racine du projet
        const basePath = '/college-management';
        
        this.routes = {
            public: [`${basePath}/login.html`, `${basePath}/register.html`],
            private: [
                `${basePath}/`,
                `${basePath}/index.html`,
                `${basePath}/pages/colleges.html`,
                `${basePath}/pages/departements.html`,
                `${basePath}/pages/teachers.html`,
                `${basePath}/pages/students.html`,
                `${basePath}/pages/subjects.html`,
                `${basePath}/pages/grades.html`
            ]
        };
        
        this.initializeAuth();
    }

    initializeAuth() {
        auth.onAuthStateChanged(user => {
            const currentPath = window.location.pathname;
            console.log('Current path:', currentPath);
            console.log('Auth state:', user ? 'logged in' : 'logged out');

            if (!user && !this.isPublicRoute(currentPath)) {
                this.redirectToLogin();
            }
        });
    }

    isPublicRoute(path) {
        return this.routes.public.some(route => path.endsWith(route));
    }

    redirectToLogin() {
        const currentPath = window.location.pathname;
        if (!this.isPublicRoute(currentPath)) {
            sessionStorage.setItem('redirectUrl', currentPath);
            window.location.href = '/college-management/login.html';
        }
    }

    redirectToDashboard() {
        const redirectUrl = sessionStorage.getItem('redirectUrl') || '/college-management/index.html';
        sessionStorage.removeItem('redirectUrl');
        window.location.href = redirectUrl;
    }

    async logout() {
        try {
            await signOut(auth);
            sessionStorage.clear();
            this.redirectToLogin();
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        }
    }
}

const router = new Router();
export default router;
