import { createContext, useContext, useState } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext(null);

function decodeToken(token) {
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (payload.exp * 1000 < Date.now()) return null;
    return payload;
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(decodeToken(localStorage.getItem('token')));

    const login = async (username, password) => {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        const response = await apiClient.post('/auth/token', formData);
        localStorage.setItem('token', response.data.access_token);
        setUser(decodeToken(response.data.access_token));
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const value = {
        user,
        login,
        logout,
        isAdmin: user?.role === 'Farm Operations Admin',
        isFieldHand: user?.role === 'Field Hand',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}
