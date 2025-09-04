import { ObjectId } from 'mongodb';

export interface UserSession {
    _id?: ObjectId;
    userId: number;
    sessionId: string; // Unique session identifier
    token: string; // JWT or session token
    refreshToken?: string; // Optional refresh token
    userAgent?: string;
    ipAddress?: string;
    location?: {
        country?: string;
        city?: string;
        timezone?: string;
    };
    isActive: boolean;
    lastActivity: Date;
    expiresAt: Date;
    createdAt: Date;
    metadata: {
        loginMethod?: 'password' | 'oauth' | 'sso';
        deviceType?: 'desktop' | 'mobile' | 'tablet';
        browser?: string;
        os?: string;
    };
}

export interface SessionActivity {
    _id?: ObjectId;
    sessionId: string;
    userId: number;
    action: 'login' | 'logout' | 'api_call' | 'page_view' | 'workflow_run';
    details: {
        endpoint?: string;
        page?: string;
        workflow_type?: string;
        duration?: number;
        success?: boolean;
        error?: string;
    };
    timestamp: Date;
    ipAddress?: string;
}

// Helper functions for session management
export class SessionService {
    static createSession(
        userId: number,
        token: string,
        sessionId: string,
        expirationHours: number = 24,
        metadata?: Partial<UserSession['metadata']>
    ): UserSession {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + expirationHours * 60 * 60 * 1000);

        return {
            userId,
            sessionId,
            token,
            isActive: true,
            lastActivity: now,
            expiresAt,
            createdAt: now,
            metadata: {
                loginMethod: 'password',
                deviceType: 'desktop',
                ...metadata,
            },
        };
    }

    static updateActivity(session: UserSession): UserSession {
        return {
            ...session,
            lastActivity: new Date(),
        };
    }

    static deactivateSession(session: UserSession): UserSession {
        return {
            ...session,
            isActive: false,
            lastActivity: new Date(),
        };
    }

    static isExpired(session: UserSession): boolean {
        return new Date() > session.expiresAt;
    }

    static isActive(session: UserSession): boolean {
        return session.isActive && !this.isExpired(session);
    }

    static createActivity(
        sessionId: string,
        userId: number,
        action: SessionActivity['action'],
        details: SessionActivity['details'] = {},
        ipAddress?: string
    ): SessionActivity {
        return {
            sessionId,
            userId,
            action,
            details,
            timestamp: new Date(),
            ipAddress,
        };
    }

    // Session cleanup utilities
    static shouldCleanup(session: UserSession): boolean {
        const inactiveThreshold = 7 * 24 * 60 * 60 * 1000; // 7 days
        const now = new Date();
        return (
            !session.isActive ||
            this.isExpired(session) ||
            (now.getTime() - session.lastActivity.getTime()) > inactiveThreshold
        );
    }
}
