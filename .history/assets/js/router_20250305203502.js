import { auth } from './firebase-config.js';
import { signOut } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

class Router {
    constructor() {
        this.routes = {
            public: ['login.html', 'register.html'],
            private: [
                'index.html',
                'pages/colleges.html',
                'pages/departements.html',
                'pages/teachers.html',
                'pages/students.html',
                'pages/subjects.html',
                'pages/grades.html'
            ]
        };
        
        this.initializeAuth();
    }

    initializeAuth() {
        auth.onAuthStateChanged(user => {
            const currentPath = window.location.pathname;
            console.log('Current path:', currentPath);
            console.log('User:', user);

            if (!user && !this.isPublicRoute(currentPath)) {
                console.log('No user found, redirecting to login');
                this.redirectToLogin();
            } else if (user) {
                console.log('User is logged in:', user.email);
            }
        });
    }

    isPublicRoute(path) {
        return this.routes.public.some(route => path.toLowerCase().endsWith(route.toLowerCase()));
    }

    redirectToLogin() {
        window.location.replace('./login.html');
    }

    redirectToDashboard() {
        window.location.replace('./index.html');
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
