import { auth } from './firebase-config.js';
import { signOut } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

class Router {
    constructor() {
        // Configure base path for GitHub Pages
        this.basePath = '/college-management';
        
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

    getFullPath(path) {
        // Remove leading slash if exists
        path = path.replace(/^\//, '');
        return `${this.basePath}/${path}`;
    }

    getCurrentPath() {
        // Remove base path from current pathname
        return window.location.pathname.replace(this.basePath, '') || '/';
    }

    checkAuthState() {
        const currentUser = auth.currentUser;
        const currentPath = this.getCurrentPath();
        
        if (!currentUser && !this.isPublicRoute(currentPath)) {
            console.log('No user found, redirecting to login');
            this.redirectToLogin();
            return false;
        }
        return true;
    }

    initializeAuth() {
        auth.onAuthStateChanged(user => {
            const currentPath = this.getCurrentPath();
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
        const currentPath = this.getCurrentPath();
        if (!window.location.pathname.includes('login.html')) {
            sessionStorage.setItem('redirectUrl', currentPath);
            window.location.href = this.getFullPath('login.html');
        }
    }

    redirectToDashboard() {
        const redirectUrl = sessionStorage.getItem('redirectUrl') || 'index.html';
        sessionStorage.removeItem('redirectUrl');
        window.location.href = this.getFullPath(redirectUrl);
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
