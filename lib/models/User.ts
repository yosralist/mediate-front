import { ObjectId } from 'mongodb';

export interface UserPreferences {
    _id?: ObjectId;
    userId: number; // This matches the user ID from your API
    username: string;
    email: string;
    institute_id: number;
    preferences: {
        theme?: 'light' | 'dark' | 'auto';
        language?: string;
        notifications?: {
            email: boolean;
            browser: boolean;
            workflow_completion: boolean;
            system_updates: boolean;
        };
        dashboard?: {
            show_recent_activity: boolean;
            show_quick_stats: boolean;
            default_view: 'overview' | 'detailed';
        };
        workflow?: {
            auto_save: boolean;
            default_parameters: {
                microstructure?: Partial<any>;
                sofc?: Partial<any>;
            };
        };
    };
    settings: {
        timezone?: string;
        date_format?: string;
        number_format?: string;
    };
    last_login?: Date;
    created_at: Date;
    updated_at: Date;
}

export const defaultUserPreferences = {
    preferences: {
        theme: 'auto' as const,
        language: 'en',
        notifications: {
            email: true,
            browser: true,
            workflow_completion: true,
            system_updates: false,
        },
        dashboard: {
            show_recent_activity: true,
            show_quick_stats: true,
            default_view: 'overview' as const,
        },
        workflow: {
            auto_save: true,
            default_parameters: {},
        },
    },
    settings: {
        timezone: 'UTC',
        date_format: 'YYYY-MM-DD',
        number_format: 'en-US',
    },
};

// Helper functions for user preferences
export class UserPreferencesService {
    static async createUserPreferences(
        userId: number,
        username: string,
        email: string,
        institute_id: number
    ): Promise<UserPreferences> {
        return {
            userId,
            username,
            email,
            institute_id,
            ...defaultUserPreferences,
            last_login: new Date(),
            created_at: new Date(),
            updated_at: new Date(),
        };
    }

    static async updateLastLogin(preferences: UserPreferences): Promise<UserPreferences> {
        return {
            ...preferences,
            last_login: new Date(),
            updated_at: new Date(),
        };
    }

    static async updatePreferences(
        preferences: UserPreferences,
        updates: Partial<UserPreferences['preferences']>
    ): Promise<UserPreferences> {
        return {
            ...preferences,
            preferences: {
                ...preferences.preferences,
                ...updates,
            },
            updated_at: new Date(),
        };
    }
}
