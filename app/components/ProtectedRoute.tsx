'use client';

import { useAuth } from '../AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token'); // Check for token in local storage
        if (!loading && !user && !token) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '50vh'
            }}>
                <div>Loading...</div>
            </div>
        );
    }

    return <>{user ? children : null}</>;
};

export default ProtectedRoute;
