// src/components/router.js
class Router {
    constructor(routes) {
        this.routes = routes;
        this.init();
    }

    init() {
        window.addEventListener('popstate', () => this.handleLocation());
        this.handleLocation();
    }

    handleLocation() {
        const path = window.location.pathname;
        const matchedRoute = this.matchRoute(path);
        if (matchedRoute) {
            matchedRoute.route(matchedRoute.params);
        } else if (this.routes['/']) {
            this.routes['/'](); // Call the default route if available
        } else {
            console.error('No matching route found and no default route defined.');
        }
    }

    navigate(path) {
        window.history.pushState({}, path, window.location.origin + path);
        this.handleLocation();
    }

    matchRoute(path) {
        const pathParts = path.split('/').filter(Boolean);
        for (const [route, handler] of Object.entries(this.routes)) {
            const routeParts = route.split('/').filter(Boolean);
            if (routeParts.length === pathParts.length) {
                const params = {};
                const match = routeParts.every((part, index) => {
                    if (part.startsWith(':')) {
                        const paramName = part.slice(1);
                        params[paramName] = pathParts[index];
                        return true;
                    }
                    return part === pathParts[index];
                });

                if (match) {
                    return { route: handler, params };
                }
            }
        }
        return null;
    }
}

export default Router;
