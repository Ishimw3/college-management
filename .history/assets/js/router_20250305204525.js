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
        
        // Check auth state immediately
        this.checkAuthState();
        // Then initialize auth listener
        this.initializeAuth();
    }

    checkAuthState() {
        const currentUser = auth.currentUser;
        const currentPath = window.location.pathname;
        
        if (!currentUser && !this.isPublicRoute(currentPath)) {
            console.log('No user found, redirecting to login');
            this.redirectToLogin();
            return false;
        }
        return true;
    }

    initializeAuth() {
        auth.onAuthStateChanged(user => {
            const currentPath = window.location.pathname;
            console.log('Auth state changed - Path:', currentPath, 'User:', user?.email);

            if (!user && !this.isPublicRoute(currentPath)) {
                console.log('User logged out, redirecting to login');
                this.redirectToLogin();
            } else if (user && this.isPublicRoute(currentPath)) {
                console.log('User logged in on public route, redirecting to dashboard');
                this.redirectToDashboard();
            }
        });
    }

    isPublicRoute(path) {
        return this.routes.public.some(route => 
            path.toLowerCase().includes(route.toLowerCase())
        );
    }

    redirectToLogin() {
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = '/college-management/login.html';
        }
    }

    redirectToDashboard() {
        window.location.href = '/college-management/index.html';
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
