/**
 * Router simple pour SPA
 */
class Router {
    constructor() {
        this.routes = [];
        this.currentRoute = null;
        this.notFoundHandler = null;
    }

    /**
     * Ajouter une route
     * @param {string} path - Chemin de la route (peut contenir des paramètres :param)
     * @param {function} handler - Fonction à exécuter pour cette route
     */
    addRoute(path, handler) {
        this.routes.push({
            path: path,
            handler: handler,
            regex: this.pathToRegex(path)
        });
    }

    /**
     * Définir le handler pour les routes non trouvées
     * @param {function} handler - Fonction à exécuter si aucune route ne correspond
     */
    setNotFoundHandler(handler) {
        this.notFoundHandler = handler;
    }

    /**
     * Convertir un chemin en regex pour matcher les paramètres
     * @param {string} path - Chemin à convertir
     * @returns {RegExp} - Regex correspondante
     */
    pathToRegex(path) {
        const escaped = path.replace(/\//g, '\\/');
        const parameterized = escaped.replace(/:([a-zA-Z]+)/g, '([^/]+)');
        return new RegExp(`^${parameterized}$`);
    }

    /**
     * Extraire les paramètres d'une URL
     * @param {string} path - Chemin de la route
     * @param {string} url - URL actuelle
     * @returns {object} - Objet contenant les paramètres
     */
    extractParams(path, url) {
        const params = {};
        const pathParts = path.split('/');
        const urlParts = url.split('/');

        for (let i = 0; i < pathParts.length; i++) {
            if (pathParts[i].startsWith(':')) {
                const paramName = pathParts[i].substring(1);
                params[paramName] = urlParts[i];
            }
        }

        return params;
    }

    /**
     * Naviguer vers une route
     * @param {string} path - Chemin vers lequel naviguer
     */
    navigate(path) {
        window.history.pushState({}, '', `#${path}`);
        this.handleRoute();
    }

    /**
     * Gérer la route actuelle
     */
    handleRoute() {
        const hash = window.location.hash.substring(1) || '/';
        
        for (const route of this.routes) {
            const match = hash.match(route.regex);
            if (match) {
                const params = this.extractParams(route.path, hash);
                this.currentRoute = { path: hash, params };
                route.handler(params);
                return;
            }
        }

        // Aucune route trouvée
        if (this.notFoundHandler) {
            this.notFoundHandler();
        }
    }

    /**
     * Démarrer le routeur
     */
    start() {
        // Gérer les changements d'URL
        window.addEventListener('hashchange', () => this.handleRoute());
        
        // Gérer les liens avec data-route
        document.addEventListener('click', (e) => {
            const link = e.target.closest('[data-route]');
            if (link) {
                e.preventDefault();
                const route = link.getAttribute('data-route');
                this.navigate(route);
            }
        });

        // Gérer la route initiale
        this.handleRoute();
    }

    /**
     * Obtenir la route actuelle
     * @returns {object} - Objet contenant le chemin et les paramètres
     */
    getCurrentRoute() {
        return this.currentRoute;
    }
}
