'use client';

import { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Client-side validation
        if (!username || !password) {
            setError('Username and password are required');
            setLoading(false);
            return;
        }

        try {
            await login(username, password);
            router.push('/');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <h1 className="form-title">Login</h1>

            <form onSubmit={handleSubmit} className="form">
                <div className="form-group">
                    <label htmlFor="username" className="form-label">Username:</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="form-input"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password" className="form-label">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="form-input"
                    />
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <button
                    type="submit"
                    disabled={loading}
                    className="form-button"
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>

            <p className="form-link">
                Don't have an account?{' '}
                <a href="/register">Register here</a>
            </p>
        </div>
    );
}
