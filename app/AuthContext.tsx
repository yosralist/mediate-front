'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getCurrentUser } from './services/api';
import { UserPreferencesAPI } from './services/database';
import { UserPreferences } from '@/lib/models/User';

interface User {
    id: number;
    username: string;
    email: string;
    institute_id: number;
}

interface AuthContextType {
    user: User | null;
    userPreferences: UserPreferences | null;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string, institute_name: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
    updatePreferences: (preferences: Partial<UserPreferences['preferences']>) => Promise<void>;
    refreshPreferences: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
    const [loading, setLoading] = useState(true);

    // Load user preferences from MongoDB
    const loadUserPreferences = async (userId: number) => {
        try {
            let preferences = await UserPreferencesAPI.get(userId);

            // If preferences don't exist, create them
            if (!preferences && user) {
                preferences = await UserPreferencesAPI.create(
                    user.id,
                    user.username,
                    user.email,
                    user.institute_id
                );
            }

            setUserPreferences(preferences);
        } catch (error) {
            console.error('Error loading user preferences:', error);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            getCurrentUser(token)
                .then(response => {
                    if (response.data) {
                        setUser(response.data);
                        // Load user preferences after setting user
                        loadUserPreferences(response.data.id);
                    }
                })
                .catch(() => {
                    // Clear invalid token
                    localStorage.removeItem('token');
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            // Wait a small amount to ensure consistent behavior
            setTimeout(() => setLoading(false), 100);
        }
    }, []);

    // Load preferences when user changes
    useEffect(() => {
        if (user && !userPreferences) {
            loadUserPreferences(user.id);
        }
    }, [user]);

    const login = async (username: string, password: string) => {
        const response = await loginUser({ username, password });

        if (response.error) {
            throw new Error(response.error);
        }

        if (response.data) {
            localStorage.setItem('token', response.data.access_token);
            // Fetch user details after successful login
            const userResponse = await getCurrentUser(response.data.access_token);
            if (userResponse.data) {
                setUser(userResponse.data);
                // Load user preferences
                await loadUserPreferences(userResponse.data.id);
            }
        } else {
            throw new Error('Login failed: No data received');
        }
    };

    const register = async (username: string, email: string, password: string, institute_name: string) => {
        const response = await registerUser({ username, email, password, institute_name });

        if (response.error) {
            throw new Error(response.error);
        }

        if (!response.data) {
            throw new Error('Registration failed: No data received');
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setUserPreferences(null);
    };

    const updatePreferences = async (preferences: Partial<UserPreferences['preferences']>) => {
        if (!user) return;

        try {
            const updated = await UserPreferencesAPI.update(user.id, preferences);
            if (updated) {
                setUserPreferences(updated);
            }
        } catch (error) {
            console.error('Error updating preferences:', error);
            throw error;
        }
    };

    const refreshPreferences = async () => {
        if (!user) return;
        await loadUserPreferences(user.id);
    };

    return (
        <AuthContext.Provider value={{
            user,
            userPreferences,
            login,
            register,
            logout,
            loading,
            updatePreferences,
            refreshPreferences
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
