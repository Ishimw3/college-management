import { auth } from './firebase-config.js';
import { signOut } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

class Router {
    constructor() {
        // Remove the basePath and use relative paths instead
        this.routes = {
            public: ['/login.html', '/register.html'],
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
        return this.routes.public.some(route => path.includes(route));
    }

    redirectToLogin() {
        const currentPath = window.location.pathname;
        if (!this.isPublicRoute(currentPath)) {
            sessionStorage.setItem('redirectUrl', currentPath);
            window.location.href = 'login.html';
        }
    }

    redirectToDashboard() {
        const redirectUrl = sessionStorage.getItem('redirectUrl') || 'index.html';
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
