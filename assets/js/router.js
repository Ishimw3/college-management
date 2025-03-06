import { auth } from './firebase-config.js';
import { signOut } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

class Router {
    constructor() {
        this.basePath = '/college-management';
        this.routes = {
            public: ['login.html', 'register.html'],
            private: ['index.html', 'pages/']
        };
        
        this.initializeAuth();
    }

    initializeAuth() {
        auth.onAuthStateChanged(user => {
            const currentPath = this.getCurrentPath();
            console.log('Auth state changed -', { currentPath, user: user?.email });

            if (!user && !this.isPublicRoute(currentPath)) {
                this.redirectToLogin();
            } else if (user && this.isPublicRoute(currentPath)) {
                this.redirectToDashboard();
            }
        });
    }

    getCurrentPath() {
        const path = window.location.pathname;
        return path.replace(this.basePath, '').replace(/^\/+/, '') || 'index.html';
    }

    isPublicRoute(path) {
        return this.routes.public.some(route => path.includes(route));
    }

    redirectToLogin() {
        if (!window.location.pathname.includes('login.html')) {
            const currentPath = this.getCurrentPath();
            sessionStorage.setItem('redirectUrl', currentPath);
            window.location.replace(`${this.basePath}/login.html`);
        }
    }

    redirectToDashboard() {
        if (window.location.pathname.includes('login.html')) {
            const redirectUrl = sessionStorage.getItem('redirectUrl') || 'index.html';
            sessionStorage.removeItem('redirectUrl');
            window.location.replace(`${this.basePath}/${redirectUrl}`);
        }
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
