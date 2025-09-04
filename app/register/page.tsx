'use client';

import { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        institute_name: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const router = useRouter();

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        // Username validation
        if (!formData.username) {
            newErrors.username = 'Username is required';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters';
        }

        // Email validation
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        // Institute name validation
        if (!formData.institute_name) {
            newErrors.institute_name = 'Institute name is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            await register(formData.username, formData.email, formData.password, formData.institute_name);
            router.push('/login');
        } catch (err) {
            setErrors({ submit: err instanceof Error ? err.message : 'Registration failed' });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    return (
        <div className="form-container">
            <h1 className="form-title">Register</h1>

            <form onSubmit={handleSubmit} className="form">
                <div className="form-group">
                    <label htmlFor="username" className="form-label">Username:</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                        className={`form-input ${errors.username ? 'error' : ''}`}
                    />
                    {errors.username && <div className="form-error">{errors.username}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="email" className="form-label">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className={`form-input ${errors.email ? 'error' : ''}`}
                    />
                    {errors.email && <div className="form-error">{errors.email}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="password" className="form-label">Password:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className={`form-input ${errors.password ? 'error' : ''}`}
                    />
                    {errors.password && <div className="form-error">{errors.password}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="confirmPassword" className="form-label">Confirm Password:</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                    />
                    {errors.confirmPassword && <div className="form-error">{errors.confirmPassword}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="institute_name" className="form-label">Institute Name:</label>
                    <input
                        type="text"
                        id="institute_name"
                        name="institute_name"
                        value={formData.institute_name}
                        onChange={handleInputChange}
                        required
                        className={`form-input ${errors.institute_name ? 'error' : ''}`}
                    />
                    {errors.institute_name && <div className="form-error">{errors.institute_name}</div>}
                </div>

                {errors.submit && <div className="alert alert-error">{errors.submit}</div>}

                <button
                    type="submit"
                    disabled={loading}
                    className="form-button"
                >
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>

            <p className="form-link">
                Already have an account?{' '}
                <a href="/login">Login here</a>
            </p>
        </div>
    );
}
