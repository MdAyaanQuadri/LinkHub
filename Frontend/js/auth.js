const auth = {
    async signup(userData) {
        const response = await api.post('/auth/signup', userData);
        if (response.token) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
        }
        return response;
    },

    async login(credentials) {
        const response = await api.post('/auth/login', credentials);
        if (response.token) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
        }
        return response;
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    },

    isAuthenticated() {
        return !!localStorage.getItem('token');
    },

    getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
};

window.auth = auth;
