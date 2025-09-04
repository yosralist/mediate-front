'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { APICache, HealthAPI, CacheAPI } from '../services/database';
import { healthCheck, fusekiPing } from '../services/api';

interface UserStats {
    projectCount: number | null;
    simulationCount: number | null;
    lastActivity: string | null;
    completedProjects: number | null;
}

interface SystemStats {
    apiStatus: 'healthy' | 'unhealthy' | 'checking';
    fusekiStatus: 'healthy' | 'unhealthy' | 'checking';
    databaseStatus: 'healthy' | 'unhealthy' | 'checking';
    cacheStats?: {
        total_entries: number;
        total_size: number;
        hit_rate: number;
        expired_entries: number;
    };
}

export default function DashboardStats() {
    const { user, userPreferences } = useAuth();
    const [userStats, setUserStats] = useState<UserStats>({
        projectCount: null,
        simulationCount: null,
        lastActivity: null,
        completedProjects: null
    });
    const [systemStats, setSystemStats] = useState<SystemStats>({
        apiStatus: 'checking',
        fusekiStatus: 'checking',
        databaseStatus: 'checking',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchStats();
        checkSystemHealth();
    }, [user]);

    const fetchStats = async () => {
        if (!user) return;

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const cacheKey = `user_stats_${user.id}`;

            // Try to get cached user stats first
            const cachedStats = await APICache.getCachedResponse(cacheKey, {}, user.id);
            if (cachedStats) {
                setUserStats(cachedStats);
                setLoading(false);
                return;
            }

            // Fetch user statistics from backend API
            const statsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/user/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (statsResponse.ok) {
                const statsData = await statsResponse.json();
                const newStats = {
                    projectCount: statsData.project_count || 0,
                    simulationCount: statsData.simulation_count || 0,
                    lastActivity: statsData.last_activity || 'No recent activity',
                    completedProjects: statsData.completed_projects || 0
                };

                setUserStats(newStats);

                // Cache the stats for 5 minutes
                await APICache.setCachedResponse(cacheKey, newStats, {}, user.id, 5);
            } else {
                setError('Failed to load statistics from server');
            }

            setLoading(false);

        } catch (err) {
            setError('Failed to load statistics');
            setLoading(false);
            console.error('Error fetching stats:', err);
        }
    };

    const checkSystemHealth = async () => {
        try {
            const cacheKey = 'system_health';
            const cachedHealth = await APICache.getCachedResponse(cacheKey, {}, user?.id);

            if (cachedHealth && Date.now() - new Date(cachedHealth.lastChecked).getTime() < 60000) {
                setSystemStats(cachedHealth);
                return;
            }

            // Check API health
            const apiResponse = await healthCheck();
            const apiStatus: 'healthy' | 'unhealthy' = apiResponse.error ? 'unhealthy' : 'healthy';

            // Check Fuseki
            const fusekiResponse = await fusekiPing();
            const fusekiStatus: 'healthy' | 'unhealthy' = fusekiResponse.error ? 'unhealthy' : 'healthy';

            // Check MongoDB health
            const dbResponse = await HealthAPI.check();
            const databaseStatus: 'healthy' | 'unhealthy' = dbResponse.status === 'healthy' ? 'healthy' : 'unhealthy';

            // Get cache statistics
            const cacheStats = await CacheAPI.getStats();

            const newSystemStats = {
                apiStatus,
                fusekiStatus,
                databaseStatus,
                cacheStats: cacheStats || undefined,
                lastChecked: new Date(),
            };

            setSystemStats(newSystemStats);

            // Cache system health for 1 minute
            await APICache.setCachedResponse(cacheKey, newSystemStats, {}, user?.id, 1);
        } catch (error) {
            console.error('Error checking system health:', error);
            setSystemStats(prev => ({
                ...prev,
                apiStatus: 'unhealthy',
                fusekiStatus: 'unhealthy',
                databaseStatus: 'unhealthy',
            }));
        }
    };

    // Function to update stats from other components (call this after simulations)
    const updateStats = async (newStats: Partial<UserStats>) => {
        try {
            const token = localStorage.getItem('token');

            // Update stats on backend
            const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/user/stats/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    project_count: newStats.projectCount,
                    simulation_count: newStats.simulationCount,
                    last_activity: newStats.lastActivity,
                    completed_projects: newStats.completedProjects
                }),
            });

            if (updateResponse.ok) {
                // Clear cache and refresh stats after update
                const cacheKey = `user_stats_${user?.id}`;
                await CacheAPI.delete(cacheKey, user?.id);
                fetchStats();
            } else {
                console.error('Failed to update stats on server');
            }
        } catch (err) {
            console.error('Error updating stats:', err);
        }
    };

    // Expose update function globally so other components can update stats
    useEffect(() => {
        (window as any).updateDashboardStats = updateStats;
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy': return 'var(--success-color)';
            case 'unhealthy': return 'var(--error-color)';
            case 'checking': return 'var(--warning-color)';
            default: return 'var(--text-secondary)';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'healthy': return 'Online';
            case 'unhealthy': return 'Offline';
            case 'checking': return 'Checking...';
            default: return 'Unknown';
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (loading) {
        return (
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                marginTop: '2rem'
            }}>
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} style={{
                        padding: '1.5rem',
                        backgroundColor: 'var(--background-color)',
                        borderRadius: 'var(--border-radius)',
                        border: '1px solid var(--border-color)',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            height: '2rem',
                            backgroundColor: 'var(--border-color)',
                            borderRadius: 'var(--border-radius)',
                            marginBottom: '0.5rem',
                            animation: 'pulse 2s infinite'
                        }}></div>
                        <div style={{
                            height: '1rem',
                            backgroundColor: 'var(--border-color)',
                            borderRadius: 'var(--border-radius)',
                            width: '80%',
                            margin: '0 auto'
                        }}></div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                padding: '1.5rem',
                backgroundColor: 'var(--card-background)',
                borderRadius: 'var(--border-radius)',
                border: '1px solid var(--error-color)',
                textAlign: 'center',
                marginTop: '2rem'
            }}>
                <div style={{ color: 'var(--error-color)', marginBottom: '0.5rem' }}>
                    ⚠️ {error}
                </div>
                <button
                    onClick={() => window.location.reload()}
                    style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: 'var(--primary-color)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--border-radius)',
                        cursor: 'pointer'
                    }}
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginTop: '2rem'
        }}>
            {/* User Stats */}
            <div style={{
                padding: '1.5rem',
                backgroundColor: 'var(--background-color)',
                borderRadius: 'var(--border-radius)',
                border: '1px solid var(--border-color)',
                textAlign: 'center',
                transition: 'transform 0.2s ease'
            }}>
                <div style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: 'var(--primary-color)',
                    marginBottom: '0.5rem'
                }}>
                    {userStats.projectCount ?? 0}
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>
                    Active Projects
                </div>
            </div>

            <div style={{
                padding: '1.5rem',
                backgroundColor: 'var(--background-color)',
                borderRadius: 'var(--border-radius)',
                border: '1px solid var(--border-color)',
                textAlign: 'center',
                transition: 'transform 0.2s ease'
            }}>
                <div style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: 'var(--primary-color)',
                    marginBottom: '0.5rem'
                }}>
                    {userStats.simulationCount ?? 0}
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>
                    Simulations Run
                </div>
            </div>

            {/* System Health Stats */}
            <div style={{
                padding: '1.5rem',
                backgroundColor: 'var(--background-color)',
                borderRadius: 'var(--border-radius)',
                border: '1px solid var(--border-color)',
                textAlign: 'center'
            }}>
                <div style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.5rem'
                }}>
                    Database
                </div>
                <div style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: getStatusColor(systemStats.databaseStatus),
                    marginBottom: '0.25rem'
                }}>
                    {getStatusText(systemStats.databaseStatus)}
                </div>
                <div style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: getStatusColor(systemStats.databaseStatus),
                    borderRadius: '50%',
                    margin: '0 auto'
                }}></div>
            </div>

            {/* Cache Stats */}
            {systemStats.cacheStats && (
                <div style={{
                    padding: '1.5rem',
                    backgroundColor: 'var(--background-color)',
                    borderRadius: 'var(--border-radius)',
                    border: '1px solid var(--border-color)',
                    textAlign: 'center'
                }}>
                    <div style={{
                        fontSize: '0.9rem',
                        color: 'var(--text-secondary)',
                        marginBottom: '0.5rem'
                    }}>
                        Cache
                    </div>
                    <div style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        marginBottom: '0.25rem'
                    }}>
                        {systemStats.cacheStats.total_entries}
                    </div>
                    <div style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)'
                    }}>
                        {formatBytes(systemStats.cacheStats.total_size)}
                    </div>
                </div>
            )}

            {/* User Preferences Status */}
            {user && (
                <div style={{
                    padding: '1.5rem',
                    backgroundColor: 'var(--background-color)',
                    borderRadius: 'var(--border-radius)',
                    border: '1px solid var(--border-color)',
                    textAlign: 'center'
                }}>
                    <div style={{
                        fontSize: '0.9rem',
                        color: 'var(--text-secondary)',
                        marginBottom: '0.5rem'
                    }}>
                        Profile
                    </div>
                    <div style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: userPreferences ? 'var(--success-color)' : 'var(--warning-color)',
                        marginBottom: '0.25rem'
                    }}>
                        {userPreferences ? 'Loaded' : 'Loading...'}
                    </div>
                    <div style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)'
                    }}>
                        Preferences
                    </div>
                </div>
            )}

            <div style={{
                padding: '1.5rem',
                backgroundColor: 'var(--background-color)',
                borderRadius: 'var(--border-radius)',
                border: '1px solid var(--border-color)',
                textAlign: 'center',
                transition: 'transform 0.2s ease'
            }}>
                <div style={{
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    marginBottom: '0.5rem',
                    minHeight: '2rem'
                }}>
                    {userStats.lastActivity ?? 'No data'}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Last Activity
                </div>
            </div>
        </div>
    );
}
